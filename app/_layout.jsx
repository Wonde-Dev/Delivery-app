import { Slot } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import SafeScreen from "@/components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MainAppContent() {
  const { isDark, colors } = useTheme();

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </SafeScreen>
  );
}

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <SafeScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Configuration Required</Text>
          <Text style={styles.errorMessage}>
            Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your mobile/.env file.
          </Text>
          <Text style={styles.errorHint}>
            Please add your Clerk publishable key to mobile/.env and restart the Expo development server.
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <LanguageProvider>
        <ThemeProvider>
          <CartProvider>
            <MainAppContent />
          </CartProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
