import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const ADMIN_EMAIL = "usawonder135@gmail.com";

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { cartCount } = useCart();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const userEmail = (user?.primaryEmailAddress?.emailAddress || "").toLowerCase();
  const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

  if (!isLoaded) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabMenu"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("tabSearch"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("tabCart"),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.white,
            fontSize: 10,
            fontWeight: "700",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t("tabFavorites"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isAdmin ? t("tabAdmin") : t("tabProfile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isAdmin ? "shield-checkmark" : "person"}
              size={size}
              color={isAdmin ? "#D97706" : color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
