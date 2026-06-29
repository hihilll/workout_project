const storage = require("../../utils/storage");
const { weekdayIndex, todayKey } = require("../../utils/format");
const ui = require("../../utils/ui");

Page({
  data: {
    hasProfile: false,
    profile: null,
    workoutPlan: null,
    mealPlan: null,
    todayWorkout: null,
    todayDate: "",
    profileInitial: "X",
    estimateCalories: 350,
    currentWeight: "-",
    startWeight: "-",
    streak: 0,
    weekWorkoutDone: 0,
    weekWorkoutTarget: 0,
    weekDietDone: 0,
    nutritionPercent: 0,
    nutritionStatus: "ok",
    proteinPercent: 0,
    carbsPercent: 0,
    fatPercent: 0,
    weekCheckins: [],
    weightBars: [],
    weightDirection: "flat",
    weightDiff: "0",
    chartMax: 0,
    chartMid: 0,
    chartMin: 0
  },

  onShow() {
    this.load();
  },

  load() {
    const profile = storage.getProfile();
    const workoutPlan = storage.getWorkoutPlan();
    const mealPlan = storage.getMealPlan();
    const checkins = storage.getCheckins();
    const logs = storage.getWorkoutLogs();
    const todayWorkout = workoutPlan ? workoutPlan.days[weekdayIndex()] : null;
    const weights = checkins.filter((item) => item.weight);
    const currentWeight = weights.length ? weights[weights.length - 1].weight : profile ? profile.weight : "-";
    const startWeight = weights.length ? weights[0].weight : profile ? profile.weight : "-";
    const weekCheckins = this.buildWeekCheckins(checkins);
    const weightBars = this.buildWeightBars(weights);
    const weightDirection = this.getWeightDirection(weights);
    const weightDiff = this.getWeightDiff(weights);

    this.setData({
      hasProfile: Boolean(profile && workoutPlan && mealPlan),
      profile,
      workoutPlan,
      mealPlan,
      todayWorkout,
      todayDate: this.formatToday(),
      profileInitial: profile ? (profile.gender === "male" ? "男" : "女") : "X",
      estimateCalories: this.estimateCalories(todayWorkout, profile),
      currentWeight,
      startWeight,
      streak: this.calculateStreak(checkins),
      weekWorkoutDone: this.countRecentLogs(logs, 7),
      weekWorkoutTarget: workoutPlan ? workoutPlan.days.filter((day) => !day.isRestDay).length : 0,
      weekDietDone: this.countRecentDiet(checkins, 7),
      nutritionPercent: mealPlan ? Math.round((mealPlan.totals.calories / mealPlan.targetCalories) * 100) : 0,
      nutritionStatus: this.getNutritionStatus(mealPlan),
      proteinPercent: mealPlan ? Math.min(100, Math.round((mealPlan.totals.protein / mealPlan.targetProtein) * 100)) : 0,
      carbsPercent: mealPlan ? Math.min(100, Math.round((mealPlan.totals.carbs / mealPlan.targetCarbs) * 100)) : 0,
      fatPercent: mealPlan ? Math.min(100, Math.round((mealPlan.totals.fat / mealPlan.targetFat) * 100)) : 0,
      weekCheckins,
      weightBars,
      weightDirection,
      weightDiff,
      chartMax: weightBars.length ? Math.max(...weightBars.map((b) => b.value)) : 0,
      chartMid: weightBars.length ? Math.round((Math.max(...weightBars.map((b) => b.value)) + Math.min(...weightBars.map((b) => b.value))) / 2) : 0,
      chartMin: weightBars.length ? Math.min(...weightBars.map((b) => b.value)) : 0
    });
  },

  formatToday() {
    const now = new Date();
    const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()];
    return `${now.getMonth() + 1}月${now.getDate()}日 ${week}`;
  },

  estimateCalories(day, profile) {
    if (!day || day.isRestDay || !profile) return 0;
    const base = Number(profile.sessionMinutes || 30) * (profile.goal === "fat_loss" ? 8 : 6);
    return Math.round(base / 10) * 10;
  },

  countRecentLogs(logs, days) {
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    const startKey = this.dateKey(start);
    return logs.filter((item) => item.date >= startKey).length;
  },

  countRecentDiet(checkins, days) {
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    const startKey = this.dateKey(start);
    return checkins.filter((item) => item.date >= startKey && item.dietDone).length;
  },

  calculateStreak(checkins) {
    const dates = new Set(checkins.map((item) => item.date));
    let streak = 0;
    const cursor = new Date();
    while (dates.has(this.dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  buildWeekCheckins(checkins) {
    const dayLabels = ["一", "二", "三", "四", "五", "六", "日"];
    const today = weekdayIndex();
    const checkinDates = new Set(checkins.map((item) => item.date));
    return dayLabels.map((label, index) => ({
      day: index,
      label,
      done: checkinDates.has(this.getWeekDate(index)),
      isToday: index === today
    }));
  },

  getWeekDate(dayIndex) {
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const diff = dayIndex - currentDay;
    const date = new Date(now);
    date.setDate(date.getDate() + diff);
    return this.dateKey(date);
  },

  buildWeightBars(weights) {
    if (!weights.length) return [];
    const recent = weights.slice(-7);
    const values = recent.map((w) => Number(w.weight));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return recent.map((w) => ({
      date: w.date,
      value: Number(w.weight),
      height: Math.round(((Number(w.weight) - min) / range) * 80 + 20),
      label: w.date.slice(5)
    }));
  },

  getWeightDirection(weights) {
    if (weights.length < 2) return "flat";
    const latest = Number(weights[weights.length - 1].weight);
    const prev = Number(weights[weights.length - 2].weight);
    if (latest < prev) return "down";
    if (latest > prev) return "up";
    return "flat";
  },

  getWeightDiff(weights) {
    if (weights.length < 2) return "0";
    const latest = Number(weights[weights.length - 1].weight);
    const prev = Number(weights[weights.length - 2].weight);
    return Math.abs(latest - prev).toFixed(1);
  },

  getNutritionStatus(mealPlan) {
    if (!mealPlan) return "ok";
    const percent = (mealPlan.totals.calories / mealPlan.targetCalories) * 100;
    if (percent < 80) return "low";
    if (percent > 120) return "high";
    return "ok";
  },

  goOnboarding() {
    wx.navigateTo({ url: "/pages/onboarding/onboarding" });
  },

  goPlan() {
    wx.switchTab({ url: "/pages/plan/plan" });
  },

  goMeal() {
    wx.switchTab({ url: "/pages/meal/meal" });
  },

  goStats() {
    wx.switchTab({ url: "/pages/stats/stats" });
  },

  goCheckin() {
    wx.navigateTo({ url: "/pages/checkin/checkin" });
  },

  goProfile() {
    wx.switchTab({ url: "/pages/profile/profile" });
  },

  startTodayWorkout() {
    wx.navigateTo({ url: `/pages/session/session?day=${weekdayIndex()}` });
  }
});
