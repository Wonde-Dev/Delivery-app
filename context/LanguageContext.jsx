import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const LANGUAGE_STORAGE_KEY = "app_language_v1";

export const TRANSLATIONS = {
  en: {
    // Navigation / Tabs
    tabMenu: "Menu",
    tabSearch: "Search",
    tabCart: "Cart",
    tabFavorites: "Favorites",
    tabProfile: "Profile",
    tabAdmin: "Admin",

    // Branding & Header
    brandName: "Express Eats",
    brandSubtitle: "Fast & Fresh Food Delivery",
    themeToggle: "Theme",
    langToggle: "አማርኛ",

    // Auth - Sign In
    welcomeBack: "Welcome Back",
    signInSubtitle: "Sign in to order delicious food and track in real-time",
    emailAddress: "Email Address",
    emailPlaceholder: "name@example.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    signInBtn: "Sign In",
    noAccount: "Don't have an account?",
    signUpLink: "Sign up",

    // Auth - Sign Up
    createAccount: "Create Account",
    signUpSubtitle: "Join today for delicious food delivery and real-time tracking",
    fullName: "Full Name",
    namePlaceholder: "e.g. Abebe Bikila",
    phoneNumber: "Phone Number (Ethiopia)",
    phonePlaceholder: "911 234 567",
    phoneCountryPrefix: "🇪🇹 +251",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    passwordRequirement: "15 characters minimum",
    createAccountBtn: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signInLink: "Sign in",

    // Auth - Verify Email
    checkEmail: "Check Your Email",
    verificationSubtitle: "We sent a 6-digit confirmation code to:",
    verificationCode: "Verification Code",
    verifyBtn: "Verify & Continue",
    resendIn: "Resend code in",
    resendBtn: "Resend Verification Code",
    wrongEmail: "Wrong email address?",
    changeEmail: "Change Email",

    // Auth - Reset Password
    resetPassword: "Reset Password",
    resetSubtitle: "Enter your email address to receive a verification code.",
    setNewPassword: "Set New Password",
    setNewPasswordSubtitle: "Enter the code and choose a new password.",
    sendResetCode: "Send Reset Code",
    updatePasswordBtn: "Update Password",
    backToEmail: "Back to enter email",

    // Home / Menu
    featuredToday: "Featured Today",
    announcementBadge: "Notice",
    chefSpecialsTitle: "Chef & Kitchen Specials",
    chefSpecialsSub: "Handcrafted Ethiopian & Global Flavors",
    recommendedDelivery: "Delivery",
    exploreDishes: "Explore Dishes",
    prepTime: "Prep",
    servings: "Servings",
    addToCart: "Add to Cart",
    addedToCartAlert: "Added to Cart! 🛒",
    addedToCartDesc: "item added to your order cart.",
    keepBrowsing: "Keep Browsing",
    viewCart: "View Cart",
    noRecipesFound: "No recipes found",
    tryDifferentCategory: "Try selecting a different category or search",

    // Recipe Detail
    cuisine: "Cuisine",
    price: "Price",
    selectQuantity: "Select Quantity:",
    adminDeliveryNotice: "Kitchen Recommended Delivery:",
    videoTutorial: "Video Tutorial",
    ingredientsTitle: "Ingredients List",
    ingredientsCount: "items",
    ingredientsScriptTitle: "All Ingredients Script & Summary",
    ingredientsScriptDesc: "Complete ingredient list saved all at once for cooking preparation:",
    copyAllIngredients: "Copy All Ingredients",
    ingredientsCopied: "Ingredients Copied! 📋",
    cookingInstructions: "Cooking Instructions",
    saveToFav: "Save to Favorites",
    removeFromFav: "Remove from Favorites",

    // Cart
    orderCartTitle: "Order Cart",
    itemsSelected: "items selected",
    clearCart: "Clear",
    clearCartConfirmTitle: "Clear Cart",
    clearCartConfirmMsg: "Are you sure you want to remove all dishes from your cart?",
    freeDeliveryUnlocked: "You unlocked FREE Delivery!",
    addMoreForFreeDelivery: "more for FREE Delivery!",
    cartSubtotal: "Subtotal",
    deliveryFee: "Delivery Fee",
    free: "FREE",
    totalToPay: "Total to Pay",
    proceedToCheckout: "Proceed to Checkout",
    cartEmptyTitle: "Your Cart is Empty",
    cartEmptySub: "Looks like you haven't added any dishes yet. Browse our delicious menu now!",
    exploreMenuBtn: "Explore Menu",

    // Checkout
    checkoutTitle: "Checkout & Delivery",
    kitchenEstimatedNotice: "Kitchen Estimated Delivery: 30 - 45 mins",
    kitchenNoticeSub: "Meals are freshly prepared and dispatched by courier directly to your location.",
    deliveryLocationHeader: "Delivery Location & Contact",
    deliveryLocationSub: "Where should we deliver your food?",
    recipientName: "Recipient Full Name *",
    contactPhone: "Phone Number (for Courier & Telebirr) *",
    deliveryAddress: "Street Address / Building / Apt *",
    addressPlaceholder: "e.g. Bole Medhanialem, Atlas Apt 4B",
    citySubcity: "City / Sub-City *",
    cityPlaceholder: "e.g. Addis Ababa / Bole",
    preferredTimeHeader: "Preferred Arrival Time",
    preferredTimeSub: "Choose when you want your food to reach your place",
    slotAsap: "ASAP (Recommended: 30 - 45 mins)",
    slot45: "In 45 - 60 mins",
    slot90: "In 1 - 1.5 hours",
    slotCustom: "Specific Arrival Time (leave in notes)",
    deliveryNotes: "Delivery Notes (Optional)",
    notesPlaceholder: "e.g. Call upon arrival, leave at reception...",
    paymentMethodHeader: "Payment Method",
    paymentMethodSub: "Select your preferred payment option",
    payTelebirr: "Telebirr (ቴሌብር)",
    payTelebirrDesc: "Fast & secure digital payment via Telebirr",
    payCBE: "CBE Birr / Commercial Bank",
    payCBEDesc: "Direct mobile bank payment transfer",
    payCash: "Cash on Delivery (ጥሬ ገንዘብ)",
    payCashDesc: "Pay cash in hand when courier delivers",
    payCard: "Credit / Debit Card",
    payCardDesc: "Visa, Mastercard, International Cards",
    cardNumber: "Card Number",
    cardExpiry: "Expires (MM/YY)",
    cardCvv: "CVV",
    orderItemsTitle: "Order Items",
    confirmPlaceOrder: "Confirm & Place Order",
    missingDetailsAlert: "Please fill in Name, Phone, Address, and City.",

    // Order Success
    orderSuccessTitle: "Order Placed Successfully!",
    orderSuccessSub: "Thank you! Our kitchen has received your order and delivery is on schedule.",
    orderIdLabel: "Order ID",
    estimatedWindow: "Estimated Delivery Window",
    liveTrackingTitle: "Live Kitchen & Delivery Tracking",
    trackPlaced: "Order Placed",
    trackPlacedDesc: "Sent to restaurant kitchen & admin desk.",
    trackApproved: "Approved & Cooking",
    trackApprovedDesc: "Chefs are preparing fresh ingredients according to your order.",
    trackOnWay: "Out for Delivery",
    trackOnWayDesc: "Courier is on the road heading to your address.",
    trackDelivered: "Delivered",
    trackDeliveredDesc: "Delicious meal arrived! Enjoy your food!",
    viewInOrders: "View in My Orders",
    needHelpContact: "Need Help? Contact Support",
    backToMenuBtn: "Back to Menu",

    // Profile & Admin
    adminHeadquarters: "Admin Headquarters",
    myAccount: "My Account",
    administratorRole: "OFFICIAL ADMINISTRATOR",
    customerRole: "VERIFIED CUSTOMER",
    totalOrdersKpi: "Orders",
    pendingKpi: "Pending",
    revenueKpi: "Revenue",
    dishesKpi: "Dishes",
    tabOrdersAdmin: "Orders",
    tabAddFoodAdmin: "Add Food",
    tabAnnounceAdmin: "Announce",
    tabUsersAdmin: "Users",
    tabSupportAdmin: "Support",
    customerFoodOrders: "Customer Food Orders",
    myOrderHistory: "My Order History",
    filterAll: "ALL",
    filterPending: "PENDING",
    filterApproved: "APPROVED",
    filterPreparing: "PREPARING",
    filterOnWay: "OUT FOR DELIVERY",
    filterDelivered: "DELIVERED",
    customerPreferredArrival: "Customer Preferred Time:",
    kitchenDeliveryWindow: "Kitchen Delivery Window:",
    approveAndSetTimeBtn: "Approve & Set Delivery Time",
    approveOrderTitle: "Approve Order",
    confirmedDeliveryTimeLabel: "Confirmed Estimated Delivery Time",
    confirmApprovalBtn: "Confirm Approval & Notify Customer",
    menuManagement: "Menu Management",
    addNewFoodBtn: "Add New Food",
    foodTitleLabel: "Meal Title *",
    foodCategoryLabel: "Category *",
    foodPriceLabel: "Price in ETB (ብር) *",
    foodPrepTimeLabel: "Preparation / Cook Time",
    foodDeliveryTimeLabel: "Recommended Delivery Window *",
    foodIngredientsLabel: "All Ingredients Script & List *",
    foodIngredientsPlaceholder: "Enter all ingredients at once as a complete script: e.g. 500g Fresh Beef, Onions, Garlic, Berbere, Niter Kibbeh, Rosemary...",
    foodImageLabel: "Image URL (Optional)",
    foodDescLabel: "Description & Chef Notes",
    submitFoodBtn: "Add Meal to Public Menu",
    announcementsTitle: "Live Announcements",
    postAlertBtn: "Post Alert",
    annHeadlineLabel: "Announcement Headline *",
    annBadgeLabel: "Badge Type",
    annMsgLabel: "Announcement Message *",
    publishAnnouncementBtn: "Publish to All Users",
    userPortfolios: "User Portfolios & Approvals",
    supportMessagesTitle: "Customer Support Messages",
    replyToCustomer: "Reply to Customer",
    yourReplyHeading: "Your Reply:",
    sendReplyBtn: "Send Reply & Resolve",
    signOutBtn: "Sign Out",

    // Support
    supportTitle: "Help & Support",
    emailAdminBtn: "Email Admin",
    callHotlineBtn: "Call Hotline",
    officialAnnouncements: "Official Announcements",
    writeToSupportTitle: "Write to Support",
    writeToSupportDesc: "Have questions about delivery, orders, or food preparation? Our team is here to help 24/7.",
    supportCategoryLabel: "What do you need help with?",
    messageDetailsLabel: "Message / Details *",
    submitTicketBtn: "Submit Support Request",
    operatingHoursTitle: "Operating & Delivery Hours",
    operatingHoursDesc: "Our kitchen and delivery network operates daily from 8:00 AM to 11:00 PM.",
  },

  am: {
    // Navigation / Tabs
    tabMenu: "ሜኑ",
    tabSearch: "ፈልግ",
    tabCart: "ቅርጫት",
    tabFavorites: "ተወዳጆች",
    tabProfile: "መለያ",
    tabAdmin: "አድሚን",

    // Branding & Header
    brandName: "ኤክስፕረስ ምግቦች",
    brandSubtitle: "ፈጣን እና ትኩስ የምግብ ማድረሻ",
    themeToggle: "ገጽታ",
    langToggle: "English",

    // Auth - Sign In
    welcomeBack: "እንኳን ደህና መጡ",
    signInSubtitle: "ጣፋጭ ምግቦችን ለማዘዝ እና የቀጥታ ክትትል ለማድረግ ይግቡ",
    emailAddress: "የኢሜይል አድራሻ",
    emailPlaceholder: "ስም@ምሳሌ.ኮም",
    password: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    forgotPassword: "የይለፍ ቃል ረሱ?",
    signInBtn: "ግባ",
    noAccount: "መለያ የለዎትም?",
    signUpLink: "ይመዝገቡ",

    // Auth - Sign Up
    createAccount: "አዲስ መለያ ይክፈቱ",
    signUpSubtitle: "ለፈጣን ማድረስ እና ምርጥ ምግቦች ዛሬውኑ ይቀላቀሉን",
    fullName: "ሙሉ ስም",
    namePlaceholder: "ለምሳሌ አበበ ቢቂላ",
    phoneNumber: "ስልክ ቁጥር (ኢትዮጵያ)",
    phonePlaceholder: "911 234 567",
    phoneCountryPrefix: "🇪🇹 +251",
    confirmPassword: "የይለፍ ቃል ያረጋግጡ",
    confirmPasswordPlaceholder: "የይለፍ ቃሉን ደግመው ያስገቡ",
    passwordRequirement: "ቢያንስ 15 ፊደላት ወይም ቁጥሮች",
    createAccountBtn: "መለያ ይክፈቱ",
    alreadyHaveAccount: "መለያ አለዎት?",
    signInLink: "ይግቡ",

    // Auth - Verify Email
    checkEmail: "ኢሜይልዎን ያረጋግጡ",
    verificationSubtitle: "የ6-ዲጂት ማረጋገጫ ኮድ ወደዚህ ልከናል፦",
    verificationCode: "የማረጋገጫ ኮድ",
    verifyBtn: "አረጋግጥ እና ቀጥል",
    resendIn: "ኮድ በድጋሚ ለመላክ የቀረው ሰከንድ",
    resendBtn: "የማረጋገጫ ኮድ በድጋሚ ላክ",
    wrongEmail: "የተሳሳተ ኢሜይል?",
    changeEmail: "ኢሜይል ቀይር",

    // Auth - Reset Password
    resetPassword: "የይለፍ ቃል ቀይር",
    resetSubtitle: "የማረጋገጫ ኮድ ለመቀበል ኢሜይልዎን ያስገቡ።",
    setNewPassword: "አዲስ የይለፍ ቃል ያስገቡ",
    setNewPasswordSubtitle: "የደረስዎትን ኮድ እና አዲሱን የይለፍ ቃል ያስገቡ።",
    sendResetCode: "የማረጋገጫ ኮድ ላክ",
    updatePasswordBtn: "የይለፍ ቃል አድስ",
    backToEmail: "ወደ ኢሜይል መመለሻ",

    // Home / Menu
    featuredToday: "የዛሬው ተመራጭ",
    announcementBadge: "ማስታወቂያ",
    chefSpecialsTitle: "የኩሽና ልዩ ምግቦች",
    chefSpecialsSub: "በሼፎች የተዘጋጁ የሀበሻ እና ዓለም አቀፍ ምግቦች",
    recommendedDelivery: "የማድረሻ ጊዜ",
    exploreDishes: "ሁሉንም ምግቦች ያስሱ",
    prepTime: "የዝግጅት ጊዜ",
    servings: "ሰው",
    addToCart: "ወደ ቅርጫት ጨምር",
    addedToCartAlert: "ወደ ቅርጫት ገብቷል! 🛒",
    addedToCartDesc: "ምግብ ወደ ማዘዣ ቅርጫትዎ ተጨምሯል።",
    keepBrowsing: "ምግቦችን መመልከት ቀጥል",
    viewCart: "ቅርጫት ተመልከት",
    noRecipesFound: "ምንም አይነት ምግብ አልተገኘም",
    tryDifferentCategory: "ሌላ የምግብ ዓይነት ይምረጡ ወይም ይፈልጉ",

    // Recipe Detail
    cuisine: "የምግብ ዓይነት",
    price: "ዋጋ",
    selectQuantity: "ብዛት ይምረጡ፦",
    adminDeliveryNotice: "በኩሽና የተወሰነ የማድረሻ ጊዜ፦",
    videoTutorial: "የቪዲዮ አሠራር ማብራሪያ",
    ingredientsTitle: "የምግብ ግብዓቶች",
    ingredientsCount: "ዓይነቶች",
    ingredientsScriptTitle: "የግብዓቶች ዝርዝር በአንድነት (Summary Script)",
    ingredientsScriptDesc: "ሁሉም የግብዓት ዝርዝር በአንድ ላይ ለምግብ ዝግጅት የተዘጋጀ፦",
    copyAllIngredients: "ሁሉንም ግብዓቶች ቅዳ",
    ingredientsCopied: "ግብዓቶች ተቀድተዋል! 📋",
    cookingInstructions: "የአሠራር ቅደም ተከተል",
    saveToFav: "ወደ ተወዳጆች አስቀምጥ",
    removeFromFav: "ከተወዳጆች አስወግድ",

    // Cart
    orderCartTitle: "የትዕዛዝ ቅርጫት",
    itemsSelected: "ምግቦች ተመርጠዋል",
    clearCart: "አጽዳ",
    clearCartConfirmTitle: "ቅርጫቱን ማጽዳት",
    clearCartConfirmMsg: "ሁሉንም ምግቦች ከቅርጫትዎ ላይ ማስወገድ ይፈልጋሉ?",
    freeDeliveryUnlocked: "ነፃ የማድረስ አገልግሎት አግኝተዋል!",
    addMoreForFreeDelivery: "ተጨማሪ ሲያዝዙ ነፃ ማድረሻ ያገኛሉ!",
    cartSubtotal: "ንዑስ ድምር",
    deliveryFee: "የማድረሻ ክፍያ",
    free: "ነፃ",
    totalToPay: "ጠቅላላ ክፍያ",
    proceedToCheckout: "ወደ ክፍያ ቀጥል",
    cartEmptyTitle: "ቅርጫትዎ ባዶ ነው",
    cartEmptySub: "እስካሁን ምንም ምግብ አላዘዙም። ጣፋጭ ምግቦቻችንን አሁኑኑ ይዘዙ!",
    exploreMenuBtn: "ሜኑ ይመልከቱ",

    // Checkout
    checkoutTitle: "ማዘዣ እና ክፍያ",
    kitchenEstimatedNotice: "የኩሽና ግምታዊ የማድረሻ ጊዜ፦ 30 - 45 ደቂቃ",
    kitchenNoticeSub: "ምግቦች ትኩስ ሆነው ተዘጋጅተው በአስተማማኝ አድራሽ ወደ ቦታዎ ይደርሳሉ።",
    deliveryLocationHeader: "የማድረሻ ቦታ እና አድራሻ",
    deliveryLocationSub: "ምግብዎ ወዴት እንዲደርስ ይፈልጋሉ?",
    recipientName: "የተቀባይ ሙሉ ስም *",
    contactPhone: "ስልክ ቁጥር (ለደዋይ እና ቴሌብር) *",
    deliveryAddress: "የመንገድ አድራሻ / ህንፃ / የቤት ቁ. *",
    addressPlaceholder: "ለምሳሌ፦ ቦሌ መድሃኒአለም፣ አትላስ ህንፃ 4B",
    citySubcity: "ከተማ / ክፍለ ከተማ *",
    cityPlaceholder: "ለምሳሌ፦ አዲስ አበባ / ቦሌ",
    preferredTimeHeader: "የሚፈልጉት የመድረሻ ሰዓት",
    preferredTimeSub: "ምግብዎ እንዲደርስዎ የሚፈልጉትን ሰዓት ይምረጡ",
    slotAsap: "በተቻለ ፍጥነት (የሚመከር፦ 30 - 45 ደቂቃ)",
    slot45: "በ 45 - 60 ደቂቃ ውስጥ",
    slot90: "በ 1 - 1.5 ሰዓት ውስጥ",
    slotCustom: "የተለየ ሰዓት (በማስታወሻው ላይ ይፃፉ)",
    deliveryNotes: "ተጨማሪ ማስታወሻ (አማራጭ)",
    notesPlaceholder: "ለምሳሌ፦ በሩ ላይ ሲደርሱ ይደውሉ፣ ጥበቃ ጋር ይተዉ...",
    paymentMethodHeader: "የክፍያ ዘዴ",
    paymentMethodSub: "የሚፈልጉትን የክፍያ አማራጭ ይምረጡ",
    payTelebirr: "ቴሌብር (Telebirr)",
    payTelebirrDesc: "ፈጣን እና ምቹ ክፍያ በቴሌብር",
    payCBE: "ሲቢኢ ብር / የኢትዮጵያ ንግድ ባንክ",
    payCBEDesc: "በሞባይል ባንኪንግ በቀጥታ ይክፈሉ",
    payCash: "በጥሬ ገንዘብ (Cash on Delivery)",
    payCashDesc: "ምግብዎ በቦታው ሲደርስ ለአድራሹ በእጅዎ ይክፈሉ",
    payCard: "የባንክ ካርድ / ቪዛ / ማስተርካርድ",
    payCardDesc: "ቪዛ፣ ማስተርካርድ ወይም ሌሎች ካርዶች",
    cardNumber: "የካርድ ቁጥር",
    cardExpiry: "የሚያበቃበት (ወር/ዓመት)",
    cardCvv: "CVV",
    orderItemsTitle: "የታዘዙ ምግቦች",
    confirmPlaceOrder: "ትዕዛዝ አረጋግጥ እና እዘዝ",
    missingDetailsAlert: "እባክዎን ስም፣ ስልክ ቁጥር፣ አድራሻ እና ከተማ ይሙሉ!",

    // Order Success
    orderSuccessTitle: "ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!",
    orderSuccessSub: "እናመሰግናለን! ሼፎቻችን ምግብዎን እያዘጋጁ ነው፤ ፈጣን ማድረስ ተጀምሯል።",
    orderIdLabel: "የትዕዛዝ ቁጥር",
    estimatedWindow: "ግምታዊ የመድረሻ ጊዜ",
    liveTrackingTitle: "የቀጥታ ዝግጅት እና ማድረስ ክትትል",
    trackPlaced: "ትዕዛዝ ተቀብለናል",
    trackPlacedDesc: "ወደ ኩሽና እና አድሚን ዳሽቦርድ ተልኳል።",
    trackApproved: "ተረጋግጦ በመዘጋጀት ላይ",
    trackApprovedDesc: "ሼፎች ትኩስ ግብዓቶችን በመጠቀም በማዘጋጀት ላይ ናቸው።",
    trackOnWay: "በመንገድ ላይ",
    trackOnWayDesc: "አድራሹ ምግብዎን ይዞ ወደ አድራሻዎ እየመጣ ነው።",
    trackDelivered: "ደርሷል",
    trackDeliveredDesc: "ጣፋጭ ምግብዎ ደርሷል! መልካም ምግብ!",
    viewInOrders: "በእኔ ትዕዛዞች ይመልከቱ",
    needHelpContact: "እርዳታ ይፈልጋሉ? ድጋፍ ሰጪን ያነጋግሩ",
    backToMenuBtn: "ወደ ሜኑ ተመለስ",

    // Profile & Admin
    adminHeadquarters: "የአድሚን መቆጣጠሪያ ማዕከል",
    myAccount: "የእኔ መለያ",
    administratorRole: "ዋና አድሚን (ADMIN)",
    customerRole: "የተረጋገጠ ደንበኛ",
    totalOrdersKpi: "ትዕዛዞች",
    pendingKpi: "በመጠባበቅ ላይ",
    revenueKpi: "ገቢ",
    dishesKpi: "ምግቦች",
    tabOrdersAdmin: "ትዕዛዞች",
    tabAddFoodAdmin: "ምግብ ጨምር",
    tabAnnounceAdmin: "አስታውቅ",
    tabUsersAdmin: "ተጠቃሚዎች",
    tabSupportAdmin: "እርዳታ",
    customerFoodOrders: "የደንበኞች የምግብ ትዕዛዞች",
    myOrderHistory: "የቀደሙ ትዕዛዞቼ",
    filterAll: "ሁሉም",
    filterPending: "በመጠባበቅ ላይ",
    filterApproved: "የጸደቁ",
    filterPreparing: "በመዘጋጀት ላይ",
    filterOnWay: "በመንገድ ላይ",
    filterDelivered: "የደረሱ",
    customerPreferredArrival: "ደንበኛው የጠየቀው ሰዓት፦",
    kitchenDeliveryWindow: "የኩሽና ማድረሻ ጊዜ፦",
    approveAndSetTimeBtn: "ትዕዛዝ አጽድቅ እና ሰዓት ወስን",
    approveOrderTitle: "ትዕዛዝ ማጽደቂያ",
    confirmedDeliveryTimeLabel: "የተረጋገጠ የማድረሻ ሰዓት",
    confirmApprovalBtn: "አጽድቅ እና ለደንበኛው አሳውቅ",
    menuManagement: "የሜኑ አስተዳደር",
    addNewFoodBtn: "አዲስ ምግብ ጨምር",
    foodTitleLabel: "የምግብ ስም (በአማርኛ ወይም እንግሊዝኛ) *",
    foodCategoryLabel: "የምግብ ዓይነት *",
    foodPriceLabel: "ዋጋ በብር (ETB) *",
    foodPrepTimeLabel: "የማብሰያ / የዝግጅት ጊዜ",
    foodDeliveryTimeLabel: "የሚመከር የማድረሻ ጊዜ *",
    foodIngredientsLabel: "የግብዓቶች ዝርዝር (በአንድነት ይፃፉ) *",
    foodIngredientsPlaceholder: "ለምሳሌ፦ 500ግ የበሬ ስጋ፣ ቀይ ሽንኩርት፣ ነጭ ሽንኩርት፣ በርበሬ፣ ንጥር ቅቤ፣ ሮዝመሪ...",
    foodImageLabel: "የምስል አድራሻ URL (አማራጭ)",
    foodDescLabel: "ዝርዝር መግለጫ",
    submitFoodBtn: "ምግቡን ወደ ሜኑ ጨምር",
    announcementsTitle: "የቀጥታ ማስታወቂያዎች",
    postAlertBtn: "አዲስ ማስታወቂያ",
    annHeadlineLabel: "የማስታወቂያው ርዕስ *",
    annBadgeLabel: "የባጅ ዓይነት",
    annMsgLabel: "የማስታወቂያው መልእክት *",
    publishAnnouncementBtn: "ለሁሉም ደንበኞች አውጣ",
    userPortfolios: "የተጠቃሚዎች ዝርዝር እና ማረጋገጫ",
    supportMessagesTitle: "የደንበኞች የድጋፍ መልእክቶች",
    replyToCustomer: "ለደንበኛው መልስ ስጥ",
    yourReplyHeading: "የእርስዎ መልስ፦",
    sendReplyBtn: "መልስ ላክ እና ፍታ",
    signOutBtn: "ውጣ",

    // Support
    supportTitle: "እርዳታ እና ድጋፍ",
    emailAdminBtn: "ኢሜይል ላክ",
    callHotlineBtn: "በስልክ ደውል",
    officialAnnouncements: "ኦፊሴላዊ ማስታወቂያዎች",
    writeToSupportTitle: "ለድጋፍ ሰጪ ይፃፉ",
    writeToSupportDesc: "ስለ ማድረስ፣ ትዕዛዝ ወይም ምግብ ዝግጅት ጥያቄ ካለዎት በማንኛውም ሰዓት ይፃፉልን።",
    supportCategoryLabel: "በምን ልንረዳዎ እንችላለን?",
    messageDetailsLabel: "ዝርዝር መልእክት / ጥያቄ *",
    submitTicketBtn: "የድጋፍ ጥያቄ ላክ",
    operatingHoursTitle: "የሥራ እና የማድረሻ ሰዓት",
    operatingHoursDesc: "የኩሽና እና የማድረሻ አገልግሎታችን በየቀኑ ከጠዋቱ 2:00 እስከ ማታ 5:00 ክፍት ነው።",
  },
};

const LanguageContext = createContext({
  language: "en",
  isAmharic: false,
  t: (key) => key,
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const loadSavedLang = async () => {
      try {
        if (Platform.OS !== "web") {
          const saved = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
          if (saved === "en" || saved === "am") {
            setLanguageState(saved);
          }
        } else if (typeof window !== "undefined" && window.localStorage) {
          const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
          if (saved === "en" || saved === "am") {
            setLanguageState(saved);
          }
        }
      } catch (err) {
        console.warn("Could not load language:", err);
      }
    };
    loadSavedLang();
  }, []);

  const setLanguage = async (newLang) => {
    if (newLang !== "en" && newLang !== "am") return;
    setLanguageState(newLang);
    try {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, newLang);
      } else if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      }
    } catch (err) {
      console.warn("Could not save language:", err);
    }
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "am" : "en";
    setLanguage(next);
  };

  const t = (key) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English
    return TRANSLATIONS.en[key] || key;
  };

  const isAmharic = language === "am";

  return (
    <LanguageContext.Provider value={{ language, isAmharic, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

