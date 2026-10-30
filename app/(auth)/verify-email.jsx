import { useSignUp } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authStyles } from "../../assets/styles/auth.styles";
import { Image } from "expo-image";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_URL } from "../../constants/api";

const VerifyEmail = ({ email, fullName, phone, onBack }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { colors } = useTheme();
  const { t, isAmharic } = useLanguage();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  const displayEmail = email || params?.email || signUp?.emailAddress || "your email";
  const displayName = fullName || params?.fullName || "";
  const displayPhone = phone || params?.phone || "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const getErrorMessage = (err, defaultMsg) => {
    if (err?.errors && err.errors.length > 0) {
      return err.errors[0].longMessage || err.errors[0].message || defaultMsg;
    }
    return err?.message || defaultMsg;
  };

  const handleVerification = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      Alert.alert(
        isAmharic ? "ኮድ ያስፈልጋል" : "Code Required",
        isAmharic ? "እባክዎን የ6-ዲጂት ማረጋገጫ ኮድ ያስገቡ።" : "Please enter the 6-digit verification code."
      );
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: trimmedCode,
      });

      if (signUpAttempt.status === "complete") {
        // Sync user to backend
        try {
          await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: signUpAttempt.createdUserId,
              email: displayEmail,
              name: displayName,
              phone: displayPhone,
            }),
          });
        } catch (_syncErr) {
          // ignore
        }

        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          isAmharic ? "ማረጋገጫው አልተጠናቀቀም" : "Verification Incomplete",
          isAmharic ? "እባክዎን ኮዱን አረጋግጠው እንደገና ይሞክሩ።" : "Please check your code and try again."
        );
      }
    } catch (err) {
      const message = getErrorMessage(
        err,
        isAmharic ? "የማረጋገጫ ሂደቱ አልተሳካም። እባክዎን ኮዱን ያረጋግጡ።" : "Verification failed. Please check the code."
      );
      Alert.alert(isAmharic ? "የማረጋገጫ ስህተት" : "Verification Error", message);
      console.error("Verification error:", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || cooldown > 0 || resending) return;

    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCooldown(30);
      Alert.alert(
        isAmharic ? "ኮድ ተልኳል" : "Code Resent",
        `${isAmharic ? "አዲስ የማረጋገጫ ኮድ ወደዚህ ተልኳል፦" : "A fresh verification code was sent to"} ${displayEmail}`
      );
    } catch (err) {
      const message = getErrorMessage(err, isAmharic ? "ኮድ መላክ አልተቻለም" : "Failed to resend code. Please try again.");
      Alert.alert(isAmharic ? "ስህተት" : "Resend Failed", message);
    } finally {
      setResending(false);
    }
  };

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/sign-up");
    }
  };

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
        >
          {/* Header Image */}
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i3.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          {/* Header Text */}
          <View style={authStyles.headerContainer}>
            <Text style={[authStyles.title, { color: colors.text }]}>{t("checkEmail")}</Text>
            <Text style={[authStyles.subtitle, { color: colors.textSecondary }]}>
              {t("verificationSubtitle")}
            </Text>
            <Text
              style={[
                authStyles.subtitle,
                { fontWeight: "700", color: colors.primary, marginTop: 4 },
              ]}
            >
              {displayEmail}
            </Text>
          </View>

          {/* Form */}
          <View style={authStyles.formContainer}>
            <Text style={[authStyles.inputLabel, { color: colors.text }]}>{t("verificationCode")}</Text>
            <View
              style={[
                authStyles.inputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
                authStyles.verificationInputContainer,
              ]}
            >
              <TextInput
                style={[
                  authStyles.textInput,
                  { color: colors.text },
                  authStyles.verificationInput,
                ]}
                placeholder="123456"
                placeholderTextColor={colors.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleVerification}
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                authStyles.primaryButton,
                { backgroundColor: colors.primary },
                loading && authStyles.primaryButtonDisabled,
              ]}
              onPress={handleVerification}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={authStyles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={authStyles.primaryButtonText}> {isAmharic ? "በማረጋገጥ ላይ..." : "Verifying..."}</Text>
                </View>
              ) : (
                <Text style={authStyles.primaryButtonText}>{t("verifyBtn")}</Text>
              )}
            </TouchableOpacity>

            {/* Resend Code */}
            <View style={authStyles.resendContainer}>
              {cooldown > 0 ? (
                <Text style={[authStyles.resendText, { color: colors.textSecondary }]}>
                  {t("resendIn")}{" "}
                  <Text style={{ fontWeight: "700", color: colors.primary }}>{cooldown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resending}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[authStyles.linkText, { color: colors.primary }]}>
                    {resending ? (isAmharic ? "በመላክ ላይ..." : "Sending code...") : t("resendBtn")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Change Email */}
            <View style={authStyles.footerContainer}>
              <Text style={[authStyles.footerText, { color: colors.textSecondary }]}>
                {t("wrongEmail")}{" "}
              </Text>
              <TouchableOpacity
                onPress={handleBackNavigation}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[authStyles.linkText, { color: colors.primary }]}>{t("changeEmail")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmail;
