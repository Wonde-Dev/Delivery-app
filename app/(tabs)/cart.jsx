import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatPrice } from "../../utils/price";

const CartScreen = () => {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, isAmharic, t, toggleLanguage } = useLanguage();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
  } = useCart();

  const handleClearCart = () => {
    Alert.alert(t("clearCartConfirmTitle"), t("clearCartConfirmMsg"), [
      { text: isAmharic ? "ይቅር" : "Cancel", style: "cancel" },
      { text: t("clearCart"), style: "destructive", onPress: clearCart },
    ]);
  };

  if (cart.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="cart-outline" size={64} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("cartEmptyTitle")}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {t("cartEmptySub")}
        </Text>
        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)")}
          activeOpacity={0.8}
        >
          <Ionicons name="restaurant-outline" size={20} color="#FFFFFF" />
          <Text style={styles.browseButtonText}>{t("exploreMenuBtn")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const amountForFreeDelivery = Math.max(0, 500 - cartSubtotal);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("orderCartTitle")}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {cartCount} {t("itemsSelected")}
          </Text>
        </View>
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

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearCart}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#D32F2F" />
            <Text style={styles.clearButtonText}>{t("clearCart")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Free Delivery Bar */}
        {amountForFreeDelivery > 0 ? (
          <View
            style={[
              styles.deliveryPromo,
              { backgroundColor: isDark ? "#242424" : "#FFF7ED", borderColor: colors.border },
            ]}
          >
            <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
            <Text style={[styles.deliveryPromoText, { color: colors.text }]}>
              {isAmharic ? "ተጨማሪ " : "Add "}
              <Text style={{ fontWeight: "700" }}>{formatPrice(amountForFreeDelivery, language)}</Text>{" "}
              {t("addMoreForFreeDelivery")}
            </Text>
          </View>
        ) : (
          <View style={[styles.deliveryPromo, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.deliveryPromoText, { color: "#065F46", fontWeight: "700" }]}>
              {t("freeDeliveryUnlocked")}
            </Text>
          </View>
        )}

        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {cart.map((item) => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            return (
              <View
                key={item.id}
                style={[
                  styles.cartCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>{item.category}</Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    {formatPrice(item.price, language)} {isAmharic ? "አንዱ" : "each"}
                  </Text>

                  {/* Quantity Stepper & Total */}
                  <View style={styles.quantityRow}>
                    <View style={[styles.stepperContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={item.quantity === 1 ? "trash-outline" : "remove"}
                          size={16}
                          color={item.quantity === 1 ? "#D32F2F" : colors.primary}
                        />
                      </TouchableOpacity>
                      <Text style={[styles.stepperValue, { color: colors.text }]}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.itemTotalPrice, { color: colors.text }]}>{formatPrice(itemTotal, language)}</Text>
                  </View>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeFromCart(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={18} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Order Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {isAmharic ? "የትዕዛዝ ማጠቃለያ" : "Order Summary"}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("cartSubtotal")}</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(cartSubtotal, language)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("deliveryFee")}</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {deliveryFee === 0 ? (
                <Text style={{ color: "#10B981", fontWeight: "700" }}>{t("free")}</Text>
              ) : (
                formatPrice(deliveryFee, language)
              )}
            </Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t("totalToPay")}</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>{formatPrice(cartTotal, language)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer Button */}
      <View style={[styles.footerContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.footerInner}>
          <View style={styles.footerInfo}>
            <Text style={[styles.footerSubtotalLabel, { color: colors.textSecondary }]}>{t("totalToPay")}</Text>
            <Text style={[styles.footerTotalAmount, { color: colors.primary }]}>{formatPrice(cartTotal, language)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/checkout")}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutButtonText}>{t("proceedToCheckout")}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langToggleBtn: {
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  deliveryPromo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  deliveryPromoText: {
    fontSize: 13,
    flex: 1,
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    position: "relative",
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 20,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    padding: 4,
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 10,
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  deleteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 4,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 10,
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
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  footerInfo: {
    flex: 1,
  },
  footerSubtotalLabel: {
    fontSize: 11,
  },
  footerTotalAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
