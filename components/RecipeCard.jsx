import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { recipeCardStyles } from "../assets/styles/home.styles";
import { getMealPrice, formatPrice } from "../utils/price";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function RecipeCard({ recipe }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { colors } = useTheme();
  const { language } = useLanguage();
  const price = recipe.price ? parseFloat(recipe.price) : getMealPrice(recipe.id);

  const handleQuickAdd = (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    addToCart({ ...recipe, price }, 1);
  };

  return (
    <TouchableOpacity
      style={[
        recipeCardStyles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      activeOpacity={0.8}
    >
      <View style={recipeCardStyles.imageContainer}>
        <Image
          source={{ uri: recipe.image }}
          style={recipeCardStyles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={cardExtraStyles.priceBadge}>
          <Text style={cardExtraStyles.priceBadgeText}>{formatPrice(price, language)}</Text>
        </View>

        {recipe.estimatedDeliveryTime ? (
          <View style={cardExtraStyles.deliveryBadge}>
            <Ionicons name="flash" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
            <Text style={cardExtraStyles.deliveryBadgeText}>{recipe.estimatedDeliveryTime}</Text>
          </View>
        ) : null}
      </View>

      <View style={recipeCardStyles.content}>
        <Text style={[recipeCardStyles.title, { color: colors.text }]} numberOfLines={2}>
          {recipe.title}
        </Text>
        {recipe.description ? (
          <Text style={[recipeCardStyles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {recipe.description}
          </Text>
        ) : null}

        <View style={cardExtraStyles.footerRow}>
          <View style={recipeCardStyles.timeContainer}>
            <Ionicons name="time-outline" size={13} color={colors.textLight} />
            <Text style={[recipeCardStyles.timeText, { color: colors.textSecondary }]}>
              {recipe.cookTime || "30m"}
            </Text>
          </View>

          <TouchableOpacity
            style={[cardExtraStyles.cartButton, { backgroundColor: colors.primary }]}
            onPress={handleQuickAdd}
            activeOpacity={0.7}
            accessibilityLabel="Add to order"
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cardExtraStyles = StyleSheet.create({
  priceBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  deliveryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deliveryBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  cartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
});
