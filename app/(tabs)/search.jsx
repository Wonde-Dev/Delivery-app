import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { MealAPI } from "../../services/mealAPI";
import { useDebounce } from "../../hooks/useDebounce";
import { searchStyles } from "../../assets/styles/search.styles";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

function NoResultsFound() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <View style={searchStyles.emptyState}>
      <Ionicons name="search-outline" size={64} color={colors.textLight} />
      <Text style={[searchStyles.emptyTitle, { color: colors.text }]}>{t("noRecipesFound")}</Text>
      <Text style={[searchStyles.emptyDescription, { color: colors.textSecondary }]}>
        {t("tryDifferentCategory")}
      </Text>
    </View>
  );
}

const SearchScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { isAmharic, toggleLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const performSearch = async (query) => {
    const trimmed = (query || "").trim();

    if (!trimmed) {
      const randomMeals = await MealAPI.getRandomMeals(12);
      return randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
    }

    const nameResults = await MealAPI.searchMealsByName(trimmed);
    let results = nameResults;

    if (results.length === 0) {
      const ingredientResults = await MealAPI.filterByIngredient(trimmed);
      results = ingredientResults;
    }

    return results
      .slice(0, 12)
      .map((meal) => MealAPI.transformMealData(meal))
      .filter((meal) => meal !== null);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const randomMeals = await MealAPI.getRandomMeals(12);
        if (isMounted) {
          const transformedMeals = randomMeals
            .map((meal) => MealAPI.transformMealData(meal))
            .filter((meal) => meal !== null);
          setRecipes(transformedMeals);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading initial search data:", error);
          setRecipes([]);
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    let isCurrent = true;

    const handleSearch = async () => {
      setLoading(true);
      try {
        const results = await performSearch(debouncedSearchQuery);
        if (isCurrent) {
          setRecipes(results);
        }
      } catch (error) {
        if (isCurrent) {
          console.error("Error searching recipes:", error);
          setRecipes([]);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    handleSearch();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchQuery, initialLoading]);

  if (initialLoading) {
    return <LoadingSpinner message="Loading recipes..." />;
  }

  return (
    <View style={[searchStyles.container, { backgroundColor: colors.background }]}>
      <View style={[searchStyles.searchSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
            {isAmharic ? "ምግቦችን ይፈልጉ" : "Search Dishes"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={toggleLanguage}
              style={[localStyles.langBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[localStyles.langText, { color: colors.primary }]}>{isAmharic ? "EN" : "አማ"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={{ padding: 4 }}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[searchStyles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textLight}
            style={searchStyles.searchIcon}
          />
          <TextInput
            style={[searchStyles.searchInput, { color: colors.text }]}
            placeholder={isAmharic ? "የምግብ ስም ወይም ግብዓት ይፈልጉ..." : "Search recipes, ingredients..."}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={searchStyles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={searchStyles.resultsSection}>
        <View style={searchStyles.resultsHeader}>
          <Text style={[searchStyles.resultsTitle, { color: colors.text }]}>
            {searchQuery.trim()
              ? isAmharic
                ? `የ"${searchQuery.trim()}" ውጤቶች`
                : `Results for "${searchQuery.trim()}"`
              : isAmharic
              ? "ተወዳጅ ምግቦች"
              : "Popular Recipes"}
          </Text>
          <Text style={[searchStyles.resultsCount, { color: colors.textSecondary }]}>
            {recipes.length} {isAmharic ? "ምግቦች ተገኝተዋል" : "found"}
          </Text>
        </View>

        {loading ? (
          <View style={searchStyles.loadingContainer}>
            <LoadingSpinner message={isAmharic ? "ምግቦችን በመፈለግ ላይ..." : "Searching recipes..."} size="small" />
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={recipes.length > 0 ? searchStyles.row : undefined}
            contentContainerStyle={searchStyles.recipesGrid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NoResultsFound />}
          />
        )}
      </View>
    </View>
  );
};

export default SearchScreen;

const localStyles = StyleSheet.create({
  langBtn: {
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
