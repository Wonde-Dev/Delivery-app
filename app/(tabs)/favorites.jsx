import { View, Text, Alert, TouchableOpacity, FlatList, RefreshControl, StyleSheet } from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { API_URL } from "../../constants/api";
import { favoritesStyles } from "../../assets/styles/favorites.styles";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const FavoritesScreen = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const userId = user?.id;
  const { colors, isDark, toggleTheme } = useTheme();
  const { isAmharic, toggleLanguage } = useLanguage();

  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadFavorites = useCallback(async (isPullToRefresh = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (isPullToRefresh) {
      setRefreshing(true);
    }

    try {
      setLoadError(null);
      const response = await fetch(`${API_URL}/favorites/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch favorites: HTTP ${response.status}`);
      }

      const favorites = await response.json();

      if (Array.isArray(favorites)) {
        const transformedFavorites = favorites.map((favorite) => ({
          ...favorite,
          id: favorite.recipeId,
        }));
        setFavoriteRecipes(transformedFavorites);
      } else {
        setFavoriteRecipes([]);
      }
    } catch (error) {
      console.warn("Error loading favorites:", error.message);
      setLoadError("Unable to connect to backend server. Make sure the backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleSignOut = () => {
    Alert.alert(isAmharic ? "መውጣት" : "Logout", isAmharic ? "እርግጠኛ ነዎት ከመለያዎ መውጣት ይፈልጋሉ?" : "Are you sure you want to logout?", [
      { text: isAmharic ? "ይቅር" : "Cancel", style: "cancel" },
      { text: isAmharic ? "ውጣ" : "Logout", style: "destructive", onPress: () => signOut() },
    ]);
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message={isAmharic ? "ተወዳጅ ምግቦች በመጫን ላይ..." : "Loading your favorites..."} />;
  }

  const renderHeader = () => (
    <View>
      <View style={[favoritesStyles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[favoritesStyles.title, { color: colors.text }]}>
          {isAmharic ? "ተወዳጅ ምግቦች" : "Favorites"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[favStyles.langBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[favStyles.langText, { color: colors.primary }]}>{isAmharic ? "EN" : "አማ"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={favoritesStyles.logoutButton}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={favoritesStyles.logoutButton} onPress={handleSignOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loadError ? (
        <View style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 13, textAlign: "center" }}>{loadError}</Text>
          <TouchableOpacity onPress={() => loadFavorites(true)} style={{ marginTop: 8, alignSelf: "center" }}>
            <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 13 }}>{isAmharic ? "እንደገና ሞክር" : "Retry"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[favoritesStyles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={favoriteRecipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={favoriteRecipes.length > 0 ? favoritesStyles.row : undefined}
        contentContainerStyle={[favoritesStyles.recipesSection, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFavorites(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={!loading && !loadError ? <NoFavoritesFound /> : null}
      />
    </View>
  );
};

export default FavoritesScreen;

const favStyles = StyleSheet.create({
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
