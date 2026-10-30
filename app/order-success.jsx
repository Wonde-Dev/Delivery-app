import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../utils/price";

const OrderSuccessScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, isAmharic, t, toggleLanguage } = useLanguage();

  const orderId = params.orderId || "108246";
  const total = params.total || 0;
  const address = params.address || (isAmharic ? "የተመረጠ የማድረሻ አድራሻ" : "Your Delivery Address");
  const paymentMethod = params.paymentMethod || "Telebirr";
  const paymentStatus = params.paymentStatus || (isAmharic ? "ተከፍሏል" : "Paid");
  const deliveryTime = params.deliveryTime || "25 - 35 mins";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar with Language & Theme Toggle */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={styles.iconBtn}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {isAmharic ? "የትዕዛዝ ማረጋገጫ" : "Order Confirmation"}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Language Toggle Pill */}
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[styles.langToggleBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.langToggleText, { color: colors.primary }]}>
              {isAmharic ? "EN" : "አማ"}
            </Text>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successIconWrapper}>
          <View style={[styles.successIconCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{t("orderSuccessTitle")}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("orderSuccessSub")}
        </Text>

        {/* Order Details Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.orderIdRow}>
            <Text style={[styles.orderIdLabel, { color: colors.textSecondary }]}>{t("orderIdLabel")}</Text>
            <Text style={[styles.orderIdValue, { color: colors.primary }]}>#{orderId}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#D97706" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t("estimatedWindow")}</Text>
              <Text style={[styles.detailValue, { color: colors.text, fontWeight: "700" }]}>
                {deliveryTime}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {isAmharic ? "የማድረሻ አድራሻ" : "Delivery Address"}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>
                {address}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={20} color="#10B981" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {isAmharic ? "የክፍያ ዘዴ" : "Payment Method"}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {paymentMethod} • <Text style={{ color: "#10B981", fontWeight: "700" }}>{paymentStatus}</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t("totalToPay")}</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(total, language)}</Text>
          </View>
        </View>

        {/* Live Tracking Stepper Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t("liveTrackingTitle")}</Text>

          {/* Step 1: Placed */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineNode, { backgroundColor: "#10B981" }]}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>{t("trackPlaced")}</Text>
              <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                {t("trackPlacedDesc")}
              </Text>
            </View>
          </View>

          <View style={[styles.timelineLineActive, { backgroundColor: "#10B981" }]} />

          {/* Step 2: Approved & Cooking */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineNode, { backgroundColor: colors.primary }]}>
              <Ionicons name="restaurant" size={14} color="#FFFFFF" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>{t("trackApproved")}</Text>
              <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                {t("trackApprovedDesc")}
              </Text>
            </View>
          </View>

          <View style={[styles.timelineLineInactive, { backgroundColor: colors.border }]} />

          {/* Step 3: Out for Delivery */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineNode, { backgroundColor: colors.border }]}>
              <Ionicons name="bicycle" size={14} color={colors.textLight} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.textSecondary }]}>{t("trackOnWay")}</Text>
              <Text style={[styles.timelineDesc, { color: colors.textLight }]}>
                {t("trackOnWayDesc")}
              </Text>
            </View>
          </View>

          <View style={[styles.timelineLineInactive, { backgroundColor: colors.border }]} />

          {/* Step 4: Delivered */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineNode, { backgroundColor: colors.border }]}>
              <Ionicons name="home" size={14} color={colors.textLight} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: colors.textSecondary }]}>{t("trackDelivered")}</Text>
              <Text style={[styles.timelineDesc, { color: colors.textLight }]}>
                {t("trackDeliveredDesc")}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/(tabs)/profile")}
          activeOpacity={0.85}
        >
          <Ionicons name="receipt-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>{t("viewInOrders")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.supportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push("/support")}
          activeOpacity={0.8}
        >
          <Ionicons name="headset-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.supportButtonText, { color: colors.primary }]}>{t("needHelpContact")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.8}
        >
          <Ionicons name="restaurant-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t("backToMenuBtn")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  iconBtn: {
    padding: 6,
  },
  langToggleBtn: {
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  successIconWrapper: {
    marginTop: 12,
    marginBottom: 16,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 13,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  timelineLineActive: {
    width: 2,
    height: 20,
    marginLeft: 11,
    marginVertical: 4,
  },
  timelineLineInactive: {
    width: 2,
    height: 20,
    marginLeft: 11,
    marginVertical: 4,
  },
  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  supportButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
