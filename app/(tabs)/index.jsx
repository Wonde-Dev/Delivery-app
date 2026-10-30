import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { MealAPI } from "../../services/mealAPI";
import { homeStyles } from "../../assets/styles/home.styles";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import CategoryFilter from "../../components/CategoryFilter";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_URL } from "../../constants/api";
import { formatPrice } from "../../utils/price";
import { useCart } from "../../context/CartContext";

const CATEGORY_DESCRIPTIONS = {
  Beef: {
    en: "Sizzling Ethiopian tibs, prime ribs & slow-simmered beef stews",
    am: "የጣፈጡ የበሬ ሥጋ ጥብሶች፣ የፍርፍር እና የቀይ ወጥ ዝግጅቶች",
    icon: "flame-outline",
  },
  Chicken: {
    en: "Rich traditional Doro Wat, golden crispy wings & tender poultry",
    am: "ባህላዊ የዶሮ ወጥ፣ የዶሮ ጥብስ እና የተጠበሱ የዶሮ ምግቦች",
    icon: "restaurant-outline",
  },
  Vegetarian: {
    en: "Clay-pot Shiro Tegabino, fasting platters & farm-fresh greens",
    am: "የሸክላ ሽሮ ተጋቢኖ፣ የጾም በያይነቱ እና ትኩስ የአትክልት ምግቦች",
    icon: "leaf-outline",
  },
  Seafood: {
    en: "Fresh catch grilled with zesty lemon butter & seaside herbs",
    am: "ትኩስ የዓሳ ጥብስ፣ በሎሚ እና ቅመማ ቅመም የተዘጋጁ የባህር ምግቦች",
    icon: "fish-outline",
  },
  Pasta: {
    en: "Handcrafted pasta tossed in artisanal sauces & parmesan",
    am: "በጣፋጭ ሶስ እና ቺዝ የተዘጋጁ የፓስታ እና ስፓጌቲ ምግቦች",
    icon: "pizza-outline",
  },
  Dessert: {
    en: "Decadent pastries, sweet confections & handcrafted dessert bites",
    am: "ጣፋጭ ኬኮች፣ ፔስትሪዎች እና ልዩ የጣፋጭ ምግቦች",
    icon: "ice-cream-outline",
  },
  Lamb: {
    en: "Tender roasted lamb cuts infused with wild rosemary & jus",
    am: "የበግ ሥጋ ጥብስ፣ አለጫ ወጥ እና የተጠበሱ የበግ ምግቦች",
    icon: "flame-outline",
  },
  Breakfast: {
    en: "Energizing morning platters, fresh eggs & warm beverages",
    am: "የቁርስ ምግቦች፣ እንቁላል ፍርፍር፣ ቂጣ እና ትኩስ መጠጦች",
    icon: "sunny-outline",
  },
  Starter: {
    en: "Crispy appetizers, savory sambusas & delicious sharing bites",
    am: "የመክፈቻ ምግቦች፣ ሳምቡሳ እና ጣፋጭ መክሰሶች",
    icon: "sparkles-outline",
  },
  Side: {
    en: "Fresh garden salads, warm artisanal breads & savory sides",
    am: "ተጨማሪ አጃቢ ምግቦች፣ ሰላጣ እና ትኩስ ዳቦ",
    icon: "nutrition-outline",
  },
  Goat: {
    en: "Slow-braised savory goat cuts simmered with wild Ethiopian herbs",
    am: "የፍየል ሥጋ ጥብስ እና በቅመማ ቅመም የበሰሉ ወጦች",
    icon: "bonfire-outline",
  },
  Vegan: {
    en: "Plant-based fasting specialties made with whole pulses & greens",
    am: "ንፁህ የጾም ምግቦች፣ ምስር፣ አተር እና የተመረጡ አትክልቶች",
    icon: "leaf-outline",
  },
  Pork: {
    en: "Pan-seared tender cuts caramelized with signature glaze",
    am: "የተጠበሱ እና በልዩ ቅመማ ቅመም የተዘጋጁ ምግቦች",
    icon: "restaurant-outline",
  },
};

const HomeScreen = () => {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, isAmharic, t, toggleLanguage } = useLanguage();
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [adminFoods, setAdminFoods] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(false);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [apiCategories, featuredMeal, foodsRes, annRes] = await Promise.all([
        MealAPI.getCategories().catch(() => []),
        MealAPI.getRandomMeal().catch(() => null),
        fetch(`${API_URL}/foods`).catch(() => null),
        fetch(`${API_URL}/announcements`).catch(() => null),
      ]);

      if (foodsRes?.ok) {
        const foodsData = await foodsRes.json();
        setAdminFoods(Array.isArray(foodsData) ? foodsData : []);
      }

      if (annRes?.ok) {
        const annData = await annRes.json();
        setAnnouncements(Array.isArray(annData) ? annData : []);
      }

      const transformedCategories = (apiCategories || []).map((cat, index) => ({
        id: index + 1,
        name: cat.strCategory,
        image: cat.strCategoryThumb,
        description: cat.strCategoryDescription,
      }));

      setCategories(transformedCategories);

      const defaultCategory =
        selectedCategory || (transformedCategories.length > 0 ? transformedCategories[0].name : "Beef");
      setSelectedCategory(defaultCategory);

      const categoryMeals = await MealAPI.filterByCategory(defaultCategory);
      if (categoryMeals && categoryMeals.length > 0) {
        const transformedMeals = categoryMeals
          .map((meal) => MealAPI.transformMealData(meal))
          .filter((meal) => meal !== null);
        setRecipes(transformedMeals);
      } else {
        const randomMeals = await MealAPI.getRandomMeals(12);
        const transformedMeals = randomMeals
          .map((meal) => MealAPI.transformMealData(meal))
          .filter((meal) => meal !== null);
        setRecipes(transformedMeals);
      }

      const transformedFeatured = MealAPI.transformMealData(featuredMeal);
      setFeaturedRecipe(transformedFeatured);
    } catch (error) {
      console.error("Error loading home screen data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const [apiCategories, featuredMeal, foodsRes, annRes] = await Promise.all([
          MealAPI.getCategories().catch(() => []),
          MealAPI.getRandomMeal().catch(() => null),
          fetch(`${API_URL}/foods`).catch(() => null),
          fetch(`${API_URL}/announcements`).catch(() => null),
        ]);

        if (!isMounted) return;

        if (foodsRes?.ok) {
          const foodsData = await foodsRes.json();
          setAdminFoods(Array.isArray(foodsData) ? foodsData : []);
        }

        if (annRes?.ok) {
          const annData = await annRes.json();
          setAnnouncements(Array.isArray(annData) ? annData : []);
        }

        const transformedCategories = (apiCategories || []).map((cat, index) => ({
          id: index + 1,
          name: cat.strCategory,
          image: cat.strCategoryThumb,
          description: cat.strCategoryDescription,
        }));

        setCategories(transformedCategories);

        const defaultCategory = transformedCategories.length > 0 ? transformedCategories[0].name : "Beef";
        setSelectedCategory(defaultCategory);

        const categoryMeals = await MealAPI.filterByCategory(defaultCategory);
        if (!isMounted) return;

        if (categoryMeals && categoryMeals.length > 0) {
          const transformedMeals = categoryMeals
            .map((meal) => MealAPI.transformMealData(meal))
            .filter((meal) => meal !== null);
          setRecipes(transformedMeals);
        } else {
          const randomMeals = await MealAPI.getRandomMeals(12);
          if (!isMounted) return;
          const transformedMeals = randomMeals
            .map((meal) => MealAPI.transformMealData(meal))
            .filter((meal) => meal !== null);
          setRecipes(transformedMeals);
        }

        const transformedFeatured = MealAPI.transformMealData(featuredMeal);
        setFeaturedRecipe(transformedFeatured);
      } catch (error) {
        console.error("Error loading home screen data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadCategoryData = async (category) => {
    try {
      setCategoryLoading(true);
      const meals = await MealAPI.filterByCategory(category);
      const transformedMeals = meals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
      setRecipes(transformedMeals);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    await loadCategoryData(category);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Preparing delicious menu..." />;
  }

  const renderHeader = () => (
    <View>
      {/* Top Navbar */}
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <Ionicons name="fast-food" size={24} color={colors.primary} />
          <Text style={[styles.brandTitle, { color: colors.text }]}>{t("brandName")}</Text>
        </View>

        <View style={styles.navActions}>
          {/* Language Toggle Pill */}
          <TouchableOpacity
            style={[styles.langToggleBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={[styles.langToggleText, { color: colors.primary }]}>
              {isAmharic ? "EN" : "አማ"}
            </Text>
          </TouchableOpacity>

          {/* Theme Toggle Button */}
          <TouchableOpacity
            style={[styles.navIconBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={colors.primary} />
          </TouchableOpacity>

          {/* Help & Support Button */}
          <TouchableOpacity
            style={[styles.navIconBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => router.push("/support")}
            activeOpacity={0.7}
          >
            <Ionicons name="headset-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Announcements Banner */}
      {announcements.length > 0 && !dismissedAnnouncements && (
        <View
          style={[
            styles.announcementBanner,
            { backgroundColor: isDark ? "#2A1810" : "#FFF7ED", borderColor: "#FDBA74" },
          ]}
        >
          <View style={styles.announcementLeft}>
            <View style={styles.announcementIconCircle}>
              <Ionicons name="megaphone" size={16} color="#EA580C" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.announcementBadgeRow}>
                <Text style={styles.announcementBadge}>{announcements[0].badge || t("announcementBadge")}</Text>
                <Text style={[styles.announcementHeadline, { color: colors.text }]}>
                  {announcements[0].title}
                </Text>
              </View>
              <Text style={[styles.announcementBody, { color: colors.textSecondary }]} numberOfLines={2}>
                {announcements[0].message}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => setDismissedAnnouncements(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {/* Chef & Admin Specials Carousel */}
      {adminFoods.length > 0 && (
        <View style={styles.adminSpecialsSection}>
          <View style={styles.sectionTitleRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{t("chefSpecialsTitle")}</Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {t("chefSpecialsSub")}
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialsScroll}>
            {adminFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={[styles.specialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/recipe/${food.id}`)}
                activeOpacity={0.8}
              >
                {food.image ? (
                  <Image source={{ uri: food.image }} style={styles.specialCardImg} contentFit="cover" />
                ) : null}

                {/* Delivery Time Badge */}
                <View style={styles.deliveryBadge}>
                  <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 2 }} />
                  <Text style={styles.deliveryBadgeText}>{food.estimatedDeliveryTime || "30m"}</Text>
                </View>

                <View style={styles.specialCardContent}>
                  <Text style={[styles.specialCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {food.title}
                  </Text>
                  <Text style={[styles.specialCardCategory, { color: colors.textSecondary }]}>
                    {food.category} • {food.cookTime || "20 mins"}
                  </Text>

                  <View style={styles.specialPriceRow}>
                    <Text style={[styles.specialCardPrice, { color: colors.primary }]}>
                      {formatPrice(food.price, language)}
                    </Text>
                    <TouchableOpacity
                      style={[styles.quickAddSpecialBtn, { backgroundColor: colors.primary }]}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        addToCart({ ...food, price: parseFloat(food.price) }, 1);
                      }}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* FEATURED MEAL SECTION */}
      {featuredRecipe && (
        <View style={homeStyles.featuredSection}>
          <TouchableOpacity
            style={homeStyles.featuredCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
          >
            <View style={homeStyles.featuredImageContainer}>
              <Image
                source={{ uri: featuredRecipe.image }}
                style={homeStyles.featuredImage}
                contentFit="cover"
                transition={500}
              />
              <View style={homeStyles.featuredOverlay}>
                <View style={homeStyles.featuredBadge}>
                  <Text style={homeStyles.featuredBadgeText}>{t("featuredToday")}</Text>
                </View>

                <View style={homeStyles.featuredContent}>
                  <Text style={homeStyles.featuredTitle} numberOfLines={2}>
                    {featuredRecipe.title}
                  </Text>

                  <View style={homeStyles.featuredMeta}>
                    <View style={homeStyles.metaItem}>
                      <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                      <Text style={homeStyles.metaText}>{featuredRecipe.cookTime}</Text>
                    </View>
                    <View style={homeStyles.metaItem}>
                      <Ionicons name="people-outline" size={16} color="#FFFFFF" />
                      <Text style={homeStyles.metaText}>{featuredRecipe.servings} {t("servings")}</Text>
                    </View>
                    {featuredRecipe.area ? (
                      <View style={homeStyles.metaItem}>
                        <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                        <Text style={homeStyles.metaText}>{featuredRecipe.area}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* Selected Category Header with Appetizing Culinary Subtitle */}
      <View style={homeStyles.recipesSection}>
        <View style={styles.categoryInfoCard}>
          <View style={styles.categoryInfoLeft}>
            <View style={[styles.categoryIconCircle, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons
                name={CATEGORY_DESCRIPTIONS[selectedCategory]?.icon || "restaurant-outline"}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[homeStyles.sectionTitle, { color: colors.text }]}>
                {selectedCategory || t("exploreDishes")}
              </Text>
              <Text style={[styles.categorySubtitleText, { color: colors.textSecondary }]}>
                {isAmharic
                  ? CATEGORY_DESCRIPTIONS[selectedCategory]?.am || "በሼፎቻችን የተዘጋጁ ምርጥ ምግቦች"
                  : CATEGORY_DESCRIPTIONS[selectedCategory]?.en ||
                    "Chef-crafted recipes prepared fresh with prime ingredients"}
              </Text>
            </View>
          </View>
          <View style={[styles.dishCountBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="flash" size={11} color={colors.primary} />
            <Text style={[styles.dishCountText, { color: colors.textSecondary }]}>
              {recipes.length} {isAmharic ? "ምግቦች" : "dishes"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[homeStyles.container, { backgroundColor: colors.background }]}>
      {categoryLoading ? (
        <View style={{ paddingVertical: 14, alignItems: "center" }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : null}

      <FlatList
        data={recipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={recipes.length > 0 ? homeStyles.row : undefined}
        contentContainerStyle={[homeStyles.scrollContent, homeStyles.recipesSection]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !categoryLoading ? (
            <View style={homeStyles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color={colors.textLight} />
              <Text style={[homeStyles.emptyTitle, { color: colors.text }]}>{t("noRecipesFound")}</Text>
              <Text style={[homeStyles.emptyDescription, { color: colors.textSecondary }]}>
                {t("tryDifferentCategory")}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langToggleBtn: {
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  announcementBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  announcementLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 8,
  },
  announcementIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  announcementBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  announcementBadge: {
    backgroundColor: "#EA580C",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  announcementHeadline: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  announcementBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  dismissBtn: {
    padding: 4,
  },
  adminSpecialsSection: {
    marginTop: 8,
    marginBottom: 12,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  sectionTitleRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  specialsScroll: {
    paddingLeft: 16,
  },
  specialCard: {
    width: 170,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 12,
    overflow: "hidden",
  },
  specialCardImg: {
    width: "100%",
    height: 105,
  },
  deliveryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveryBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  specialCardContent: {
    padding: 10,
  },
  specialCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  specialCardCategory: {
    fontSize: 11,
    marginBottom: 6,
  },
  specialPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  specialCardPrice: {
    fontSize: 14,
    fontWeight: "800",
  },
  quickAddSpecialBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingVertical: 4,
    gap: 12,
  },
  categoryInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  categorySubtitleText: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  dishCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  dishCountText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
