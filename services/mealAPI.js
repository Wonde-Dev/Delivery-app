const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Helper to generate rich, appetizing culinary descriptions
const generateAppetizingDescription = (meal) => {
  if (meal.description && typeof meal.description === "string" && meal.description.trim()) {
    return meal.description.trim();
  }

  // If valid instructions exist, clean up first 1-2 sentences
  if (meal.strInstructions && typeof meal.strInstructions === "string" && meal.strInstructions.trim().length > 20) {
    const cleaned = meal.strInstructions.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
    const sentenceEnd = cleaned.search(/[.!?](\s|$)/);
    if (sentenceEnd > 25 && sentenceEnd <= 140) {
      return cleaned.substring(0, sentenceEnd + 1);
    }
    if (cleaned.length > 120) {
      const cut = cleaned.substring(0, 115);
      const lastSpace = cut.lastIndexOf(" ");
      return (lastSpace > 50 ? cut.substring(0, lastSpace) : cut) + "...";
    }
    return cleaned;
  }

  // Infer appetizing culinary description from dish title, category, and area
  const title = (meal.strMeal || "").toLowerCase();
  const category = (meal.strCategory || "").toLowerCase();
  const area = (meal.strArea || "").toLowerCase();

  // Ethiopian specials
  if (
    title.includes("tibs") ||
    title.includes("shiro") ||
    title.includes("doro") ||
    title.includes("kitfo") ||
    title.includes("firfir") ||
    area === "ethiopian"
  ) {
    return "Authentic Ethiopian specialty cooked with fragrant berbere, clarified niter kibbeh, and fresh spices.";
  }

  // Pizza & Italian
  if (title.includes("pizza") || category === "pizza") {
    return "Crispy stone-baked crust topped with savory marinara sauce, melted mozzarella, and fresh garden herbs.";
  }

  // Burger & Sandwich
  if (title.includes("burger") || title.includes("sandwich") || title.includes("wrap")) {
    return "Flame-grilled savory patty stacked with fresh crisp greens, melted cheese, and signature house sauce.";
  }

  // Pasta & Noodles
  if (title.includes("pasta") || title.includes("spaghetti") || title.includes("lasagna") || category === "pasta") {
    return "Al dente pasta tossed in a rich, slow-simmered artisanal sauce with fresh herbs and aged cheese.";
  }

  // Curry & Stew
  if (title.includes("curry") || title.includes("stew") || title.includes("korma") || title.includes("masala")) {
    return "Slow-simmered rich aromatic sauce infused with warm exotic spices, coconut cream, and fragrant cilantro.";
  }

  // Soup & Broth
  if (title.includes("soup") || title.includes("broth") || title.includes("chowder")) {
    return "Comforting, hearty slow-simmered broth loaded with wholesome ingredients and aromatic garden herbs.";
  }

  // Seafood & Fish
  if (
    title.includes("salmon") ||
    title.includes("fish") ||
    title.includes("shrimp") ||
    title.includes("prawn") ||
    title.includes("tuna") ||
    category === "seafood"
  ) {
    return "Fresh ocean catch delicately prepared with zesty lemon butter, garlic herbs, and seaside seasoning.";
  }

  // Chicken
  if (title.includes("chicken") || category === "chicken") {
    return "Tender, succulent chicken cuts seared to golden perfection and seasoned with aromatic house spices.";
  }

  // Beef & Steak
  if (title.includes("beef") || title.includes("steak") || title.includes("rib") || category === "beef") {
    return "Prime tender beef seared with cracked black pepper, savory garlic butter, and rich pan reduction.";
  }

  // Lamb & Goat
  if (title.includes("lamb") || title.includes("goat") || category === "lamb" || category === "goat") {
    return "Slow-roasted tender cuts infused with wild rosemary, crushed garlic, and rich natural culinary juices.";
  }

  // Vegetarian & Vegan
  if (category === "vegetarian" || category === "vegan" || title.includes("salad") || title.includes("veggie")) {
    return "Wholesome medley of farm-fresh seasonal vegetables and legumes tossed in savory aromatic seasoning.";
  }

  // Dessert & Bakery
  if (
    category === "dessert" ||
    title.includes("cake") ||
    title.includes("pie") ||
    title.includes("chocolate") ||
    title.includes("pudding")
  ) {
    return "Decadent handcrafted sweet confection prepared with rich cream, gourmet chocolate, and fine ingredients.";
  }

  // Breakfast
  if (category === "breakfast" || title.includes("pancake") || title.includes("egg") || title.includes("toast")) {
    return "Energizing morning platter cooked fresh to order with hearty organic ingredients and warm sides.";
  }

  // Default Chef's special description
  return "Chef-crafted culinary specialty prepared fresh with premium quality ingredients and signature seasonings.";
};

// transform TheMealDB meal data to our app format
export const MealAPI = {
  // search meal by name
  searchMealsByName: async (query) => {
    try {
      if (!query || !query.trim()) return [];
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query.trim())}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data?.meals) ? data.meals : [];
    } catch (error) {
      console.error("Error searching meals by name:", error);
      return [];
    }
  },

  // lookup full meal details by id
  getMealById: async (id) => {
    try {
      if (!id) return null;
      const response = await fetch(`${BASE_URL}/lookup.php?i=${encodeURIComponent(String(id).trim())}`);
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data?.meals) && data.meals.length > 0 ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting meal by id:", error);
      return null;
    }
  },

  // lookup a single random meal
  getRandomMeal: async () => {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data?.meals) && data.meals.length > 0 ? data.meals[0] : null;
    } catch (error) {
      console.error("Error getting random meal:", error);
      return null;
    }
  },

  // get multiple random meals
  getRandomMeals: async (count = 6) => {
    try {
      const promises = Array.from({ length: count }, () => MealAPI.getRandomMeal());
      const meals = await Promise.all(promises);
      return meals.filter((meal) => meal !== null);
    } catch (error) {
      console.error("Error getting random meals:", error);
      return [];
    }
  },

  // list all meal categories
  getCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories.php`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data?.categories) ? data.categories : [];
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  },

  // filter by main ingredient
  filterByIngredient: async (ingredient) => {
    try {
      if (!ingredient || !ingredient.trim()) return [];
      const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient.trim())}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data?.meals) ? data.meals : [];
    } catch (error) {
      console.error("Error filtering by ingredient:", error);
      return [];
    }
  },

  // filter by category
  filterByCategory: async (category) => {
    try {
      if (!category || !category.trim()) return [];
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category.trim())}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data?.meals) ? data.meals : [];
    } catch (error) {
      console.error("Error filtering by category:", error);
      return [];
    }
  },

  // transform TheMealDB meal data to our app format
  transformMealData: (meal) => {
    if (!meal || !meal.idMeal) return null;

    // extract ingredients from the meal object
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && typeof ingredient === "string" && ingredient.trim()) {
        const measureText = measure && typeof measure === "string" && measure.trim() ? `${measure.trim()} ` : "";
        ingredients.push(`${measureText}${ingredient.trim()}`);
      }
    }

    // extract instructions
    const instructions =
      meal.strInstructions && typeof meal.strInstructions === "string"
        ? meal.strInstructions
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const title = meal.strMeal || "Untitled Recipe";
    const category = meal.strCategory || "Main Course";

    return {
      id: meal.idMeal,
      title,
      description: generateAppetizingDescription(meal),
      image: meal.strMealThumb || "",
      cookTime: meal.cookTime || (category.toLowerCase() === "beef" ? "35 mins" : "25 mins"),
      estimatedDeliveryTime: meal.estimatedDeliveryTime || "30 - 45 mins",
      servings: meal.servings ? parseInt(meal.servings, 10) : 4,
      category,
      area: meal.strArea || "",
      ingredients,
      instructions,
      originalData: meal,
    };
  },
};
