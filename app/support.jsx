import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { API_URL } from "../constants/api";

const ADMIN_SUPPORT_EMAIL = "usawonder135@gmail.com";
const SUPPORT_PHONE = "+251 91 123 4567";

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { colors, isDark, toggleTheme } = useTheme();
  const { isAmharic, t, toggleLanguage } = useLanguage();

  const issueCategories = isAmharic
    ? [
        "የትዕዛዝ ሁኔታ እና የማድረሻ መዘግየት",
        "የምግብ ጥራት እና ማሸጊያ",
        "የክፍያ ወይም የቴሌብር ጉዳይ",
        "የመለያ እና የመግቢያ እርዳታ",
        "አጠቃላይ ጥያቄ ወይም አስተያየት",
      ]
    : [
        "Order Status & Delivery Delay",
        "Food Quality & Packaging",
        "Payment or Billing Issue",
        "Account & Login Help",
        "General Question / Feedback",
      ];

  const [name, setName] = useState(user?.fullName || user?.firstName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [selectedCategory, setSelectedCategory] = useState(issueCategories[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Load admin announcements
  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setAnnouncements(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Could not fetch announcements:", err.message);
      } finally {
        if (isMounted) setLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`[Delivery App Support Request] - ${selectedCategory}`);
    const body = encodeURIComponent(
      `Hello Support Team,\n\nCustomer: ${name}\nEmail: ${email}\n\nDetails:\n${message || "I need assistance with my order."}\n`
    );
    Linking.openURL(`mailto:${ADMIN_SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert(
        isAmharic ? "ቀጥታ ግንኙነት" : "Direct Contact",
        `${isAmharic ? "እባክዎን በቀጥታ ወደዚህ ኢሜይል ይላኩ፦" : "Please send an email directly to our support administrator at"} ${ADMIN_SUPPORT_EMAIL}`
      );
    });
  };

  const handleCallHotline = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, "")}`).catch(() => {
      Alert.alert(
        isAmharic ? "በስልክ ይደውሉ" : "Call Hotline",
        `${isAmharic ? "የደንበኞች አገልግሎት ለማግኘት እባክዎን ይደውሉ፦" : "Please dial"} ${SUPPORT_PHONE}`
      );
    });
  };

  const handleSubmitTicket = async () => {
    if (!email.trim() || !message.trim()) {
      Alert.alert(
        isAmharic ? "መረጃ ይጎድላል" : "Missing Fields",
        isAmharic ? "እባክዎን ኢሜይልዎን እና መልእክትዎን ያስገቡ።" : "Please provide your email address and describe your request."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "guest",
          userName: name.trim() || "Customer",
          userEmail: email.trim().toLowerCase(),
          subject: selectedCategory,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit support request");
      }

      const ticket = await res.json();
      Alert.alert(
        isAmharic ? "መልእክትዎ ተልኳል! 📬" : "Support Request Sent! 📬",
        isAmharic
          ? `እናመሰግናለን ${name || "ውድ ደንበኛ"}! የጥያቄ ቁጥር #${ticket.id || ""} ተመዝግቧል። አስተዳዳሪው በ ${email.trim()} ያነጋግርዎታል።`
          : `Thank you ${name || "valued customer"}! Your ticket #${ticket.id || ""} has been received. Our team will review your message and reach out to ${email.trim()} promptly.`,
        [{ text: "OK", onPress: () => setMessage("") }]
      );
    } catch (err) {
      Alert.alert(isAmharic ? "ስህተት" : "Submission Error", err.message || "Could not connect to support server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("supportTitle")}</Text>

        <View style={styles.headerRightActions}>
          {/* Language Toggle Pill */}
          <TouchableOpacity
            style={[styles.langTogglePill, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={[styles.langTogglePillText, { color: colors.primary }]}>
              {isAmharic ? "EN" : "አማ"}
            </Text>
          </TouchableOpacity>

          {/* Theme Toggle Button */}
          <TouchableOpacity style={styles.themeToggleBtn} onPress={toggleTheme}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Contact Cards */}
        <View style={styles.quickContactRow}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleSendEmail}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="mail" size={22} color="#2563EB" />
            </View>
            <Text style={[styles.quickCardTitle, { color: colors.text }]}>{t("emailAdminBtn")}</Text>
            <Text style={[styles.quickCardSubtitle, { color: colors.textSecondary }]}>{ADMIN_SUPPORT_EMAIL}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleCallHotline}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="call" size={22} color="#10B981" />
            </View>
            <Text style={[styles.quickCardTitle, { color: colors.text }]}>{t("callHotlineBtn")}</Text>
            <Text style={[styles.quickCardSubtitle, { color: colors.textSecondary }]}>{SUPPORT_PHONE}</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Announcements & Kitchen Alerts */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("officialAnnouncements")}</Text>
        </View>

        {loadingAnnouncements ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : announcements.length > 0 ? (
          announcements.map((item) => (
            <View
              key={item.id}
              style={[
                styles.announcementCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.announcementBadgeRow}>
                <View style={styles.announcementBadge}>
                  <Text style={styles.announcementBadgeText}>{item.badge || t("announcementBadge")}</Text>
                </View>
                <Text style={[styles.announcementDate, { color: colors.textLight }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.announcementTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.announcementMessage, { color: colors.textSecondary }]}>{item.message}</Text>
            </View>
          ))
        ) : (
          <View style={[styles.announcementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.announcementMessage, { color: colors.textSecondary }]}>
              {isAmharic
                ? "ኩሽናዎቻችን በመደበኛ ሁኔታ እየሠሩ ይገኛሉ። ለልዩ ቅናሾች በቅርቡ ይመለሱ!"
                : "All kitchens are currently running on schedule. Check back for seasonal offers and live updates!"}
            </Text>
          </View>
        )}

        {/* Support Message Form */}
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formHeaderRow}>
            <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
            <Text style={[styles.formCardTitle, { color: colors.text }]}>{t("writeToSupportTitle")}</Text>
          </View>
          <Text style={[styles.formCardDesc, { color: colors.textSecondary }]}>
            {t("writeToSupportDesc")}
          </Text>

          {/* Full Name */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t("fullName")}</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
            ]}
            placeholder={t("namePlaceholder")}
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
          />

          {/* Email Address */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t("emailAddress")} *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
            ]}
            placeholder={t("emailPlaceholder")}
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Issue Category */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t("supportCategoryLabel")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {issueCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  selectedCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: colors.text },
                    selectedCategory === cat && { color: "#FFFFFF", fontWeight: "700" },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Message Textarea */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t("messageDetailsLabel")}</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
            ]}
            placeholder={
              isAmharic
                ? "እባክዎን ጥያቄዎን ወይም ችግርዎን በዝርዝር ይግለጹ (የትዕዛዝ ቁጥር፣ አድራሻ ወዘተ)..."
                : "Please describe your question or issue in detail (order number, delivery address, etc.)..."
            }
            placeholderTextColor={colors.textLight}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }, submitting && { opacity: 0.7 }]}
            onPress={handleSubmitTicket}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnRow}>
                <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>{t("submitTicketBtn")}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Operating Hours Info */}
        <View style={[styles.infoBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.infoBannerTitle, { color: colors.text }]}>{t("operatingHoursTitle")}</Text>
            <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
              {t("operatingHoursDesc")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  themeToggleBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  quickContactRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  quickCardSubtitle: {
    fontSize: 11,
    textAlign: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  announcementCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  announcementBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  announcementBadge: {
    backgroundColor: "#EA580C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  announcementBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  announcementDate: {
    fontSize: 11,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  announcementMessage: {
    fontSize: 12,
    lineHeight: 17,
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 16,
  },
  formHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  formCardDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    paddingTop: 10,
  },
  categoryScroll: {
    marginBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  infoBanner: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
