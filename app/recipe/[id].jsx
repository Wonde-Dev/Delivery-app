import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Image } from "expo-image";

import { recipeDetailStyles } from "../../assets/styles/recipe-detail.styles";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useCart } from "../../context/CartContext";
import { getMealPrice, formatPrice } from "../../utils/price";

import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const getYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    let videoId = null;
    if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0]?.split("?")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0]?.split("&")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
};

const RecipeDetailScreen = () => {
  const { id: recipeId } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, isAmharic, toggleLanguage } = useLanguage();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [copiedScript, setCopiedScript] = useState(false);

  const { user } = useUser();
  const userId = user?.id;

  const { addToCart, cartCount } = useCart();
  const mealPrice = recipe ? (recipe.price ? parseFloat(recipe.price) : getMealPrice(recipe.id)) : 380;

  useEffect(() => {
    let isMounted = true;

    const fetchRecipeDetail = async () => {
      if (!recipeId) return;
      try {
        const mealData = await MealAPI.getMealById(recipeId);
        if (!isMounted) return;

        if (mealData) {
          const transformedRecipe = MealAPI.transformMealData(mealData);
          const youtubeEmbed = getYouTubeEmbedUrl(mealData.strYoutube);
          const ingredientsList = Array.isArray(transformedRecipe.ingredients) ? transformedRecipe.ingredients : [];

          setRecipe({
            ...transformedRecipe,
            youtubeUrl: youtubeEmbed,
            ingredientsScript: ingredientsList.join(", "),
          });
        } else {
          // Check custom foods created by admin
          const foodsRes = await fetch(`${API_URL}/foods`).catch(() => null);
          if (foodsRes?.ok && isMounted) {
            const foodsList = await foodsRes.json();
            const customMatch = (foodsList || []).find((f) => String(f.id) === String(recipeId));
            if (customMatch) {
              const rawIng = customMatch.ingredients || "";
              const ingredientsList = rawIng
                ? rawIng.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
                : ["Fresh premium ingredients prepared upon your order by our chefs."];

              setRecipe({
                id: customMatch.id,
                title: customMatch.title,
                description: customMatch.description,
                image: customMatch.image,
                cookTime: customMatch.cookTime || "25 mins",
                estimatedDeliveryTime: customMatch.estimatedDeliveryTime || "25 - 35 mins",
                price: parseFloat(customMatch.price) || 450,
                servings: 2,
                category: customMatch.category || "Chef Special",
                ingredients: ingredientsList,
                ingredientsScript: rawIng || ingredientsList.join(", "),
                instructions: [
                  customMatch.description || "Prepared with fresh organic ingredients and authentic seasoning.",
                ],
              });
              return;
            }
          }
          setRecipe(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading recipe detail:", error);
          setRecipe(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const checkFavoriteStatus = async () => {
      if (!userId || !recipeId) return;
      try {
        const response = await fetch(`${API_URL}/favorites/${userId}`);
        if (!response.ok || !isMounted) return;
        const favorites = await response.json();
        if (Array.isArray(favorites) && isMounted) {
          const isRecipeSaved = favorites.some((fav) => String(fav.recipeId) === String(recipeId));
          setIsSaved(isRecipeSaved);
        }
      } catch (error) {
        console.warn("Could not check favorites status (backend may be offline):", error.message);
      }
    };

    fetchRecipeDetail();
    checkFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [recipeId, userId]);

  const handleCopyIngredients = () => {
    if (!recipe) return;
    const scriptToCopy = recipe.ingredientsScript || (recipe.ingredients || []).join(", ");
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(scriptToCopy);
      }
    } catch (_err) {
      // ignore
    }
    setCopiedScript(true);
    Alert.alert(t("ingredientsCopied"), scriptToCopy);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleToggleSave = async () => {
    if (!userId) {
      Alert.alert(
        isAmharic ? "መግባት ያስፈልጋል" : "Sign In Required",
        isAmharic ? "ምግቦችን ወደ ተወዳጆች ለማስቀመጥ እባክዎን ይግቡ።" : "Please sign in to save recipes to your favorites."
      );
      return;
    }

    if (!recipe) return;

    setIsSaving(true);

    try {
      if (isSaved) {
        const response = await fetch(`${API_URL}/favorites/${userId}/${recipeId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to remove recipe");
        }

        setIsSaved(false);
      } else {
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            recipeId: parseInt(recipeId, 10),
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: String(recipe.servings),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to save recipe");
        }

        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
      Alert.alert(
        "Notice",
        error.message && !error.message.includes("Failed to fetch")
          ? error.message
          : "Unable to update favorites. Please ensure the backend server is running."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={isAmharic ? "ምግቡን በማዘጋጀት ላይ..." : "Loading recipe details..."} />;
  }

  if (!recipe) {
    return (
      <View
        style={[
          recipeDetailStyles.container,
          { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 24 },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={72} color={colors.primary} />
        <Text style={[recipeDetailStyles.errorTitle, { color: colors.text, marginTop: 16 }]}>
          {t("noRecipesFound")}
        </Text>
        <Text style={[recipeDetailStyles.errorDescription, { color: colors.textLight, marginBottom: 24 }]}>
          {t("tryDifferentCategory")}
        </Text>
        <TouchableOpacity
          style={[recipeDetailStyles.errorButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={recipeDetailStyles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allIngredientsText =
    recipe.ingredientsScript ||
    (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
      ? recipe.ingredients.join(", ")
      : "Authentic spices, fresh vegetables, seasoned butter and olive oil.");

  return (
    <View style={[recipeDetailStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER HERO */}
        <View style={recipeDetailStyles.headerContainer}>
          <View style={recipeDetailStyles.imageContainer}>
            <Image
              source={{ uri: recipe.image }}
              style={recipeDetailStyles.headerImage}
              contentFit="cover"
            />
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.92)"]}
            style={recipeDetailStyles.gradientOverlay}
          />

          <View style={recipeDetailStyles.floatingButtons}>
            <TouchableOpacity
              style={[recipeDetailStyles.floatingButton, { backgroundColor: "rgba(0,0,0,0.6)" }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              {/* Language Switcher */}
              <TouchableOpacity
                style={[recipeDetailStyles.floatingButton, { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, width: "auto" }]}
                onPress={toggleLanguage}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>
                  {isAmharic ? "EN" : "አማ"}
                </Text>
              </TouchableOpacity>

              {/* Theme Toggle */}
              <TouchableOpacity
                style={[recipeDetailStyles.floatingButton, { backgroundColor: "rgba(0,0,0,0.6)" }]}
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
              </TouchableOpacity>

              {/* Cart Button */}
              <TouchableOpacity
                style={[recipeDetailStyles.floatingButton, { backgroundColor: "rgba(0,0,0,0.6)" }]}
                onPress={() => router.push("/(tabs)/cart")}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
                {cartCount > 0 && (
                  <View style={customStyles.headerBadge}>
                    <Text style={customStyles.headerBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Favorite Button */}
              <TouchableOpacity
                style={[
                  recipeDetailStyles.floatingButton,
                  { backgroundColor: isSaved ? "#EF4444" : "rgba(0,0,0,0.6)" },
                ]}
                onPress={handleToggleSave}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isSaving ? "hourglass" : isSaved ? "heart" : "heart-outline"}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title Section */}
          <View style={recipeDetailStyles.titleSection}>
            <View style={[recipeDetailStyles.categoryBadge, { backgroundColor: colors.primary }]}>
              <Text style={recipeDetailStyles.categoryText}>{recipe.category}</Text>
            </View>
            <Text style={recipeDetailStyles.recipeTitle}>{recipe.title}</Text>
            {recipe.area ? (
              <View style={recipeDetailStyles.locationRow}>
                <Ionicons name="location" size={16} color="#FFFFFF" />
                <Text style={recipeDetailStyles.locationText}>{recipe.area} {t("cuisine")}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={recipeDetailStyles.contentSection}>
          {/* QUICK STATS */}
          <View style={recipeDetailStyles.statsContainer}>
            <View style={[recipeDetailStyles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="time" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[recipeDetailStyles.statValue, { color: colors.text }]}>{recipe.cookTime}</Text>
              <Text style={[recipeDetailStyles.statLabel, { color: colors.textSecondary }]}>{t("prepTime")}</Text>
            </View>

            <View style={[recipeDetailStyles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="people" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[recipeDetailStyles.statValue, { color: colors.text }]}>{recipe.servings}</Text>
              <Text style={[recipeDetailStyles.statLabel, { color: colors.textSecondary }]}>{t("servings")}</Text>
            </View>

            <View style={[recipeDetailStyles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LinearGradient
                colors={["#2E7D32", "#66BB6A"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="pricetag" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[recipeDetailStyles.statValue, { color: "#10B981" }]}>
                {formatPrice(mealPrice, language)}
              </Text>
              <Text style={[recipeDetailStyles.statLabel, { color: colors.textSecondary }]}>{t("price")}</Text>
            </View>

            <View style={[recipeDetailStyles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="flash" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[recipeDetailStyles.statValue, { color: "#D97706" }]}>
                {recipe.estimatedDeliveryTime || "30m"}
              </Text>
              <Text style={[recipeDetailStyles.statLabel, { color: colors.textSecondary }]}>{t("recommendedDelivery")}</Text>
            </View>
          </View>

          {/* Admin Delivery Notice */}
          <View
            style={[
              customStyles.deliveryNoticeBox,
              { backgroundColor: isDark ? "#2A1810" : "#FFF7ED", borderColor: "#FDBA74" },
            ]}
          >
            <Ionicons name="timer-outline" size={20} color="#D97706" style={{ marginRight: 10 }} />
            <Text style={[customStyles.deliveryNoticeText, { color: colors.text }]}>
              {t("adminDeliveryNotice")}{" "}
              <Text style={{ fontWeight: "800", color: "#D97706" }}>
                {recipe.estimatedDeliveryTime || "25 - 35 mins"}
              </Text>
            </Text>
          </View>

          {/* ORDER & ADD TO CART BOX */}
          <View style={[customStyles.orderBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={customStyles.quantityRow}>
              <Text style={[customStyles.quantityLabel, { color: colors.text }]}>{t("selectQuantity")}</Text>
              <View style={[customStyles.stepperWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={customStyles.stepperButton}
                  onPress={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={18} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[customStyles.stepperNum, { color: colors.text }]}>{orderQuantity}</Text>
                <TouchableOpacity
                  style={customStyles.stepperButton}
                  onPress={() => setOrderQuantity((q) => q + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[customStyles.addToCartBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                addToCart({ ...recipe, price: mealPrice }, orderQuantity);
                Alert.alert(
                  t("addedToCartAlert"),
                  `${orderQuantity}x "${recipe.title}" ${t("addedToCartDesc")}`,
                  [
                    { text: t("keepBrowsing"), style: "cancel" },
                    { text: t("viewCart"), onPress: () => router.push("/(tabs)/cart") },
                  ]
                );
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="cart" size={20} color="#FFFFFF" />
              <Text style={customStyles.addToCartBtnText}>
                {t("addToCart")} • {formatPrice(mealPrice * orderQuantity, language)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* INGREDIENTS SECTION WITH SCRIPT DISPLAY ALL AT ONCE */}
          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <LinearGradient
                colors={["#4CAF50", "#45a049"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="nutrition" size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[recipeDetailStyles.sectionTitle, { color: colors.text }]}>{t("ingredientsTitle")}</Text>
              <Text style={[recipeDetailStyles.countBadge, { backgroundColor: colors.border, color: colors.text }]}>
                {recipe.ingredients.length} {t("ingredientsCount")}
              </Text>
            </View>

            {/* Complete Ingredients Script & Summary Card (All Added & Shown At Once) */}
            <View
              style={[
                customStyles.ingredientsScriptCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={customStyles.scriptCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[customStyles.scriptCardTitle, { color: colors.text }]}>
                    {t("ingredientsScriptTitle")}
                  </Text>
                  <Text style={[customStyles.scriptCardDesc, { color: colors.textSecondary }]}>
                    {t("ingredientsScriptDesc")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[customStyles.copyScriptBtn, { backgroundColor: colors.primary }]}
                  onPress={handleCopyIngredients}
                  activeOpacity={0.7}
                >
                  <Ionicons name={copiedScript ? "checkmark-done" : "copy-outline"} size={16} color="#FFFFFF" />
                  <Text style={customStyles.copyScriptBtnText}>
                    {copiedScript ? (isAmharic ? "ተቀድቷል" : "Copied!") : (isAmharic ? "ቅዳ" : "Copy")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  customStyles.scriptTextBox,
                  { backgroundColor: isDark ? "#242424" : "#F9FAFB", borderColor: colors.border },
                ]}
              >
                <Text style={[customStyles.scriptTextContent, { color: colors.text }]}>
                  {allIngredientsText}
                </Text>
              </View>
            </View>

            {/* Formatted Individual Ingredient Chips */}
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
              <View style={recipeDetailStyles.ingredientsGrid}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View
                    key={index}
                    style={[
                      recipeDetailStyles.ingredientCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={[recipeDetailStyles.ingredientBullet, { backgroundColor: colors.primary }]} />
                    <Text style={[recipeDetailStyles.ingredientText, { color: colors.text }]}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* VIDEO TUTORIAL */}
          {recipe.youtubeUrl ? (
            <View style={recipeDetailStyles.sectionContainer}>
              <View style={recipeDetailStyles.sectionTitleRow}>
                <LinearGradient
                  colors={["#FF0000", "#CC0000"]}
                  style={recipeDetailStyles.sectionIcon}
                >
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[recipeDetailStyles.sectionTitle, { color: colors.text }]}>{t("videoTutorial")}</Text>
              </View>

              <View style={[recipeDetailStyles.videoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <WebView
                  style={recipeDetailStyles.webview}
                  source={{ uri: recipe.youtubeUrl }}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            </View>
          ) : null}

          {/* COOKING INSTRUCTIONS */}
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <View style={recipeDetailStyles.sectionContainer}>
              <View style={recipeDetailStyles.sectionTitleRow}>
                <LinearGradient
                  colors={["#FF9800", "#F57C00"]}
                  style={recipeDetailStyles.sectionIcon}
                >
                  <Ionicons name="restaurant" size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[recipeDetailStyles.sectionTitle, { color: colors.text }]}>{t("cookingInstructions")}</Text>
              </View>

              <View style={recipeDetailStyles.instructionsContainer}>
                {recipe.instructions.map((instruction, index) => (
                  <View
                    key={index}
                    style={[
                      recipeDetailStyles.instructionCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark || colors.primary]}
                      style={recipeDetailStyles.stepIndicator}
                    >
                      <Text style={recipeDetailStyles.stepNumber}>{index + 1}</Text>
                    </LinearGradient>
                    <View style={recipeDetailStyles.instructionContent}>
                      <Text style={[recipeDetailStyles.instructionText, { color: colors.text }]}>{instruction}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Secondary Favorite Button */}
          <TouchableOpacity
            style={[
              customStyles.secondaryFavButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={handleToggleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={20}
              color={isSaved ? "#EF4444" : colors.primary}
            />
            <Text
              style={[
                customStyles.secondaryFavText,
                { color: isSaved ? "#EF4444" : colors.primary },
              ]}
            >
              {isSaved ? t("removeFromFav") : t("saveToFav")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;

const customStyles = StyleSheet.create({
  deliveryNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  deliveryNoticeText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  headerBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  orderBox: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 2,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperButton: {
    padding: 6,
  },
  stepperNum: {
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 12,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
    elevation: 3,
  },
  addToCartBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ingredientsScriptCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  scriptCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
  },
  scriptCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  scriptCardDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  copyScriptBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  copyScriptBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  scriptTextBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  scriptTextContent: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  secondaryFavButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    marginTop: 8,
    marginBottom: 32,
  },
  secondaryFavText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
