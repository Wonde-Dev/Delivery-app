// Price utilities for Ethiopian Birr (ETB / ብር)

export const getMealPrice = (mealId) => {
  const num = parseInt(mealId, 10);
  if (isNaN(num)) return 380;
  // Map meal ID to realistic Ethiopian Birr menu pricing (e.g., 280 ETB to 680 ETB)
  const step = (num % 21);
  return 280 + step * 20; // 280, 300, 320, 340 ... 680 ETB
};

export const formatPrice = (amount, language = "en") => {
  const num = Number(amount);
  if (isNaN(num)) {
    return language === "am" ? "0 ብር" : "0 ETB";
  }

  // Format with comma separation for thousands (e.g. 1,250)
  const formattedNumber = Math.round(num).toLocaleString("en-US");

  if (language === "am") {
    return `${formattedNumber} ብር`;
  }
  return `${formattedNumber} ETB`;
};

export const CURRENCY = {
  en: "ETB",
  am: "ብር",
};
