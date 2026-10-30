import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_URL } from "../../constants/api";
import { formatPrice } from "../../utils/price";

const ADMIN_EMAIL = "usawonder135@gmail.com";

const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, isAmharic, t, toggleLanguage } = useLanguage();

  const userEmail = (user?.primaryEmailAddress?.emailAddress || "").toLowerCase();
  const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

  const adminSections = [
    { id: "orders", label: t("tabOrdersAdmin"), icon: "fast-food" },
    { id: "foods", label: t("tabAddFoodAdmin"), icon: "add-circle" },
    { id: "announcements", label: t("tabAnnounceAdmin"), icon: "megaphone" },
    { id: "users", label: t("tabUsersAdmin"), icon: "people" },
    { id: "support", label: t("tabSupportAdmin"), icon: "chatbubbles" },
  ];

  const [activeAdminTab, setActiveAdminTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // Modal: Approve Order & Set Delivery Time
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedOrderForApproval, setSelectedOrderForApproval] = useState(null);
  const [customDeliveryTime, setCustomDeliveryTime] = useState("25 - 35 mins");
  const [approving, setApproving] = useState(false);

  // Modal: Add New Food
  const [addFoodModalVisible, setAddFoodModalVisible] = useState(false);
  const [foodTitle, setFoodTitle] = useState("");
  const [foodCategory, setFoodCategory] = useState("Main Dish");
  const [foodPrice, setFoodPrice] = useState("");
  const [foodImage, setFoodImage] = useState("");
  const [foodCookTime, setFoodCookTime] = useState("20 mins");
  const [foodDeliveryTime, setFoodDeliveryTime] = useState("25 - 35 mins");
  const [foodIngredients, setFoodIngredients] = useState("");
  const [foodDescription, setFoodDescription] = useState("");
  const [submittingFood, setSubmittingFood] = useState(false);

  // Modal: Create Announcement
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcementBadge, setAnnouncementBadge] = useState("Special Offer");
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  // Modal: Reply to Support Ticket
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      if (isAdmin) {
        // Fetch Admin Data
        const [ordersRes, foodsRes, annRes, usersRes, supportRes] = await Promise.all([
          fetch(`${API_URL}/orders/all?adminEmail=${encodeURIComponent(userEmail)}`).catch(() => null),
          fetch(`${API_URL}/foods`).catch(() => null),
          fetch(`${API_URL}/announcements`).catch(() => null),
          fetch(`${API_URL}/admin/users?adminEmail=${encodeURIComponent(userEmail)}`).catch(() => null),
          fetch(`${API_URL}/support?adminEmail=${encodeURIComponent(userEmail)}`).catch(() => null),
        ]);

        if (ordersRes?.ok) {
          const data = await ordersRes.json();
          setOrders(Array.isArray(data) ? data : []);
        }
        if (foodsRes?.ok) {
          const data = await foodsRes.json();
          setFoods(Array.isArray(data) ? data : []);
        }
        if (annRes?.ok) {
          const data = await annRes.json();
          setAnnouncements(Array.isArray(data) ? data : []);
        }
        if (usersRes?.ok) {
          const data = await usersRes.json();
          setAppUsers(Array.isArray(data) ? data : []);
        }
        if (supportRes?.ok) {
          const data = await supportRes.json();
          setSupportTickets(Array.isArray(data) ? data : []);
        }
      } else if (user?.id) {
        // Fetch Customer Data
        const res = await fetch(`${API_URL}/orders/my/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.warn("Could not load profile/admin data:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, userEmail, user]);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        if (isAdmin) {
          const [ordersRes, foodsRes, annRes, usersRes, supportRes] = await Promise.all([
            fetch(`${API_URL}/orders/all?adminEmail=${encodeURIComponent(userEmail)}`).catch(() => null),
            fetch(`${API_URL}/foods`).catch(() => null),
            fetch(`${API_URL}/announcements`).catch(() => null),
            fetch(`${API_URL}/admin/users?adminEmail=${encodeURIComponent(userEmail)}`).catch(() => null),
            fetch(`${API_URL}/support?adminEmail=${encodeURIComponent(userEmail)}`).catch(() => null),
          ]);

          if (!isMounted) return;

          if (ordersRes?.ok) {
            const data = await ordersRes.json();
            setOrders(Array.isArray(data) ? data : []);
          }
          if (foodsRes?.ok) {
            const data = await foodsRes.json();
            setFoods(Array.isArray(data) ? data : []);
          }
          if (annRes?.ok) {
            const data = await annRes.json();
            setAnnouncements(Array.isArray(data) ? data : []);
          }
          if (usersRes?.ok) {
            const data = await usersRes.json();
            setAppUsers(Array.isArray(data) ? data : []);
          }
          if (supportRes?.ok) {
            const data = await supportRes.json();
            setSupportTickets(Array.isArray(data) ? data : []);
          }
        } else if (user?.id) {
          const res = await fetch(`${API_URL}/orders/my/${user.id}`);
          if (res?.ok && isMounted) {
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.warn("Could not load profile/admin data:", err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, userEmail, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Open Approval Modal
  const openApproveModal = (order) => {
    setSelectedOrderForApproval(order);
    setCustomDeliveryTime(order.estimatedDeliveryTime || "25 - 35 mins");
    setApprovalModalVisible(true);
  };

  // Submit Order Approval & Delivery Time
  const handleConfirmApproval = async () => {
    if (!selectedOrderForApproval) return;
    setApproving(true);
    try {
      const res = await fetch(`${API_URL}/orders/${selectedOrderForApproval.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userEmail,
          estimatedDeliveryTime: customDeliveryTime.trim() || "30 mins",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to approve order");
      }

      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setApprovalModalVisible(false);
      Alert.alert(
        "Order Approved! ✅",
        `Order #${updated.id} has been approved. Customer will receive delivery in ${updated.estimatedDeliveryTime}.`
      );
    } catch (error) {
      Alert.alert("Approval Error", error.message);
    } finally {
      setApproving(false);
    }
  };

  // Update Status directly
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!isAdmin) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userEmail,
          orderStatus: newStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update order status");
      }

      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: updated.orderStatus } : o)));
      Alert.alert("Status Updated", `Order #${orderId} is now "${newStatus}"`);
    } catch (error) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Add Food
  const handleAddFoodSubmit = async () => {
    if (!foodTitle.trim() || !foodPrice.trim()) {
      Alert.alert(isAmharic ? "መረጃ ይጎድላል" : "Missing Fields", isAmharic ? "የምግብ ስም እና ዋጋ አስፈላጊ ናቸው።" : "Food title and price are required.");
      return;
    }
    setSubmittingFood(true);
    try {
      const res = await fetch(`${API_URL}/foods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userEmail,
          title: foodTitle.trim(),
          category: foodCategory.trim(),
          price: foodPrice.trim(),
          image: foodImage.trim(),
          cookTime: foodCookTime.trim(),
          estimatedDeliveryTime: foodDeliveryTime.trim(),
          ingredients: foodIngredients.trim(),
          description: foodDescription.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add food item");
      }

      const newFood = await res.json();
      setFoods((prev) => [newFood, ...prev]);
      setAddFoodModalVisible(false);
      setFoodTitle("");
      setFoodPrice("");
      setFoodImage("");
      setFoodIngredients("");
      setFoodDescription("");
      Alert.alert(
        isAmharic ? "ምግብ በተሳካ ሁኔታ ተጨምሯል! 🍲" : "Food Added! 🍲",
        `"${newFood.title}" ${isAmharic ? "ወደ ህዝባዊ ሜኑ ተጨምሯል!" : `is now available on the menu with delivery in ${newFood.estimatedDeliveryTime}!`}`
      );
    } catch (err) {
      Alert.alert(isAmharic ? "ስህተት" : "Error Adding Food", err.message);
    } finally {
      setSubmittingFood(false);
    }
  };

  // Delete Food
  const handleDeleteFood = (id, title) => {
    Alert.alert("Delete Food", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${API_URL}/foods/${id}?adminEmail=${encodeURIComponent(userEmail)}`, {
              method: "DELETE",
            });
            setFoods((prev) => prev.filter((f) => f.id !== id));
          } catch (err) {
            Alert.alert("Delete Failed", err.message);
          }
        },
      },
    ]);
  };

  // Post Announcement
  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMsg.trim()) {
      Alert.alert("Missing Fields", "Title and message are required.");
      return;
    }
    setSubmittingAnnouncement(true);
    try {
      const res = await fetch(`${API_URL}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userEmail,
          title: announcementTitle.trim(),
          message: announcementMsg.trim(),
          badge: announcementBadge.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to broadcast announcement");

      const created = await res.json();
      setAnnouncements((prev) => [created, ...prev]);
      setAnnouncementModalVisible(false);
      setAnnouncementTitle("");
      setAnnouncementMsg("");
      Alert.alert("Broadcast Published! 📢", "All users will now see this announcement.");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  // Toggle User Approval
  const handleToggleUserApproval = async (uId, currentStatus) => {
    const nextStatus = currentStatus === "Approved" ? "Pending" : "Approved";
    try {
      const res = await fetch(`${API_URL}/admin/users/${uId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userEmail,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppUsers((prev) => prev.map((u) => (u.userId === uId || u.id === uId ? updated : u)));
        Alert.alert("User Updated", `User status changed to "${nextStatus}".`);
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // Reply to Support
  const handleReplySupport = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`${API_URL}/support/${selectedTicket.id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userEmail,
          reply: replyText.trim(),
          status: "Resolved",
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSupportTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setReplyModalVisible(false);
        setReplyText("");
        Alert.alert("Reply Sent", `Resolved ticket #${updated.id}.`);
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            console.error("Sign out error:", err);
          }
        },
      },
    ]);
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === "all") return true;
    return (o.orderStatus || "").toLowerCase() === activeFilter.toLowerCase();
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isAdmin ? t("adminHeadquarters") : t("myAccount")}
        </Text>
        <View style={styles.headerRightActions}>
          {/* Language Switcher Pill */}
          <TouchableOpacity
            style={[styles.langTogglePill, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={[styles.langTogglePillText, { color: colors.primary }]}>
              {isAmharic ? "EN" : "አማ"}
            </Text>
          </TouchableOpacity>

          {/* Theme Switcher Toggle */}
          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme} activeOpacity={0.7}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
          </TouchableOpacity>
          {/* Help & Support Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/support")}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          {/* Sign Out Button */}
          <TouchableOpacity style={styles.iconButton} onPress={handleSignOut} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.avatarWrapper}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  isAdmin
                    ? { backgroundColor: "#FFF8E1", borderColor: "#FFA000" }
                    : { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name={isAdmin ? "shield-checkmark" : "person"}
                  size={36}
                  color={isAdmin ? "#D97706" : colors.primary}
                />
              </View>
            )}
            {isAdmin && (
              <View style={styles.adminCrownBadge}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.fullName || user?.firstName || (isAdmin ? (isAmharic ? "ዋና አስተዳዳሪ" : "Primary Administrator") : (isAmharic ? "ደንበኛ" : "Customer"))}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userEmail}</Text>

          {/* Role Badge */}
          <View
            style={[
              styles.roleBadge,
              isAdmin
                ? { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }
                : { backgroundColor: isDark ? "#242424" : "#F3F4F6", borderColor: colors.border },
            ]}
          >
            <Ionicons
              name={isAdmin ? "shield-checkmark" : "person-circle"}
              size={16}
              color={isAdmin ? "#B45309" : colors.primary}
            />
            <Text
              style={[
                styles.roleBadgeText,
                isAdmin ? { color: "#B45309" } : { color: colors.primary },
              ]}
            >
              {isAdmin ? t("administratorRole") : t("customerRole")}
            </Text>
          </View>
        </View>

        {/* ADMIN CONTROL CENTER */}
        {isAdmin && (
          <View style={{ marginBottom: 16 }}>
            {/* KPI Stats */}
            <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>{orders.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("totalOrdersKpi")}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#D97706" }]}>
                  {orders.filter((o) => (o.orderStatus || "").toLowerCase() === "pending").length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("pendingKpi")}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#10B981" }]}>{formatPrice(totalRevenue, language)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("revenueKpi")}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{foods.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("dishesKpi")}</Text>
              </View>
            </View>

            {/* Admin Section Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.adminTabScroll}>
              {adminSections.map((sec) => {
                const isSelected = activeAdminTab === sec.id;
                return (
                  <TouchableOpacity
                    key={sec.id}
                    style={[
                      styles.adminTabButton,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setActiveAdminTab(sec.id)}
                  >
                    <Ionicons
                      name={sec.icon}
                      size={16}
                      color={isSelected ? "#FFFFFF" : colors.text}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.adminTabButtonText,
                        { color: colors.text },
                        isSelected && { color: "#FFFFFF", fontWeight: "700" },
                      ]}
                    >
                      {sec.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* TAB 1: FOOD ORDERS */}
        {(!isAdmin || activeAdminTab === "orders") && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {isAdmin ? t("customerFoodOrders") : t("myOrderHistory")}
              </Text>
              <Text style={[styles.ordersCountBadge, { backgroundColor: colors.primary }]}>{orders.length}</Text>
            </View>

            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {[
                { key: "all", label: t("filterAll") },
                { key: "pending", label: t("filterPending") },
                { key: "approved", label: t("filterApproved") },
                { key: "preparing", label: t("filterPreparing") },
                { key: "out for delivery", label: t("filterOnWay") },
                { key: "delivered", label: t("filterDelivered") },
              ].map((f) => {
                const isSelected = activeFilter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.filterPill,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setActiveFilter(f.key)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: colors.textSecondary },
                        isSelected && { color: "#FFFFFF", fontWeight: "700" },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {loading ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 32 }} />
            ) : filteredOrders.length === 0 ? (
              <View style={[styles.emptyOrdersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="fast-food-outline" size={48} color={colors.textLight} />
                <Text style={[styles.emptyOrdersTitle, { color: colors.text }]}>
                  {isAmharic ? "ምንም ትዕዛዝ አልተገኘም" : "No Orders Found"}
                </Text>
                <Text style={[styles.emptyOrdersSub, { color: colors.textSecondary }]}>
                  {isAdmin
                    ? (isAmharic ? "በደንበኞች የሚገቡ ትዕዛዞች እዚህ በቅጽበት ይታያሉ።" : "Orders submitted by customers will appear here in real time.")
                    : (isAmharic ? "እስካሁን ምንም ትዕዛዝ አላስገቡም። አሁኑኑ ጣፋጭ ምግቦችን ይዘዙ!" : "You haven't placed any orders yet. Discover delicious recipes now!")}
                </Text>
              </View>
            ) : (
              filteredOrders.map((order) => {
                let itemsList = [];
                try {
                  itemsList = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
                } catch {
                  itemsList = [];
                }

                const isPending = (order.orderStatus || "").toLowerCase() === "pending";

                return (
                  <View
                    key={order.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    {/* Header */}
                    <View style={styles.orderCardHeader}>
                      <View>
                        <Text style={[styles.orderIdText, { color: colors.text }]}>Order #{order.id}</Text>
                        <Text style={[styles.orderDateText, { color: colors.textLight }]}>
                          {new Date(order.createdAt).toLocaleString()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          order.orderStatus === "Delivered"
                            ? styles.statusDelivered
                            : order.orderStatus === "Approved"
                            ? styles.statusApproved
                            : order.orderStatus === "Out for Delivery"
                            ? styles.statusOutForDelivery
                            : isPending
                            ? styles.statusPending
                            : styles.statusPreparing,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {order.orderStatus || "Pending"}
                        </Text>
                      </View>
                    </View>

                    {/* Customer Location & Contact (Essential for Admin Delivery) */}
                    <View
                      style={[
                        styles.deliveryLocationBox,
                        { backgroundColor: isDark ? "#242424" : "#F8F9FA", borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.contactRow}>
                        <Ionicons name="person" size={15} color={colors.primary} />
                        <Text style={[styles.contactName, { color: colors.text }]}>
                          {order.userName || "Customer"}
                        </Text>
                        <Text style={[styles.contactEmail, { color: colors.textSecondary }]}>
                          ({order.userEmail})
                        </Text>
                      </View>

                      {order.customerPhone ? (
                        <TouchableOpacity
                          style={styles.phoneClickableRow}
                          onPress={() => Linking.openURL(`tel:${order.customerPhone}`)}
                        >
                          <Ionicons name="call" size={15} color="#10B981" />
                          <Text style={styles.phoneText}>{order.customerPhone}</Text>
                          <Text style={styles.callHint}>({isAmharic ? "ለመደወል ይጫኑ" : "Tap to call"})</Text>
                        </TouchableOpacity>
                      ) : null}

                      <View style={styles.addressRow}>
                        <Ionicons name="location" size={15} color="#EF4444" />
                        <Text style={[styles.addressText, { color: colors.text }]}>
                          {order.deliveryAddress}
                          {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                        </Text>
                      </View>

                      {order.preferredDeliveryTime ? (
                        <View style={styles.timeRow}>
                          <Ionicons name="time" size={15} color="#D97706" />
                          <Text style={[styles.timeText, { color: colors.text }]}>
                            {t("customerPreferredArrival")}{" "}
                            <Text style={{ fontWeight: "700" }}>{order.preferredDeliveryTime}</Text>
                          </Text>
                        </View>
                      ) : null}

                      {order.estimatedDeliveryTime ? (
                        <View style={styles.adminTimeRow}>
                          <Ionicons name="checkmark-done" size={15} color="#10B981" />
                          <Text style={styles.adminTimeText}>
                            {t("kitchenDeliveryWindow")}{" "}
                            <Text style={{ fontWeight: "700" }}>{order.estimatedDeliveryTime}</Text>
                          </Text>
                        </View>
                      ) : null}

                      {order.deliveryNotes ? (
                        <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                          Note: &quot;{order.deliveryNotes}&quot;
                        </Text>
                      ) : null}
                    </View>

                    {/* Ordered Food Items */}
                    <Text style={[styles.itemsHeader, { color: colors.text }]}>
                      {isAmharic ? "የታዘዙ ምግቦች፦" : "Ordered Meals:"}
                    </Text>
                    {itemsList.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={[styles.itemTitle, { color: colors.text }]}>
                          {item.quantity}x {item.title}
                        </Text>
                        <Text style={[styles.itemPrice, { color: colors.primary }]}>
                          {formatPrice((item.price || 0) * (item.quantity || 1), language)}
                        </Text>
                      </View>
                    ))}

                    {/* Total & Payment */}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.orderFooterRow}>
                      <View>
                        <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                          {order.paymentMethod}
                        </Text>
                        <Text style={[styles.paymentStatusLabel, { color: "#10B981" }]}>
                          ● {order.paymentStatus || "Paid"}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t("totalToPay")}</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>
                          {formatPrice(order.totalAmount, language)}
                        </Text>
                      </View>
                    </View>

                    {/* Admin Action Buttons */}
                    {isAdmin && (
                      <View style={styles.adminActionContainer}>
                        {isPending && (
                          <TouchableOpacity
                            style={[styles.approveButton, { backgroundColor: "#10B981" }]}
                            onPress={() => openApproveModal(order)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.approveButtonText}>{t("approveAndSetTimeBtn")}</Text>
                          </TouchableOpacity>
                        )}

                        <View style={styles.statusButtonsRow}>
                          {["Preparing", "Out for Delivery", "Delivered"].map((st) => (
                            <TouchableOpacity
                              key={st}
                              style={[
                                styles.quickStatusBtn,
                                { backgroundColor: colors.background, borderColor: colors.border },
                                order.orderStatus === st && { backgroundColor: colors.primary, borderColor: colors.primary },
                              ]}
                              onPress={() => handleUpdateStatus(order.id, st)}
                              disabled={updatingId === order.id}
                            >
                              <Text
                                style={[
                                  styles.quickStatusText,
                                  { color: colors.text },
                                  order.orderStatus === st && { color: "#FFFFFF", fontWeight: "700" },
                                ]}
                              >
                                {st}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: ADD FOOD & MANAGE FOODS (ADMIN) */}
        {isAdmin && activeAdminTab === "foods" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{t("menuManagement")} ({foods.length})</Text>
              <TouchableOpacity
                style={[styles.addNewButton, { backgroundColor: colors.primary }]}
                onPress={() => setAddFoodModalVisible(true)}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addNewButtonText}>{t("addNewFoodBtn")}</Text>
              </TouchableOpacity>
            </View>

            {foods.length === 0 ? (
              <View style={[styles.emptyOrdersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="restaurant-outline" size={48} color={colors.textLight} />
                <Text style={[styles.emptyOrdersTitle, { color: colors.text }]}>
                  {isAmharic ? "ምንም አይነት የተጨመረ ምግብ የለም" : "No Custom Dishes Added"}
                </Text>
                <Text style={[styles.emptyOrdersSub, { color: colors.textSecondary }]}>
                  {isAmharic ? "አዳዲስ ምግቦችን በብር ዋጋ እና በማድረሻ ጊዜ እዚህ ይጨምሩ።" : "Add your restaurant specials with custom prices and recommended delivery times."}
                </Text>
              </View>
            ) : (
              foods.map((food) => (
                <View
                  key={food.id}
                  style={[styles.foodItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  {food.image ? (
                    <Image source={{ uri: food.image }} style={styles.foodThumb} contentFit="cover" />
                  ) : null}
                  <View style={{ flex: 1, marginLeft: food.image ? 12 : 0 }}>
                    <Text style={[styles.foodItemTitle, { color: colors.text }]}>{food.title}</Text>
                    <Text style={[styles.foodItemCategory, { color: colors.textSecondary }]}>
                      {food.category} • {food.cookTime || "20 mins"}
                    </Text>
                    <Text style={[styles.foodItemDeliveryTime, { color: "#D97706" }]}>
                      ⚡ {t("recommendedDelivery")}: {food.estimatedDeliveryTime || "30 mins"}
                    </Text>
                    <Text style={[styles.foodItemPrice, { color: colors.primary }]}>{formatPrice(food.price, language)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteFoodBtn}
                    onPress={() => handleDeleteFood(food.id, food.title)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: ANNOUNCEMENTS (ADMIN) */}
        {isAdmin && activeAdminTab === "announcements" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{t("announcementsTitle")} ({announcements.length})</Text>
              <TouchableOpacity
                style={[styles.addNewButton, { backgroundColor: colors.primary }]}
                onPress={() => setAnnouncementModalVisible(true)}
              >
                <Ionicons name="megaphone" size={16} color="#FFFFFF" />
                <Text style={styles.addNewButtonText}>{t("postAlertBtn")}</Text>
              </TouchableOpacity>
            </View>

            {announcements.map((ann) => (
              <View
                key={ann.id}
                style={[styles.announcementAdminCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.annBadgeRow}>
                  <Text style={styles.annBadgeText}>{ann.badge || "Special Offer"}</Text>
                  <Text style={[styles.annDateText, { color: colors.textLight }]}>
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.annTitleText, { color: colors.text }]}>{ann.title}</Text>
                <Text style={[styles.annMsgText, { color: colors.textSecondary }]}>{ann.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: APP USERS & APPROVALS (ADMIN) */}
        {isAdmin && activeAdminTab === "users" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{t("userPortfolios")}</Text>
              <Text style={[styles.ordersCountBadge, { backgroundColor: colors.primary }]}>{appUsers.length}</Text>
            </View>

            {appUsers.map((u) => {
              const isApproved = (u.status || "Approved").toLowerCase() === "approved";
              return (
                <View
                  key={u.id || u.userId}
                  style={[styles.userListItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.userListLeft}>
                    <View style={[styles.userListAvatar, { backgroundColor: isApproved ? "#ECFDF5" : "#FEF2F2" }]}>
                      <Ionicons
                        name={isApproved ? "person-circle" : "alert-circle"}
                        size={28}
                        color={isApproved ? "#10B981" : "#EF4444"}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.userListName, { color: colors.text }]}>{u.name || "Customer"}</Text>
                      <Text style={[styles.userListEmail, { color: colors.textSecondary }]}>{u.email}</Text>
                      {u.phone ? (
                        <Text style={[styles.userListPhone, { color: colors.primary }]}>📞 {u.phone}</Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.approvalToggleBtn,
                      { backgroundColor: isApproved ? "#10B981" : "#EF4444" },
                    ]}
                    onPress={() => handleToggleUserApproval(u.userId || u.id, u.status)}
                  >
                    <Text style={styles.approvalToggleText}>
                      {isApproved ? (isAmharic ? "የጸደቀ" : "Approved") : (isAmharic ? "በመጠባበቅ" : "Pending")}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 5: SUPPORT INQUIRIES (ADMIN) */}
        {isAdmin && activeAdminTab === "support" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{t("supportMessagesTitle")}</Text>
              <Text style={[styles.ordersCountBadge, { backgroundColor: colors.primary }]}>{supportTickets.length}</Text>
            </View>

            {supportTickets.length === 0 ? (
              <View style={[styles.emptyOrdersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
                <Text style={[styles.emptyOrdersTitle, { color: colors.text }]}>
                  {isAmharic ? "ምንም የድጋፍ መልእክት የለም" : "No Support Inquiries"}
                </Text>
                <Text style={[styles.emptyOrdersSub, { color: colors.textSecondary }]}>
                  {isAmharic ? "ደንበኞች ጥያቄ ሲልኩ እዚህ ለፈጣን ምላሽ ይታያል።" : "When customers submit help requests, they will show here for instant reply."}
                </Text>
              </View>
            ) : (
              supportTickets.map((ticket) => (
                <View
                  key={ticket.id}
                  style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.ticketHeaderRow}>
                    <Text style={[styles.ticketSubject, { color: colors.text }]}>{ticket.subject}</Text>
                    <View
                      style={[
                        styles.ticketStatusBadge,
                        ticket.status === "Resolved" ? { backgroundColor: "#ECFDF5" } : { backgroundColor: "#FEF2F2" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.ticketStatusText,
                          ticket.status === "Resolved" ? { color: "#10B981" } : { color: "#EF4444" },
                        ]}
                      >
                        {ticket.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.ticketAuthor, { color: colors.primary }]}>
                    From: {ticket.userName} ({ticket.userEmail})
                  </Text>
                  <Text style={[styles.ticketMessage, { color: colors.textSecondary }]}>{ticket.message}</Text>

                  {ticket.adminReply ? (
                    <View style={[styles.replyBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[styles.replyHeading, { color: "#10B981" }]}>{t("yourReplyHeading")}</Text>
                      <Text style={[styles.replyBody, { color: colors.text }]}>{ticket.adminReply}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.replyButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setSelectedTicket(ticket);
                        setReplyModalVisible(true);
                      }}
                    >
                      <Ionicons name="arrow-undo" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.replyButtonText}>{t("replyToCustomer")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: APPROVE ORDER & SET DELIVERY TIME */}
      <Modal visible={approvalModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("approveOrderTitle")} #{selectedOrderForApproval?.id}
              </Text>
              <TouchableOpacity onPress={() => setApprovalModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Customer: {selectedOrderForApproval?.userName} ({selectedOrderForApproval?.customerPhone})
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Destination: {selectedOrderForApproval?.deliveryAddress}
            </Text>

            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
              {t("confirmedDeliveryTimeLabel")}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="e.g. 25 - 35 mins or 15:45 PM"
              placeholderTextColor={colors.textLight}
              value={customDeliveryTime}
              onChangeText={setCustomDeliveryTime}
            />

            <View style={styles.presetRow}>
              {["20 - 30 mins", "30 - 45 mins", "45 - 60 mins"].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetPill,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    customDeliveryTime === preset && { borderColor: colors.primary, backgroundColor: "#FFF7ED" },
                  ]}
                  onPress={() => setCustomDeliveryTime(preset)}
                >
                  <Text style={[styles.presetText, { color: colors.text }]}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: "#10B981" }]}
              onPress={handleConfirmApproval}
              disabled={approving}
            >
              {approving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>{t("confirmApprovalBtn")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ADD NEW FOOD */}
      <Modal visible={addFoodModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t("addNewFoodBtn")}</Text>
                <TouchableOpacity onPress={() => setAddFoodModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textLight} />
                </TouchableOpacity>
              </View>

              {/* Meal Title */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodTitleLabel")}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={isAmharic ? "ለምሳሌ፦ ልዩ የበሬ ጥብስ" : "e.g. Special Beef Tibs"}
                placeholderTextColor={colors.textLight}
                value={foodTitle}
                onChangeText={setFoodTitle}
              />

              {/* Category */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodCategoryLabel")}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={isAmharic ? "ለምሳሌ፦ ባህላዊ ምግብ / Beef / Fast Food" : "e.g. Habesha / Beef / Vegetarian"}
                placeholderTextColor={colors.textLight}
                value={foodCategory}
                onChangeText={setFoodCategory}
              />

              {/* Price in ETB */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodPriceLabel")}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="480"
                placeholderTextColor={colors.textLight}
                value={foodPrice}
                onChangeText={setFoodPrice}
                keyboardType="decimal-pad"
              />

              {/* Cook Time */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodPrepTimeLabel")}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="20 mins"
                placeholderTextColor={colors.textLight}
                value={foodCookTime}
                onChangeText={setFoodCookTime}
              />

              {/* Delivery Window */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodDeliveryTimeLabel")}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="25 - 35 mins"
                placeholderTextColor={colors.textLight}
                value={foodDeliveryTime}
                onChangeText={setFoodDeliveryTime}
              />

              {/* Ingredients Script - Enter all at once */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodIngredientsLabel")}</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { height: 85, backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                ]}
                placeholder={t("foodIngredientsPlaceholder")}
                placeholderTextColor={colors.textLight}
                value={foodIngredients}
                onChangeText={setFoodIngredients}
                multiline
              />

              {/* Image URL */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodImageLabel")}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="https://..."
                placeholderTextColor={colors.textLight}
                value={foodImage}
                onChangeText={setFoodImage}
                autoCapitalize="none"
              />

              {/* Description */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t("foodDescLabel")}</Text>
              <TextInput
                style={[styles.modalInput, { height: 75, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={isAmharic ? "ስለ ምግቡ ዝርዝር መግለጫ..." : "Chef notes, preparation highlights, flavors..."}
                placeholderTextColor={colors.textLight}
                value={foodDescription}
                onChangeText={setFoodDescription}
                multiline
              />

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddFoodSubmit}
                disabled={submittingFood}
              >
                {submittingFood ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>{t("submitFoodBtn")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 3: BROADCAST ANNOUNCEMENT */}
      <Modal visible={announcementModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("announcementsTitle")}</Text>
              <TouchableOpacity onPress={() => setAnnouncementModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("annHeadlineLabel")}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. 20% Off Weekend Special!"
              placeholderTextColor={colors.textLight}
              value={announcementTitle}
              onChangeText={setAnnouncementTitle}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("annBadgeLabel")}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Special Offer / Kitchen Update / Urgent Notice"
              placeholderTextColor={colors.textLight}
              value={announcementBadge}
              onChangeText={setAnnouncementBadge}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>{t("annMsgLabel")}</Text>
            <TextInput
              style={[styles.modalInput, { height: 90, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Write the message displayed to all app customers..."
              placeholderTextColor={colors.textLight}
              value={announcementMsg}
              onChangeText={setAnnouncementMsg}
              multiline
            />

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreateAnnouncement}
              disabled={submittingAnnouncement}
            >
              {submittingAnnouncement ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>{t("publishAnnouncementBtn")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: REPLY TO SUPPORT TICKET */}
      <Modal visible={replyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("replyToCustomer")} #{selectedTicket?.id}
              </Text>
              <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Customer: {selectedTicket?.userName} ({selectedTicket?.userEmail})
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.text, marginTop: 4 }]}>
              Inquiry: &quot;{selectedTicket?.message}&quot;
            </Text>

            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>{t("yourReplyHeading")}</Text>
            <TextInput
              style={[styles.modalInput, { height: 90, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Write your resolution or answer to the customer..."
              placeholderTextColor={colors.textLight}
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: "#10B981" }]}
              onPress={handleReplySupport}
              disabled={submittingReply}
            >
              {submittingReply ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>{t("sendReplyBtn")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

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
    maxWidth: 850,
    alignSelf: "center",
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
  langTogglePill: {
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  langTogglePillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  iconButton: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
  },
  userCard: {
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  adminCrownBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#F59E0B",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statsCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 14,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  adminTabScroll: {
    flexDirection: "row",
    marginBottom: 16,
  },
  adminTabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  adminTabButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "700",
  },
  ordersCountBadge: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addNewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  filterScroll: {
    flexDirection: "row",
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyOrdersCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyOrdersTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyOrdersSub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  orderCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: "700",
  },
  orderDateText: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusApproved: {
    backgroundColor: "#DBEAFE",
  },
  statusPreparing: {
    backgroundColor: "#FFFBEB",
  },
  statusOutForDelivery: {
    backgroundColor: "#F3E8FF",
  },
  statusDelivered: {
    backgroundColor: "#ECFDF5",
  },
  deliveryLocationBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactName: {
    fontSize: 13,
    fontWeight: "700",
  },
  contactEmail: {
    fontSize: 12,
  },
  phoneClickableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phoneText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
  },
  callHint: {
    color: "#6B7280",
    fontSize: 11,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addressText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 12,
  },
  adminTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminTimeText: {
    color: "#10B981",
    fontSize: 12,
  },
  notesText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  itemsHeader: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 13,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  orderFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 12,
  },
  paymentStatusLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  totalLabel: {
    fontSize: 11,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  adminActionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  statusButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickStatusBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  quickStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  foodItemCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: "center",
  },
  foodThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  foodItemTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  foodItemCategory: {
    fontSize: 11,
    marginTop: 2,
  },
  foodItemDeliveryTime: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  foodItemPrice: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  deleteFoodBtn: {
    padding: 8,
  },
  announcementAdminCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  annBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  annBadgeText: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  annDateText: {
    fontSize: 11,
  },
  annTitleText: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  annMsgText: {
    fontSize: 12,
    lineHeight: 18,
  },
  userListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  userListLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  userListAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  userListName: {
    fontSize: 14,
    fontWeight: "700",
  },
  userListEmail: {
    fontSize: 11,
  },
  userListPhone: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  approvalToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  approvalToggleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  ticketCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  ticketHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  ticketStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ticketStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  ticketAuthor: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  ticketMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  replyBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  replyHeading: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  replyBody: {
    fontSize: 12,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  replyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 18,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  presetText: {
    fontSize: 11,
    fontWeight: "600",
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
