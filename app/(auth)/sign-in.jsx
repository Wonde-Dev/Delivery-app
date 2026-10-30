import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Keyboard,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { authStyles } from "../../assets/styles/auth.styles";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 15;

const SignInScreen = () => {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, isAmharic, toggleLanguage } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Forgot password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = enter email, 2 = enter code & new password
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState("");

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const getErrorMessage = (err, defaultMsg) => {
    if (err?.errors && err.errors.length > 0) {
      return err.errors[0].longMessage || err.errors[0].message || defaultMsg;
    }
    return err?.message || defaultMsg;
  };

  const handleSignIn = async () => {
    setErrorMessage("");
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      const msg = isAmharic ? "እባክዎን ኢሜይል እና የይለፍ ቃል ያስገቡ" : "Please enter your email and password.";
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "መረጃ ይጎድላል" : "Missing Information", msg);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      const msg = isAmharic ? "እባክዎን ትክክለኛ የኢሜይል አድራሻ ያስገቡ" : "Please enter a valid email address.";
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "የተሳሳተ ኢሜይል" : "Invalid Email", msg);
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const signInAttempt = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        const msg = isAmharic
          ? "መግባት አልተሳካም። እባክዎን መረጃዎን ያረጋግጡ።"
          : "Sign-in incomplete. Please check your credentials.";
        setErrorMessage(msg);
        Alert.alert(isAmharic ? "መግባት አልተሳካም" : "Sign In Incomplete", msg);
      }
    } catch (err) {
      const defaultMsg = isAmharic
        ? "የተሳሳተ ኢሜይል ወይም የይለፍ ቃል አስገብተዋል። እባክዎን እንደገና ይሞክሩ።"
        : "Invalid email or password. Please try again.";
      const message = getErrorMessage(err, defaultMsg);
      setErrorMessage(message);
      Alert.alert(isAmharic ? "የመግባት ስህተት" : "Sign In Error", message);
      console.error("Sign in error:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const openResetModal = () => {
    setResetEmail(email.trim());
    setResetStep(1);
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResetErrorMessage("");
    setShowResetModal(true);
  };

  const handleSendResetCode = async () => {
    setResetErrorMessage("");
    const trimmedEmail = resetEmail.trim();

    if (!trimmedEmail) {
      const msg = isAmharic ? "እባክዎን የኢሜይል አድራሻ ያስገቡ" : "Please enter your email address.";
      setResetErrorMessage(msg);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      const msg = isAmharic ? "እባክዎን ትክክለኛ የኢሜይል አድራሻ ያስገቡ" : "Please enter a valid email address.";
      setResetErrorMessage(msg);
      return;
    }

    if (!isLoaded) return;

    setResetLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: trimmedEmail,
      });
      setResetStep(2);
    } catch (err) {
      const defaultMsg = isAmharic
        ? "የይለፍ ቃል መቀየሪያ ኮድ መላክ አልተሳካም። እባክዎን ኢሜይልዎን ያረጋግጡ።"
        : "Could not send password reset code. Please verify your email.";
      setResetErrorMessage(getErrorMessage(err, defaultMsg));
      console.error("Reset code error:", JSON.stringify(err, null, 2));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetErrorMessage("");
    const trimmedCode = resetCode.trim();

    if (!trimmedCode) {
      const msg = isAmharic ? "እባክዎን የደረስዎትን ማረጋገጫ ኮድ ያስገቡ" : "Please enter the verification code sent to your email.";
      setResetErrorMessage(msg);
      return;
    }

    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      const msg = isAmharic
        ? `አዲሱ የይለፍ ቃል ቢያንስ ${MIN_PASSWORD_LENGTH} ፊደላት ወይም ቁጥሮች መሆን አለበት`
        : `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
      setResetErrorMessage(msg);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      const msg = isAmharic ? "የይለፍ ቃሎቹ አይመሳሰሉም" : "Passwords do not match.";
      setResetErrorMessage(msg);
      return;
    }

    if (!isLoaded) return;

    setResetLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: trimmedCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setShowResetModal(false);
        Alert.alert(
          isAmharic ? "የይለፍ ቃል ተቀይሯል" : "Password Updated",
          isAmharic
            ? "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል! አሁን ገብተዋል።"
            : "Your password has been reset successfully. You are now signed in."
        );
        router.replace("/(tabs)");
      } else {
        const msg = isAmharic
          ? "የይለፍ ቃል መቀየር አልተጠናቀቀም። እባክዎን እንደገና ይሞክሩ።"
          : "Password reset incomplete. Please try again.";
        setResetErrorMessage(msg);
      }
    } catch (err) {
      const defaultMsg = isAmharic
        ? "የተሳሳተ ኮድ ወይም መስፈርት የማያሟላ የይለፍ ቃል። እባክዎን እንደገና ይሞክሩ።"
        : "Invalid code or password does not meet requirements.";
      setResetErrorMessage(getErrorMessage(err, defaultMsg));
      console.error("Password reset error:", JSON.stringify(err, null, 2));
    } finally {
      setResetLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setErrorMessage("");
    passwordRef.current?.focus();
  };

  return (
    <View style={[authStyles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={authStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={authStyles.responsiveCard}>
            {/* Top Bar: Brand Pill on left, Language & Theme Toggles on right */}
            <View style={authStyles.topActionsRow}>
              <View
                style={[
                  authStyles.brandPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons name="fast-food" size={15} color={colors.primary} />
                <Text style={[authStyles.brandPillText, { color: colors.text }]}>Express Eats</Text>
              </View>

              <View style={authStyles.topActionsRight}>
                {/* Language Switcher */}
                <TouchableOpacity
                  style={[
                    authStyles.topActionPill,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={toggleLanguage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="globe-outline" size={15} color={colors.primary} />
                  <Text style={[authStyles.topActionPillText, { color: colors.text }]}>
                    {isAmharic ? "English" : "አማርኛ"}
                  </Text>
                </TouchableOpacity>

                {/* Theme Switcher */}
                <TouchableOpacity
                  style={[
                    authStyles.topActionPill,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={toggleTheme}
                  activeOpacity={0.7}
                >
                  <Ionicons name={isDark ? "sunny" : "moon"} size={15} color={colors.primary} />
                  <Text style={[authStyles.topActionPillText, { color: colors.text }]}>
                    {isDark ? "Light" : "Dark"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Header Image */}
            <View style={authStyles.imageContainer}>
              <Image
                source={require("../../assets/images/i1.png")}
                style={authStyles.image}
                contentFit="contain"
              />
            </View>

            {/* Title & Subtitle */}
            <View style={authStyles.headerContainer}>
              <Text style={[authStyles.title, { color: colors.text }]}>{t("welcomeBack")}</Text>
              <Text style={[authStyles.subtitle, { color: colors.textSecondary }]}>
                {t("signInSubtitle")}
              </Text>

              {/* Value Props & Trust Badges */}
              <View style={authStyles.featuresRow}>
                <View
                  style={[
                    authStyles.featureBadge,
                    { backgroundColor: isDark ? "#2A1810" : "#FFF7ED", borderColor: "#FDBA74" },
                  ]}
                >
                  <Ionicons name="flash" size={12} color="#EA580C" />
                  <Text style={[authStyles.featureBadgeText, { color: "#EA580C" }]}>
                    {isAmharic ? "30-45 ደቂቃ ማድረሻ" : "30-45m Express"}
                  </Text>
                </View>

                <View
                  style={[
                    authStyles.featureBadge,
                    { backgroundColor: isDark ? "#102820" : "#ECFDF5", borderColor: "#6EE7B7" },
                  ]}
                >
                  <Ionicons name="wallet-outline" size={12} color="#059669" />
                  <Text style={[authStyles.featureBadgeText, { color: "#059669" }]}>
                    {isAmharic ? "ቴሌብር እና ሲቢኢ" : "Telebirr & CBE Birr"}
                  </Text>
                </View>

                <View
                  style={[
                    authStyles.featureBadge,
                    { backgroundColor: isDark ? "#1E1B4B" : "#EEF2FF", borderColor: "#A5B4FC" },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={12} color="#4F46E5" />
                  <Text style={[authStyles.featureBadgeText, { color: "#4F46E5" }]}>
                    {isAmharic ? "ትኩስ ኩሽና" : "Fresh Kitchen"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Demo Accounts Helper */}
            <View
              style={[
                authStyles.demoSection,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={authStyles.demoHeaderRow}>
                <Text style={[authStyles.demoHeadingText, { color: colors.textSecondary }]}>
                  {isAmharic ? "ፈጣን መሙያ (Demo Accounts)" : "Quick Demo Login"}
                </Text>
                <Text style={[authStyles.demoHintText, { color: colors.textLight }]}>
                  {isAmharic ? "ለመሙላት ይጫኑ" : "Tap to fill email"}
                </Text>
              </View>

              <View style={authStyles.demoPillsRow}>
                <TouchableOpacity
                  style={[
                    authStyles.demoPill,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    email.toLowerCase() === "usawonder135@gmail.com" && {
                      borderColor: colors.primary,
                      backgroundColor: isDark ? "#2A1810" : "#FFF7ED",
                    },
                  ]}
                  onPress={() => fillDemoAccount("usawonder135@gmail.com")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="star" size={13} color="#D97706" />
                  <Text style={[authStyles.demoPillText, { color: colors.text }]}>
                    {isAmharic ? "አድሚን (Admin)" : "Admin"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    authStyles.demoPill,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    email.toLowerCase() === "customer@example.com" && {
                      borderColor: colors.primary,
                      backgroundColor: isDark ? "#2A1810" : "#FFF7ED",
                    },
                  ]}
                  onPress={() => fillDemoAccount("customer@example.com")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-outline" size={13} color={colors.primary} />
                  <Text style={[authStyles.demoPillText, { color: colors.text }]}>
                    {isAmharic ? "ደንበኛ (Customer)" : "Customer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <View style={authStyles.formContainer}>
              {/* Inline Error Banner */}
              {errorMessage ? (
                <View style={authStyles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={18} color="#C62828" />
                  <Text style={authStyles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Email Input */}
              <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("emailAddress")}</Text>
              <Pressable
                style={[
                  authStyles.inputContainer,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  focusedInput === "email" && [authStyles.inputContainerFocused, { borderColor: colors.primary }],
                ]}
                onPress={() => emailRef.current?.focus()}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={focusedInput === "email" ? colors.primary : colors.textLight}
                  style={authStyles.inputIcon}
                />
                <TextInput
                  ref={emailRef}
                  style={[authStyles.textInput, { color: colors.text }]}
                  placeholder={t("emailPlaceholder")}
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                {email.length > 0 && (
                  <TouchableOpacity
                    style={authStyles.clearInputBtn}
                    onPress={() => setEmail("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </Pressable>

              {/* Password Input */}
              <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("password")}</Text>
              <Pressable
                style={[
                  authStyles.inputContainer,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  focusedInput === "password" && [authStyles.inputContainerFocused, { borderColor: colors.primary }],
                ]}
                onPress={() => passwordRef.current?.focus()}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focusedInput === "password" ? colors.primary : colors.textLight}
                  style={authStyles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  style={[authStyles.textInput, { color: colors.text }]}
                  placeholder={t("passwordPlaceholder")}
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity
                  style={authStyles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </Pressable>

              {/* Real-time Password Length Helper */}
              {password.length > 0 && (
                <View style={authStyles.passwordRequirementRow}>
                  <Text
                    style={[
                      authStyles.passwordRequirementText,
                      { color: password.length >= MIN_PASSWORD_LENGTH ? "#10B981" : colors.textLight },
                    ]}
                  >
                    {password.length >= MIN_PASSWORD_LENGTH
                      ? isAmharic
                        ? "✓ የይለፍ ቃሉ ርዝመት ትክክል ነው"
                        : "✓ Meets length requirement"
                      : isAmharic
                      ? `ቢያንስ ${MIN_PASSWORD_LENGTH} ፊደላት ያስፈልጋሉ`
                      : `Minimum ${MIN_PASSWORD_LENGTH} characters required`}
                  </Text>
                  <Text
                    style={[
                      authStyles.lengthCountBadge,
                      {
                        backgroundColor: password.length >= MIN_PASSWORD_LENGTH ? "#ECFDF5" : "#FEF3C7",
                        color: password.length >= MIN_PASSWORD_LENGTH ? "#059669" : "#D97706",
                      },
                    ]}
                  >
                    {password.length}/{MIN_PASSWORD_LENGTH}
                  </Text>
                </View>
              )}

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={authStyles.forgotPasswordContainer}
                onPress={openResetModal}
                activeOpacity={0.7}
              >
                <Text style={authStyles.forgotPasswordText}>{t("forgotPassword")}</Text>
              </TouchableOpacity>

              {/* Sign In CTA Button */}
              <TouchableOpacity
                style={[
                  authStyles.authButton,
                  { backgroundColor: colors.primary },
                  loading && authStyles.buttonDisabled,
                ]}
                onPress={handleSignIn}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <View style={authStyles.btnRow}>
                    <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                    <Text style={authStyles.buttonText}>{t("signInBtn")}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Sign Up Navigation Link */}
              <View style={authStyles.linkContainer}>
                <Text style={[authStyles.linkText, { color: colors.textSecondary }]}>
                  {t("noAccount")}{" "}
                  <Text
                    style={[authStyles.link, { color: colors.primary }]}
                    onPress={() => router.push("/(auth)/sign-up")}
                  >
                    {t("signUpLink")}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <Pressable style={authStyles.modalOverlay} onPress={() => setShowResetModal(false)}>
          <Pressable
            style={[
              authStyles.modalCard,
              { backgroundColor: colors.surface },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={authStyles.modalCloseButton}
              onPress={() => setShowResetModal(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color={colors.textLight} />
            </TouchableOpacity>

            {resetErrorMessage ? (
              <View style={authStyles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color="#C62828" />
                <Text style={authStyles.errorBannerText}>{resetErrorMessage}</Text>
              </View>
            ) : null}

            {resetStep === 1 ? (
              <View>
                <Text style={[authStyles.modalTitle, { color: colors.text }]}>{t("resetPassword")}</Text>
                <Text style={[authStyles.modalSubtitle, { color: colors.textSecondary }]}>
                  {t("resetSubtitle")}
                </Text>

                <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("emailAddress")}</Text>
                <View style={[authStyles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textLight} style={authStyles.inputIcon} />
                  <TextInput
                    style={[authStyles.textInput, { color: colors.text }]}
                    placeholder={t("emailPlaceholder")}
                    placeholderTextColor={colors.textLight}
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[authStyles.authButton, { backgroundColor: colors.primary }, resetLoading && authStyles.buttonDisabled]}
                  onPress={handleSendResetCode}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={authStyles.buttonText}>{t("sendResetCode")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[authStyles.modalTitle, { color: colors.text }]}>{t("setNewPassword")}</Text>
                <Text style={[authStyles.modalSubtitle, { color: colors.textSecondary }]}>
                  {t("setNewPasswordSubtitle")}
                </Text>

                <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("verificationCode")}</Text>
                <TextInput
                  style={[authStyles.codeInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="123456"
                  placeholderTextColor={colors.textLight}
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("password")}</Text>
                <View style={[authStyles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={authStyles.inputIcon} />
                  <TextInput
                    style={[authStyles.textInput, { color: colors.text }]}
                    placeholder={`${t("passwordRequirement")}`}
                    placeholderTextColor={colors.textLight}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={authStyles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("confirmPassword")}</Text>
                <View style={[authStyles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={authStyles.inputIcon} />
                  <TextInput
                    style={[authStyles.textInput, { color: colors.text }]}
                    placeholder={t("confirmPasswordPlaceholder")}
                    placeholderTextColor={colors.textLight}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[authStyles.authButton, { backgroundColor: colors.primary }, resetLoading && authStyles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={authStyles.buttonText}>{t("updatePasswordBtn")}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={authStyles.linkContainer}
                  onPress={() => setResetStep(1)}
                >
                  <Text style={[authStyles.link, { color: colors.primary }]}>{t("backToEmail")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SignInScreen;
