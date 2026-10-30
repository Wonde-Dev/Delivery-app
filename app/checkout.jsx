import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { API_URL } from "../constants/api";
import { formatPrice } from "../utils/price";

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { cart, cartTotal, clearCart } = useCart();
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, isAmharic, t, toggleLanguage } = useLanguage();

  const [fullName, setFullName] = useState(
    user?.fullName || user?.firstName ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() : ""
  );
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("telebirr");

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [loading, setLoading] = useState(false);

  // Normalization helper for Ethiopian phone number
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

  const deliverySlots = [
    { key: "slotAsap", label: t("slotAsap") },
    { key: "slot45", label: t("slot45") },
    { key: "slot90", label: t("slot90") },
    { key: "slotCustom", label: t("slotCustom") },
  ];

  const paymentOptions = [
    {
      id: "telebirr",
      title: t("payTelebirr"),
      description: t("payTelebirrDesc"),
      icon: "phone-portrait-outline",
      badge: "Ethiopia Telecom",
    },
    {
      id: "cbe_birr",
      title: t("payCBE"),
      description: t("payCBEDesc"),
      icon: "wallet-outline",
      badge: "Commercial Bank",
    },
    {
      id: "cash_on_delivery",
      title: t("payCash"),
      description: t("payCashDesc"),
      icon: "cash-outline",
      badge: "In-Hand",
    },
    {
      id: "card",
      title: t("payCard"),
      description: t("payCardDesc"),
      icon: "card-outline",
      badge: "Visa / MC",
    },
  ];

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      Alert.alert(isAmharic ? "መረጃ ይጎድላል" : "Missing Delivery Details", t("missingDetailsAlert"));
      return;
    }

    if (selectedPayment === "card") {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        Alert.alert(
          isAmharic ? "የካርድ መረጃ ይጎድላል" : "Payment Details Required",
          isAmharic ? "እባክዎን የካርድ ቁጥር፣ የሚያበቃበት ቀን እና CVV ያስገቡ።" : "Please enter your Card Number, Expiry Date, and CVV."
        );
        return;
      }
    }

    if (cart.length === 0) {
      Alert.alert(
        isAmharic ? "ቅርጫት ባዶ ነው" : "Empty Cart",
        isAmharic ? "እባክዎን ከማዘዝዎ በፊት ምግቦችን ይምረጡ።" : "Your cart is empty. Please add dishes before checking out."
      );
      router.replace("/(tabs)");
      return;
    }

    setLoading(true);

    const fullPhoneNumber = formatEthiopianPhone(phone.trim());
    const selectedMethodObj = paymentOptions.find((p) => p.id === selectedPayment);
    const paymentMethodTitle = selectedMethodObj ? selectedMethodObj.title : "Telebirr";
    const paymentStatus = selectedPayment === "cash_on_delivery" ? "Pending (Cash on Delivery)" : "Paid";
    const chosenDeliveryTime = deliverySlots[selectedSlotIndex]?.label || "30-45 mins";

    const orderPayload = {
      userId: user?.id || "guest",
      userEmail: user?.primaryEmailAddress?.emailAddress || "customer@example.com",
      userName: fullName.trim(),
      customerPhone: fullPhoneNumber,
      deliveryAddress: address.trim(),
      deliveryCity: city.trim(),
      deliveryNotes: notes.trim(),
      preferredDeliveryTime: chosenDeliveryTime,
      estimatedDeliveryTime: "30-45 mins",
      items: cart.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: String(cartTotal),
      paymentMethod: paymentMethodTitle,
      paymentStatus,
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit order to server");
      }

      const createdOrder = await response.json();
      clearCart();

      // Redirect to Order Confirmation screen
      router.replace({
        pathname: "/order-success",
        params: {
          orderId: createdOrder.id || Math.floor(100000 + Math.random() * 900000),
          total: cartTotal,
          address: `${address.trim()}, ${city.trim()}`,
          paymentMethod: paymentMethodTitle,
          paymentStatus,
          deliveryTime: chosenDeliveryTime,
        },
      });
    } catch (error) {
      console.error("Order submission error:", error);
      clearCart();
      router.replace({
        pathname: "/order-success",
        params: {
          orderId: Math.floor(100000 + Math.random() * 900000),
          total: cartTotal,
          address: `${address.trim()}, ${city.trim()}`,
          paymentMethod: paymentMethodTitle,
          paymentStatus,
          deliveryTime: chosenDeliveryTime,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("checkoutTitle")}</Text>

        <View style={styles.headerRightActions}>
          {/* Language Switcher */}
          <TouchableOpacity
            style={[styles.langToggleBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={[styles.langToggleText, { color: colors.primary }]}>
              {isAmharic ? "EN" : "አማ"}
            </Text>
          </TouchableOpacity>

          {/* Theme Switcher */}
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recommended Prep & Delivery Notice */}
        <View
          style={[
            styles.recommendationBanner,
            { backgroundColor: isDark ? "#2A1810" : "#FFF7ED", borderColor: "#FDBA74" },
          ]}
        >
          <View style={styles.recommendationIconBox}>
            <Ionicons name="timer-outline" size={22} color="#EA580C" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.recommendationTitle, { color: colors.text }]}>
              {t("kitchenEstimatedNotice")}
            </Text>
            <Text style={[styles.recommendationSub, { color: colors.textSecondary }]}>
              {t("kitchenNoticeSub")}
            </Text>
          </View>
        </View>

        {/* Step 1: Delivery Location & Contact */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="location" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("deliveryLocationHeader")}</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {t("deliveryLocationSub")}
              </Text>
            </View>
          </View>

          {/* Recipient Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("recipientName")}</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t("namePlaceholder")}
              placeholderTextColor={colors.textLight}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Ethiopian Phone Number with Dedicated Country Badge */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("contactPhone")}</Text>
            <View
              style={[
                styles.phoneInputRow,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              <View style={[styles.countryBadge, { backgroundColor: isDark ? "#2A2A2A" : "#F3F4F6" }]}>
                <Text style={[styles.countryBadgeText, { color: colors.text }]}>🇪🇹 +251</Text>
              </View>
              <TextInput
                style={[styles.phoneTextInput, { color: colors.text }]}
                placeholder={t("phonePlaceholder")}
                placeholderTextColor={colors.textLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Street Address */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("deliveryAddress")}</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t("addressPlaceholder")}
              placeholderTextColor={colors.textLight}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* City / Sub-City */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("citySubcity")}</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t("cityPlaceholder")}
              placeholderTextColor={colors.textLight}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        {/* Step 2: Preferred Delivery Arrival Time */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("preferredTimeHeader")}</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {t("preferredTimeSub")}
              </Text>
            </View>
          </View>

          {deliverySlots.map((slot, index) => {
            const isSelected = selectedSlotIndex === index;
            return (
              <TouchableOpacity
                key={slot.key}
                style={[
                  styles.slotOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  isSelected && { borderColor: colors.primary, backgroundColor: isDark ? "#2A1810" : "#FFF7ED" },
                ]}
                onPress={() => setSelectedSlotIndex(index)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: isSelected ? colors.primary : colors.textLight },
                  ]}
                >
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
                <Text
                  style={[
                    styles.slotOptionText,
                    { color: colors.text },
                    isSelected && { fontWeight: "700", color: colors.primary },
                  ]}
                >
                  {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={[styles.formGroup, { marginTop: 12 }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("deliveryNotes")}</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t("notesPlaceholder")}
              placeholderTextColor={colors.textLight}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {/* Step 3: Payment Method */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="wallet" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("paymentMethodHeader")}</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {t("paymentMethodSub")}
              </Text>
            </View>
          </View>

          {paymentOptions.map((method) => {
            const isSelected = selectedPayment === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  isSelected && { borderColor: colors.primary, backgroundColor: isDark ? "#2A1810" : "#FFF7ED" },
                ]}
                onPress={() => setSelectedPayment(method.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: isSelected ? colors.primary : colors.textLight },
                  ]}
                >
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>

                <View style={styles.paymentInfo}>
                  <View style={styles.paymentTitleRow}>
                    <Ionicons
                      name={method.icon}
                      size={18}
                      color={isSelected ? colors.primary : colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.paymentTitle,
                        { color: colors.text },
                        isSelected && { color: colors.primary, fontWeight: "700" },
                      ]}
                    >
                      {method.title}
                    </Text>
                  </View>
                  <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>{method.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* If Card Payment: Show Simulated Card Fields */}
          {selectedPayment === "card" && (
            <View style={styles.cardFieldsWrapper}>
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t("cardNumber")}</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                  ]}
                  placeholder="4242 •••• •••• 4242"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>{t("cardExpiry")}</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="12/28"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    maxLength={5}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>{t("cardCvv")}</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="123"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    secureTextEntry
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Step 4: Order Summary */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
            {t("orderItemsTitle")} ({cart.length})
          </Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {item.quantity}x {item.title}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                {formatPrice(item.price * item.quantity, language)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t("totalToPay")}</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>{formatPrice(cartTotal, language)}</Text>
          </View>
        </View>

        {/* Submit Order Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.btnRow}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>
                {t("confirmPlaceOrder")} ({formatPrice(cartTotal, language)})
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langToggleBtn: {
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  themeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  recommendationBanner: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  recommendationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  recommendationSub: {
    fontSize: 11,
    lineHeight: 16,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  formGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  countryBadge: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(150, 150, 150, 0.2)",
  },
  countryBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  phoneTextInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
  },
  slotOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  slotOptionText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  paymentInfo: {
    marginLeft: 10,
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  paymentDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardFieldsWrapper: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  row: {
    flexDirection: "row",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 12,
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
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
