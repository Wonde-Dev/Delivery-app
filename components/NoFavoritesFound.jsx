import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { favoritesStyles } from "../assets/styles/favorites.styles";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function NoFavoritesFound() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAmharic } = useLanguage();

  return (
    <View style={favoritesStyles.emptyState}>
      <View style={favoritesStyles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color={colors.textLight} />
      </View>
      <Text style={[favoritesStyles.emptyTitle, { color: colors.text }]}>
        {isAmharic ? "እስካሁን ምንም ተወዳጅ ምግብ የለም" : "No favorites yet"}
      </Text>
      <TouchableOpacity
        style={[favoritesStyles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)")}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={18} color="#FFFFFF" />
        <Text style={favoritesStyles.exploreButtonText}>
          {isAmharic ? "ምግቦችን ያስሱ" : "Explore Recipes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default NoFavoritesFound;
