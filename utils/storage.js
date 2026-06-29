const { todayKey } = require("./format");

const keys = {
  profile: "user_profile",
  workoutPlan: "current_workout_plan",
  mealPlan: "current_meal_plan",
  checkins: "checkins",
  workoutLogs: "workout_logs",
  favoriteExercises: "favorite_exercises",
  favoriteFoods: "favorite_foods",
  recentFoods: "recent_foods",
  savedMeals: "saved_meals",
  mealHistory: "meal_history"
};

function getProfile() {
  return wx.getStorageSync(keys.profile) || null;
}

function saveProfile(profile) {
  wx.setStorageSync(keys.profile, {
    ...profile,
    updatedAt: Date.now()
  });
}

function getWorkoutPlan() {
  const plan = wx.getStorageSync(keys.workoutPlan) || null;
  const profile = getProfile();
  if (!plan || !profile) return plan;
  const rules = require("./rules");
  const next = rules.recalculateWorkoutPlan(plan, profile);
  if (JSON.stringify(next.days || []) !== JSON.stringify(plan.days || [])) {
    wx.setStorageSync(keys.workoutPlan, next);
  }
  return next;
}

function saveWorkoutPlan(plan) {
  wx.setStorageSync(keys.workoutPlan, {
    ...plan,
    updatedAt: Date.now()
  });
}

function getMealPlan() {
  return wx.getStorageSync(keys.mealPlan) || null;
}

function saveMealPlan(plan) {
  wx.setStorageSync(keys.mealPlan, {
    ...plan,
    updatedAt: Date.now()
  });
}

function getCheckins() {
  return wx.getStorageSync(keys.checkins) || [];
}

function saveCheckin(checkin) {
  const checkins = getCheckins();
  const date = checkin.date || todayKey();
  const next = checkins.filter((item) => item.date !== date);
  next.push({
    ...checkin,
    date,
    updatedAt: Date.now()
  });
  next.sort((a, b) => a.date.localeCompare(b.date));
  wx.setStorageSync(keys.checkins, next);
}

function getTodayCheckin() {
  const date = todayKey();
  return getCheckins().find((item) => item.date === date) || null;
}

function getWorkoutLogs() {
  return wx.getStorageSync(keys.workoutLogs) || [];
}

function saveWorkoutLog(log) {
  const logs = getWorkoutLogs();
  logs.push({
    ...log,
    id: log.id || `workout_log_${Date.now()}`,
    date: log.date || todayKey(),
    createdAt: Date.now()
  });
  logs.sort((a, b) => `${a.date}${a.createdAt}`.localeCompare(`${b.date}${b.createdAt}`));
  wx.setStorageSync(keys.workoutLogs, logs);
}

function getFavoriteExercises() {
  return wx.getStorageSync(keys.favoriteExercises) || [];
}

function toggleFavoriteExercise(exerciseId) {
  const favorites = new Set(getFavoriteExercises());
  if (favorites.has(exerciseId)) favorites.delete(exerciseId);
  else favorites.add(exerciseId);
  const next = Array.from(favorites);
  wx.setStorageSync(keys.favoriteExercises, next);
  return next;
}

function getFavoriteFoods() {
  return wx.getStorageSync(keys.favoriteFoods) || [];
}

function toggleFavoriteFood(foodId) {
  const favorites = new Set(getFavoriteFoods());
  if (favorites.has(foodId)) favorites.delete(foodId);
  else favorites.add(foodId);
  const next = Array.from(favorites);
  wx.setStorageSync(keys.favoriteFoods, next);
  return next;
}

function getRecentFoods() {
  return wx.getStorageSync(keys.recentFoods) || [];
}

function addRecentFood(foodId) {
  const next = [foodId, ...getRecentFoods().filter((id) => id !== foodId)].slice(0, 20);
  wx.setStorageSync(keys.recentFoods, next);
  return next;
}

function getSavedMeals() {
  return wx.getStorageSync(keys.savedMeals) || [];
}

function saveSavedMeal(meal) {
  const savedMeals = getSavedMeals();
  const next = [
    {
      ...meal,
      id: meal.id || `saved_meal_${Date.now()}`,
      savedAt: Date.now()
    },
    ...savedMeals
  ].slice(0, 20);
  wx.setStorageSync(keys.savedMeals, next);
  return next;
}

function deleteSavedMeal(id) {
  const next = getSavedMeals().filter((meal) => meal.id !== id);
  wx.setStorageSync(keys.savedMeals, next);
  return next;
}

function getMealHistory() {
  return wx.getStorageSync(keys.mealHistory) || [];
}

function saveMealHistory(plan, date = todayKey()) {
  const history = getMealHistory().filter((item) => item.date !== date);
  history.push({
    date,
    plan,
    savedAt: Date.now()
  });
  history.sort((a, b) => a.date.localeCompare(b.date));
  wx.setStorageSync(keys.mealHistory, history.slice(-60));
}

function getMealPlanByDate(date) {
  const record = getMealHistory().find((item) => item.date === date);
  return record ? record.plan : null;
}

module.exports = {
  keys,
  getProfile,
  saveProfile,
  getWorkoutPlan,
  saveWorkoutPlan,
  getMealPlan,
  saveMealPlan,
  getCheckins,
  saveCheckin,
  getTodayCheckin,
  getWorkoutLogs,
  saveWorkoutLog,
  getFavoriteExercises,
  toggleFavoriteExercise,
  getFavoriteFoods,
  toggleFavoriteFood,
  getRecentFoods,
  addRecentFood,
  getSavedMeals,
  saveSavedMeal,
  deleteSavedMeal,
  getMealHistory,
  saveMealHistory,
  getMealPlanByDate
};
