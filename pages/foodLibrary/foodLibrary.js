const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const { foods } = require("../../data/foods");
const ui = require("../../utils/ui");

const typeFilters = [
  { label: "全部", value: "all" },
  { label: "常吃", value: "favorite" },
  { label: "最近", value: "recent" },
  { label: "蛋白质", value: "protein" },
  { label: "主食", value: "carb" },
  { label: "蔬菜", value: "vegetable" },
  { label: "脂肪", value: "fat" },
  { label: "组合餐", value: "mixed" }
];

const typeLabels = {
  protein: "蛋白质",
  carb: "主食/碳水",
  vegetable: "蔬菜",
  fat: "脂肪",
  mixed: "组合餐"
};

Page({
  data: {
    mealIndex: -1,
    profile: null,
    plan: null,
    query: "",
    typeFilter: "all",
    typeFilters,
    library: [],
    favoriteFoodIds: [],
    recentFoodIds: [],
    titleText: "食物库"
  },

  onLoad(query) {
    const mealIndex = query.meal === undefined ? -1 : Number(query.meal);
    this.setData({ mealIndex });
  },

  onShow() {
    const profile = storage.getProfile();
    const plan = storage.getMealPlan();
    const favoriteFoodIds = storage.getFavoriteFoods();
    const recentFoodIds = storage.getRecentFoods();
    const meal = plan && this.data.mealIndex >= 0 ? plan.meals[this.data.mealIndex] : null;
    this.setData({
      profile,
      plan,
      favoriteFoodIds,
      recentFoodIds,
      titleText: meal ? `添加到${meal.mealName}` : "食物库"
    });
    this.refreshLibrary();
  },

  goBack() {
    ui.goBack("/pages/meal/meal");
  },

  onSearch(event) {
    this.setData({ query: event.detail.value });
    this.refreshLibrary();
  },

  setType(event) {
    this.setData({ typeFilter: event.currentTarget.dataset.type });
    this.refreshLibrary();
  },

  refreshLibrary() {
    const query = String(this.data.query || "").trim().toLowerCase();
    const typeFilter = this.data.typeFilter;
    const profile = this.data.profile || {};
    const avoid = profile.avoidFoods || "";
    const dietMode = profile.dietMode || "mixed";
    const favoriteIds = new Set(this.data.favoriteFoodIds || []);
    const recentIds = new Set(this.data.recentFoodIds || []);
    const decorated = foods
      .filter((item) => {
        if (typeFilter === "favorite") return favoriteIds.has(item.id);
        if (typeFilter === "recent") return recentIds.has(item.id);
        return typeFilter === "all" || item.type === typeFilter;
      })
      .filter((item) => !query || item.name.toLowerCase().includes(query) || (typeLabels[item.type] || "").includes(query))
      .filter((item) => !avoid.includes(item.name))
      .map((item) => {
        const modeMatch = this.matchesDietMode(item, dietMode);
        return {
          ...item,
          typeLabel: typeLabels[item.type] || "食物",
          modeMatch,
          favorite: favoriteIds.has(item.id),
          recent: recentIds.has(item.id),
          modeText: modeMatch ? "适合当前饮食模式" : "可作为备选",
          defaultAmount: this.defaultAmount(item),
          macroText: `每${item.unit} ${item.calories}kcal · P${item.protein} C${item.carbs} F${item.fat}`
        };
      })
      .sort((a, b) => Number(b.modeMatch) - Number(a.modeMatch) || a.name.localeCompare(b.name, "zh-Hans-CN"))
      .slice(0, 80);
    this.setData({ library: decorated });
  },

  toggleFavorite(event) {
    const next = storage.toggleFavoriteFood(event.currentTarget.dataset.id);
    this.setData({ favoriteFoodIds: next });
    this.refreshLibrary();
  },

  matchesDietMode(food, dietMode) {
    if (dietMode === "canteen") return food.tags.includes("canteen");
    if (dietMode === "takeout") return food.tags.includes("takeout");
    if (dietMode === "home") return food.tags.includes("home");
    return true;
  },

  defaultAmount(food) {
    if (food.unit === "个") return 1;
    if (food.unit === "100ml") return food.type === "protein" ? 250 : 100;
    if (food.type === "vegetable") return 150;
    if (food.type === "fat") return 10;
    if (food.type === "mixed") return 300;
    return 100;
  },

  addFood(event) {
    if (this.data.mealIndex < 0) {
      wx.showToast({ title: "进入某一餐后可添加", icon: "none" });
      return;
    }
    const selected = foods.find((item) => item.id === event.currentTarget.dataset.id);
    if (!selected || !this.data.plan) return;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const meal = plan.meals[this.data.mealIndex];
    if (!meal) {
      wx.showToast({ title: "没有找到餐次", icon: "none" });
      return;
    }
    const amount = this.defaultAmount(selected);
    const macro = rules.macroForFood(selected, amount);
    meal.foods = meal.foods || [];
    meal.foods.push({
      id: `${selected.id}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      foodId: selected.id,
      foodName: selected.name,
      amount,
      unit: selected.unit,
      ...macro,
      isCustom: false
    });
    const next = rules.recalculateMealPlan(plan, this.data.profile || {});
    storage.saveMealPlan(next);
    storage.addRecentFood(selected.id);
    wx.showToast({ title: "已添加食物", icon: "success" });
    setTimeout(() => wx.navigateBack(), 450);
  }
});
