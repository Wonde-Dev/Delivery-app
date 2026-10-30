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
} from "react-native";
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { useState, useRef } from "react";
import { authStyles } from "../../assets/styles/auth.styles";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_URL } from "../../constants/api";
import VerifyEmail from "./verify-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 15;

const SignUpScreen = () => {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, isAmharic, toggleLanguage } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const getErrorMessage = (err, defaultMsg) => {
    if (err?.errors && err.errors.length > 0) {
      return err.errors[0].longMessage || err.errors[0].message || defaultMsg;
    }
    return err?.message || defaultMsg;
  };

  // Helper to format/normalize Ethiopian phone number
  const formatEthiopianPhone = (raw) => {
    let cleaned = raw.replace(/[^0-9+]/g, "");
    if (cleaned.startsWith("+251")) {
      return cleaned;
    }
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith("251")) {
      return `+${cleaned}`;
    }
    return `+251${cleaned}`;
  };

  const handleSignUp = async () => {
    setErrorMessage("");
    const trimmedName = fullName.trim();
    const rawPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      const msg = isAmharic ? "እባክዎን ሙሉ ስምዎን ያስገቡ" : "Please enter your full name.";
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "ስም ይጎድላል" : "Missing Name", msg);
      return;
    }

    if (!rawPhone || rawPhone.replace(/[^0-9]/g, "").length < 9) {
      const msg = isAmharic
        ? "እባክዎን ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ 911 234 567)"
        : "Please enter a valid Ethiopian phone number (e.g. 911 234 567).";
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "የተሳሳተ ስልክ" : "Invalid Phone", msg);
      return;
    }

    const normalizedPhone = formatEthiopianPhone(rawPhone);

    if (!trimmedEmail) {
      const msg = isAmharic ? "እባክዎን ኢሜይል ያስገቡ" : "Please enter your email address.";
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "ኢሜይል ይጎድላል" : "Missing Email", msg);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      const msg = isAmharic ? "እባክዎን ትክክለኛ ኢሜይል ያስገቡ" : "Please enter a valid email address.";
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "የተሳሳተ ኢሜይል" : "Invalid Email", msg);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      const msg = isAmharic
        ? `የይለፍ ቃል ቢያንስ ${MIN_PASSWORD_LENGTH} ፊደላት ወይም ቁጥሮች መሆን አለበት`
        : `Passwords must be ${MIN_PASSWORD_LENGTH} characters or more.`;
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "የይለፍ ቃል አጭር ነው" : "Password Too Short", msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = isAmharic ? "የይለፍ ቃሎች አይመሳሰሉም" : "Passwords do not match. Please verify both entries.";
      setErrorMessage(msg);
      Alert.alert(isAmharic ? "የይለፍ ቃል ልዩነት" : "Password Mismatch", msg);
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const nameParts = trimmedName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await signUp.create({
        emailAddress: trimmedEmail,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          fullName: trimmedName,
          phone: normalizedPhone,
        },
      });

      // Sync to backend database
      try {
        await fetch(`${API_URL}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmedEmail,
            name: trimmedName,
            phone: normalizedPhone,
          }),
        });
      } catch (_syncErr) {
        // Backend sync is resilient
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      const defaultMsg = isAmharic
        ? "መለያ መክፈት አልተሳካም። እባክዎን እንደገና ይሞክሩ።"
        : "Failed to create account. Please try again.";
      const message = getErrorMessage(err, defaultMsg);
      setErrorMessage(message);
      Alert.alert(isAmharic ? "የመመዝገቢያ ስህተት" : "Sign Up Error", message);
      console.error("Sign up error:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <VerifyEmail
        email={email.trim()}
        fullName={fullName.trim()}
        phone={formatEthiopianPhone(phone.trim())}
        onBack={() => setPendingVerification(false)}
      />
    );
  }

  return (
    <View style={[authStyles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 44 : 0}
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
                source={require("../../assets/images/i2.png")}
                style={authStyles.image}
                contentFit="contain"
              />
            </View>

            {/* Header Text */}
            <View style={authStyles.headerContainer}>
              <Text style={[authStyles.title, { color: colors.text }]}>{t("createAccount")}</Text>
              <Text style={[authStyles.subtitle, { color: colors.textSecondary }]}>
                {t("signUpSubtitle")}
              </Text>

              {/* Value Proposition & Trust Badges */}
              <View style={authStyles.featuresRow}>
                <View
                  style={[
                    authStyles.featureBadge,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="flash-outline" size={12} color={colors.primary} />
                  <Text style={[authStyles.featureBadgeText, { color: colors.textSecondary }]}>
                    {isAmharic ? "30-45ደ ፈጣን" : "30-45m Express"}
                  </Text>
                </View>

                <View
                  style={[
                    authStyles.featureBadge,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={12} color={colors.success} />
                  <Text style={[authStyles.featureBadgeText, { color: colors.textSecondary }]}>
                    {isAmharic ? "ቴሌብር እና CBE" : "Telebirr & CBE"}
                  </Text>
                </View>

                <View
                  style={[
                    authStyles.featureBadge,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="restaurant-outline" size={12} color="#F59E0B" />
                  <Text style={[authStyles.featureBadgeText, { color: colors.textSecondary }]}>
                    {isAmharic ? "ትኩስ ምግቦች" : "Fresh Kitchen"}
                  </Text>
                </View>
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

              {/* Full Name */}
              <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("fullName")}</Text>
              <Pressable
                style={[
                  authStyles.inputContainer,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  focusedInput === "fullName" && [authStyles.inputContainerFocused, { borderColor: colors.primary }],
                ]}
                onPress={() => nameRef.current?.focus()}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={focusedInput === "fullName" ? colors.primary : colors.textLight}
                  style={authStyles.inputIcon}
                />
                <TextInput
                  ref={nameRef}
                  style={[authStyles.textInput, { color: colors.text }]}
                  placeholder={t("namePlaceholder")}
                  placeholderTextColor={colors.textLight}
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedInput("fullName")}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
                {fullName.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setFullName("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </Pressable>

              {/* Phone Number with Ethiopia +251 Flag & Badge */}
              <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("phoneNumber")}</Text>
              <Pressable
                style={[
                  authStyles.phoneInputContainer,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  focusedInput === "phone" && [authStyles.inputContainerFocused, { borderColor: colors.primary }],
                ]}
                onPress={() => phoneRef.current?.focus()}
              >
                <View style={[authStyles.phoneCountryBadge, { backgroundColor: isDark ? "#2A2A2A" : "#F3F4F6" }]}>
                  <Text style={[authStyles.phoneCountryText, { color: colors.text }]}>🇪🇹 +251</Text>
                </View>
                <TextInput
                  ref={phoneRef}
                  style={[authStyles.phoneTextInput, { color: colors.text }]}
                  placeholder={t("phonePlaceholder")}
                  placeholderTextColor={colors.textLight}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedInput("phone")}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
                {phone.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setPhone("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </Pressable>

              {/* Email */}
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
                    onPress={() => setEmail("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </Pressable>

              {/* Password */}
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
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
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
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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

              {/* Password Strength Indicator */}
              <View style={authStyles.hintContainer}>
                <Ionicons
                  name={password.length >= MIN_PASSWORD_LENGTH ? "checkmark-circle" : "information-circle-outline"}
                  size={16}
                  color={password.length >= MIN_PASSWORD_LENGTH ? colors.success : colors.textLight}
                />
                <Text
                  style={[
                    authStyles.helperText,
                    password.length >= MIN_PASSWORD_LENGTH && { color: colors.success, fontWeight: "600" },
                  ]}
                >
                  {password.length}/{MIN_PASSWORD_LENGTH} {t("passwordRequirement")}
                </Text>
              </View>

              {/* Confirm Password */}
              <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("confirmPassword")}</Text>
              <Pressable
                style={[
                  authStyles.inputContainer,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  focusedInput === "confirmPassword" && [authStyles.inputContainerFocused, { borderColor: colors.primary }],
                ]}
                onPress={() => confirmPasswordRef.current?.focus()}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focusedInput === "confirmPassword" ? colors.primary : colors.textLight}
                  style={authStyles.inputIcon}
                />
                <TextInput
                  ref={confirmPasswordRef}
                  style={[authStyles.textInput, { color: colors.text }]}
                  placeholder={t("confirmPasswordPlaceholder")}
                  placeholderTextColor={colors.textLight}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <TouchableOpacity
                  style={authStyles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </Pressable>

              {/* Confirm Password Matching Hint */}
              {confirmPassword.length > 0 && (
                <View style={[authStyles.hintContainer, { marginTop: -6, marginBottom: 12 }]}>
                  <Ionicons
                    name={password === confirmPassword ? "checkmark-circle" : "close-circle-outline"}
                    size={16}
                    color={password === confirmPassword ? colors.success : "#C62828"}
                  />
                  <Text
                    style={[
                      authStyles.helperText,
                      { color: password === confirmPassword ? colors.success : "#C62828", fontWeight: "600" },
                    ]}
                  >
                    {password === confirmPassword
                      ? isAmharic
                        ? "የይለፍ ቃሎች ይጣጣማሉ"
                        : "Passwords match"
                      : isAmharic
                      ? "የይለፍ ቃሎች አይመሳሰሉም"
                      : "Passwords do not match"}
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  authStyles.primaryButton,
                  { backgroundColor: colors.primary },
                  (loading || !isLoaded) && authStyles.primaryButtonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={loading || !isLoaded}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={authStyles.loadingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={authStyles.primaryButtonText}>
                      {" "}
                      {isAmharic ? "መለያ በመፍጠር ላይ..." : "Creating Account..."}
                    </Text>
                  </View>
                ) : (
                  <Text style={authStyles.primaryButtonText}>{t("createAccountBtn")}</Text>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={authStyles.footerContainer}>
                <Text style={[authStyles.footerText, { color: colors.textSecondary }]}>
                  {t("alreadyHaveAccount")}{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/sign-in")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[authStyles.linkText, { color: colors.primary }]}>{t("signInLink")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;
