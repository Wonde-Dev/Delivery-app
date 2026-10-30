import { StyleSheet, Dimensions, Platform } from "react-native";
import { COLORS } from "../../constants/colors";
import { FONT_STACK } from "../../constants/typography";

const { height } = Dimensions.get("window");
const isSmallDevice = height < 700;

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 14 : 20,
    paddingBottom: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  responsiveCard: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
  },

  // Top Actions Bar (Language & Theme)
  topActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: isSmallDevice ? 10 : 16,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  brandPillText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  topActionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topActionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  topActionPillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Header Illustration & Brand
  imageContainer: {
    height: isSmallDevice ? 130 : Math.min(height * 0.22, 190),
    minHeight: 120,
    marginBottom: isSmallDevice ? 10 : 16,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    maxWidth: 220,
    maxHeight: 190,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: isSmallDevice ? 16 : 22,
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: FONT_STACK.bold,
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONT_STACK.regular,
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 8,
    maxWidth: 380,
  },

  // Feature Badges Row (Trust / Value Props)
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Quick Demo Login Row
  demoSection: {
    marginBottom: 16,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  demoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  demoHeadingText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  demoHintText: {
    fontSize: 10,
  },
  demoPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  demoPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Form Fields
  formContainer: {
    width: "100%",
  },
  inputLabel: {
    fontFamily: FONT_STACK.medium,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 50,
    minHeight: 50,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: "#E53935",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: FONT_STACK.regular,
    fontSize: 14,
    color: COLORS.text,
    height: "100%",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },
  clearInputBtn: {
    padding: 4,
    marginRight: 4,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },

  // Ethiopian Phone Input
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 14,
    paddingHorizontal: 10,
    height: 50,
    minHeight: 50,
  },
  phoneCountryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    gap: 4,
  },
  phoneCountryText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  phoneTextInput: {
    flex: 1,
    fontFamily: FONT_STACK.regular,
    fontSize: 14,
    color: COLORS.text,
    height: "100%",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },

  // Password Requirement Helper
  passwordRequirementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -8,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  passwordRequirementText: {
    fontSize: 11,
    fontWeight: "500",
  },
  lengthCountBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // Error Banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#C62828",
    lineHeight: 18,
  },

  // Forgot Password Link
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 18,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  forgotPasswordText: {
    fontFamily: FONT_STACK.medium,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Main Action CTA Button
  authButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    fontFamily: FONT_STACK.bold,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Bottom Switcher Link
  linkContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Modal (Forgot Password & Verify)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    position: "relative",
  },
  modalCloseButton: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 6,
    zIndex: 2,
  },
  modalTitle: {
    fontFamily: FONT_STACK.bold,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
    marginTop: 4,
  },
  modalSubtitle: {
    fontFamily: FONT_STACK.regular,
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 6,
    textAlign: "center",
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    color: COLORS.text,
    marginBottom: 18,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  resendDisabled: {
    color: COLORS.textLight,
    fontWeight: "400",
  },
});
