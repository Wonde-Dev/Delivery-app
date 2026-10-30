import { Platform, StyleSheet } from "react-native";

export const FONT_STACK = {
  regular: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  medium: Platform.select({
    ios: "System",
    android: "sans-serif-medium",
    default: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  bold: Platform.select({
    ios: "System",
    android: "sans-serif-bold",
    default: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
};

export const TYPOGRAPHY = StyleSheet.create({
  // Display & Hero Titles
  heroTitle: {
    fontFamily: FONT_STACK.bold,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  sectionTitle: {
    fontFamily: FONT_STACK.bold,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  cardTitle: {
    fontFamily: FONT_STACK.bold,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  bodyRegular: {
    fontFamily: FONT_STACK.regular,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: FONT_STACK.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: FONT_STACK.bold,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  caption: {
    fontFamily: FONT_STACK.regular,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  captionBold: {
    fontFamily: FONT_STACK.bold,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  badge: {
    fontFamily: FONT_STACK.bold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

