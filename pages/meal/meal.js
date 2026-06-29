const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const { foods } = require("../../data/foods");
const { clamp, weekdayIndex } = require("../../utils/format");
const ui = require("../../utils/ui");

const typeLabels = {
  protein: "蛋白质",
  carb: "主食/碳水",
  vegetable: "蔬菜",
  fat: "脂肪",
  mixed: "组合餐"
};

Page({
  data: {
    profile: null,
    plan: null,
    dateLabel: "",
    caloriePercent: 0,
    proteinPercent: 0,
    carbPercent: 0,
    fatPercent: 0,
    nutritionSignals: [],
    breakfastModeText: "正常餐次",
    breakfastActionText: "不吃早餐",
    dietModeText: "混合模式",
    savedMeals: [],
    hasSavedMeals: false,
    weekMealDays: []
  },

  onShow() {
    this.load();
  },

  load() {
    const profile = storage.getProfile();
    const plan = storage.getMealPlan();
    this.setDecoratedPlan(profile, plan);
  },

  setDecoratedPlan(profile, plan) {
    const decorated = plan ? this.decoratePlan(plan) : null;
    this.setData({
      profile,
      plan: decorated,
      dateLabel: this.buildDateLabel(),
      caloriePercent: plan ? this.percent(plan.totals.calories, plan.targetCalories) : 0,
      proteinPercent: plan ? this.percent(plan.totals.protein, plan.targetProtein) : 0,
      carbPercent: plan ? this.percent(plan.totals.carbs, plan.targetCarbs) : 0,
      fatPercent: plan ? this.percent(plan.totals.fat, plan.targetFat) : 0,
      nutritionSignals: plan ? this.buildNutritionSignals(plan) : [],
      breakfastModeText: profile && profile.breakfastHabit === "skip" ? "不吃早餐" : "正常餐次",
      breakfastActionText: profile && profile.breakfastHabit === "skip" ? "恢复早餐" : "不吃早餐",
      dietModeText: this.dietModeLabel(profile ? profile.dietMode : ""),
      savedMeals: this.decorateSavedMeals(storage.getSavedMeals()),
      hasSavedMeals: storage.getSavedMeals().length > 0,
      weekMealDays: decorated ? this.buildWeekMealDays(decorated) : []
    });
  },

  buildWeekMealDays(plan) {
    const names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const today = weekdayIndex();
    const mealNames = (plan.meals || []).map((meal) => meal.mealName).join(" / ");
    return names.map((name, index) => ({
      key: `meal_day_${index}`,
      dayName: name,
      title: index === today ? "今日饮食计划" : "推荐饮食计划",
      meta: `${plan.targetCalories} kcal · ${mealNames}`,
      isToday: index === today
    }));
  },

  decorateSavedMeals(savedMeals) {
    return savedMeals.map((meal) => ({
      ...meal,
      summary: (meal.foods || []).map((food) => `${food.foodName} ${food.amount}${food.unit}`).join(" / "),
      calories: Math.round(rules.calculateMealTotals([meal]).calories)
    }));
  },

  dietModeLabel(mode) {
    if (mode === "canteen") return "食堂模式";
    if (mode === "takeout") return "外卖模式";
    if (mode === "home") return "自己做饭";
    return "混合模式";
  },

  buildDateLabel() {
    const now = new Date();
    const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][now.getDay()];
    return `${now.getMonth() + 1}月${now.getDate()}日 · ${week}`;
  },

  decoratePlan(plan) {
    const suggests = {
      breakfast: "0-25%",
      lunch: "25-40%",
      dinner: "25-35%",
      snack: "5-10%"
    };
    const icons = {
      breakfast: "早",
      lunch: "午",
      dinner: "晚",
      snack: "加"
    };
    return {
      ...plan,
      meals: plan.meals.map((meal) => {
        const mealTotals = rules.calculateMealTotals([meal]);
        return {
          ...meal,
          icon: icons[meal.mealType] || "餐",
          suggest: suggests[meal.mealType] || "按需调整",
          totalCalories: Math.round(mealTotals.calories),
          totalProtein: mealTotals.protein,
          totalCarbs: mealTotals.carbs,
          totalFat: mealTotals.fat,
          foods: (meal.foods || []).map((food) => ({
            ...food,
            typeLabel: this.foodTypeLabel(food.foodId),
            displayAmount: `${food.amount}${food.unit}`
          }))
        };
      })
    };
  },

  foodTypeLabel(foodId) {
    const source = foods.find((item) => item.id === foodId);
    return source ? typeLabels[source.type] || "食物" : "自定义";
  },

  buildNutritionSignals(plan) {
    return [
      this.buildSignal("热量", plan.totals.calories, plan.targetCalories, "kcal", 0.08),
      this.buildSignal("蛋白质", plan.totals.protein, plan.targetProtein, "g", 0.1),
      this.buildSignal("碳水", plan.totals.carbs, plan.targetCarbs, "g", 0.15),
      this.buildSignal("脂肪", plan.totals.fat, plan.targetFat, "g", 0.15)
    ];
  },

  buildSignal(label, actual, target, unit, tolerance) {
    const value = Number(actual || 0);
    const goal = Number(target || 1);
    const diff = value - goal;
    const absDiff = Math.abs(diff);
    const percent = this.percent(value, goal);
    let state = "ok";
    let message = "接近目标";
    if (diff > goal * tolerance) {
      state = "high";
      message = `超出 ${Math.round(absDiff)}${unit}`;
    } else if (diff < -goal * tolerance) {
      state = "low";
      message = `不足 ${Math.round(absDiff)}${unit}`;
    }
    return {
      label,
      actual: Math.round(value),
      target: Math.round(goal),
      unit,
      percent,
      state,
      message
    };
  },

  percent(value, target) {
    return clamp(Math.round((Number(value || 0) / Number(target || 1)) * 100), 0, 140);
  },

  goOnboarding() {
    wx.navigateTo({ url: "/pages/onboarding/onboarding" });
  },

  openWeekMealPlan() {
    wx.navigateTo({ url: "/pages/mealDetail/mealDetail" });
  },

  restoreRecommendation() {
    if (!this.data.profile) {
      wx.showToast({ title: "请先填写基础信息", icon: "none" });
      return;
    }
    const next = rules.generateMealPlan(this.data.profile);
    storage.saveMealPlan(next);
    this.setDecoratedPlan(this.data.profile, next);
    wx.showToast({ title: "已恢复推荐饮食", icon: "success" });
  },

  applyModeTemplate() {
    if (!this.data.profile) {
      wx.showToast({ title: "请先填写基础信息", icon: "none" });
      return;
    }
    const next = rules.generateMealPlan(this.data.profile);
    storage.saveMealPlan(next);
    this.setDecoratedPlan(this.data.profile, next);
    wx.showToast({ title: "已按饮食模式重建", icon: "success" });
  },

  toggleBreakfast() {
    if (!this.data.profile) {
      wx.showToast({ title: "请先填写基础信息", icon: "none" });
      return;
    }
    const skip = this.data.profile.breakfastHabit !== "skip";
    const profile = {
      ...this.data.profile,
      breakfastHabit: skip ? "skip" : "eat",
      noBreakfast: skip
    };
    storage.saveProfile(profile);
    const next = rules.generateMealPlan(profile);
    storage.saveMealPlan(next);
    this.setDecoratedPlan(profile, next);
    wx.showToast({ title: skip ? "已关闭早餐并重分配" : "已恢复早餐餐次", icon: "success" });
  },

  copyYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = this.dateKey(yesterday);
    const source = storage.getMealPlanByDate(date);
    if (!source) {
      wx.showToast({ title: "暂无昨天保存的饮食", icon: "none" });
      return;
    }
    const next = rules.recalculateMealPlan(
      {
        ...JSON.parse(JSON.stringify(source)),
        id: `meal_plan_${Date.now()}`,
        copiedFrom: date
      },
      this.data.profile || {}
    );
    storage.saveMealPlan(next);
    this.setDecoratedPlan(this.data.profile, next);
    wx.showToast({ title: "已复制昨天饮食", icon: "success" });
  },

  dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  openFoodLibrary(event) {
    const meal = event && event.currentTarget ? event.currentTarget.dataset.meal : "";
    const query = meal === "" || meal === undefined ? "" : `?meal=${meal}`;
    wx.navigateTo({ url: `/pages/foodLibrary/foodLibrary${query}` });
  },

  savePlan() {
    if (!this.data.plan) {
      wx.showToast({ title: "暂无饮食计划", icon: "none" });
      return;
    }
    storage.saveMealPlan(this.data.plan);
    storage.saveMealHistory(this.data.plan);
    wx.showToast({ title: "饮食计划已保存", icon: "success" });
  },

  persist(plan) {
    const next = rules.recalculateMealPlan(plan, this.data.profile || {});
    storage.saveMealPlan(next);
    this.setDecoratedPlan(this.data.profile, next);
  },

  async removeMeal(event) {
    const mealIndex = Number(event.currentTarget.dataset.meal);
    const confirmed = await ui.showConfirm("确定要删除这个餐次吗？");
    if (!confirmed) return;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.meals.splice(mealIndex, 1);
    this.redistributeMeals(plan);
    this.persist(plan);
  },

  addMeal() {
    if (!this.data.plan) return;
    const options = [
      { mealType: "breakfast", mealName: "早餐" },
      { mealType: "lunch", mealName: "午餐" },
      { mealType: "dinner", mealName: "晚餐" },
      { mealType: "snack", mealName: "加餐" }
    ];
    wx.showActionSheet({
      itemList: options.map((item) => item.mealName),
      success: (res) => {
        const selected = options[res.tapIndex];
        const plan = JSON.parse(JSON.stringify(this.data.plan));
        plan.meals.push({
          id: `meal_custom_${Date.now()}`,
          mealType: selected.mealType,
          mealName: selected.mealName,
          targetCalories: 0,
          foods: [],
          sortOrder: plan.meals.length + 1
        });
        this.redistributeMeals(plan);
        this.persist(plan);
      }
    });
  },

  redistributeMeals(plan) {
    const totalRatio = plan.meals.length || 1;
    plan.meals.forEach((meal) => {
      meal.targetCalories = Math.round(plan.targetCalories / totalRatio);
    });
  },

  stepAmount(event) {
    const mealIndex = Number(event.currentTarget.dataset.meal);
    const foodIndex = Number(event.currentTarget.dataset.food);
    const delta = Number(event.currentTarget.dataset.delta);
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const item = plan.meals[mealIndex].foods[foodIndex];
    const source = foods.find((food) => food.id === item.foodId);
    if (!source) return;
    const step = source.unit === "个" ? delta / 10 : delta;
    const min = source.unit === "个" ? 1 : 10;
    this.updateFoodAmount(plan, mealIndex, foodIndex, Math.max(min, Number(item.amount || min) + step), source);
  },

  setAmount(event) {
    const mealIndex = Number(event.currentTarget.dataset.meal);
    const foodIndex = Number(event.currentTarget.dataset.food);
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const item = plan.meals[mealIndex].foods[foodIndex];
    const source = foods.find((food) => food.id === item.foodId);
    if (!source) return;
    const min = source.unit === "个" ? 1 : 10;
    const amount = Math.max(min, Number(event.detail.value || min));
    this.updateFoodAmount(plan, mealIndex, foodIndex, amount, source);
  },

  updateFoodAmount(plan, mealIndex, foodIndex, amount, source) {
    const normalizedAmount = source.unit === "个" ? Math.round(amount * 10) / 10 : Math.round(amount / 5) * 5;
    const macro = rules.macroForFood(source, normalizedAmount);
    plan.meals[mealIndex].foods[foodIndex] = {
      ...plan.meals[mealIndex].foods[foodIndex],
      amount: normalizedAmount,
      ...macro
    };
    this.persist(plan);
  },

  async removeFood(event) {
    const mealIndex = Number(event.currentTarget.dataset.meal);
    const foodIndex = Number(event.currentTarget.dataset.food);
    const confirmed = await ui.showConfirm("确定要删除这个食物吗？");
    if (!confirmed) return;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.meals[mealIndex].foods.splice(foodIndex, 1);
    this.persist(plan);
  },

  saveMealAsTemplate(event) {
    const mealIndex = Number(event.currentTarget.dataset.meal);
    const meal = this.data.plan && this.data.plan.meals[mealIndex];
    if (!meal || !meal.foods.length) {
      wx.showToast({ title: "当前餐次没有食物", icon: "none" });
      return;
    }
    const cleanMeal = {
      name: meal.mealName,
      mealType: meal.mealType,
      mealName: meal.mealName,
      targetCalories: meal.targetCalories,
      foods: meal.foods.map((food, index) => ({
        id: `${food.foodId}_${Date.now()}_${index}`,
        foodId: food.foodId,
        foodName: food.foodName,
        amount: food.amount,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        isCustom: Boolean(food.isCustom)
      })),
      sortOrder: 1
    };
    const savedMeals = storage.saveSavedMeal(cleanMeal);
    this.setData({
      savedMeals: this.decorateSavedMeals(savedMeals),
      hasSavedMeals: savedMeals.length > 0
    });
    wx.showToast({ title: "已保存为常用餐", icon: "success" });
  },

  applySavedMeal(event) {
    const id = event.currentTarget.dataset.id;
    const saved = storage.getSavedMeals().find((meal) => meal.id === id);
    if (!saved || !this.data.plan) return;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.meals.push({
      ...saved,
      id: `meal_saved_${Date.now()}`,
      mealName: saved.name || saved.mealName || "常用餐",
      foods: (saved.foods || []).map((food, index) => ({
        ...food,
        id: `${food.foodId}_${Date.now()}_${index}`
      })),
      sortOrder: plan.meals.length + 1
    });
    this.redistributeMeals(plan);
    this.persist(plan);
    wx.showToast({ title: "已加入常用餐", icon: "success" });
  },

  deleteSavedMeal(event) {
    const savedMeals = storage.deleteSavedMeal(event.currentTarget.dataset.id);
    this.setData({
      savedMeals: this.decorateSavedMeals(savedMeals),
      hasSavedMeals: savedMeals.length > 0
    });
  },

  replaceFood(event) {
    const mealIndex = Number(event.currentTarget.dataset.meal);
    const foodIndex = Number(event.currentTarget.dataset.food);
    const current = this.data.plan.meals[mealIndex].foods[foodIndex];
    const alternatives = rules.getFoodAlternatives(current.foodId, this.data.profile);
    if (!alternatives.length) {
      wx.showToast({ title: "暂无可替换食物", icon: "none" });
      return;
    }
    wx.showActionSheet({
      itemList: alternatives.slice(0, 6).map((item) => item.name),
      success: (res) => {
        const selected = alternatives[res.tapIndex];
        const amount = selected.unit === "个" ? 2 : current.amount;
        const macro = rules.macroForFood(selected, amount);
        const plan = JSON.parse(JSON.stringify(this.data.plan));
        plan.meals[mealIndex].foods[foodIndex] = {
          ...current,
          foodId: selected.id,
          foodName: selected.name,
          amount,
          unit: selected.unit,
          ...macro
        };
        storage.addRecentFood(selected.id);
        this.persist(plan);
      }
    });
  }
});
