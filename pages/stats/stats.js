const storage = require("../../utils/storage");
const { todayKey, round, clamp } = require("../../utils/format");
const ui = require("../../utils/ui");

Page({
  data: {
    period: "week",
    periodText: "本周",
    hasData: false,
    checkins: [],
    workoutLogs: [],
    mealHistory: [],
    recentLogs: [],
    workoutRate: 0,
    dietRate: 0,
    latestWeight: "-",
    startWeight: "-",
    weightChangeText: "暂无",
    weightChangeType: "flat",
    weightPoints: [],
    calorieBars: [],
    proteinBars: [],
    avgCalories: 0,
    targetCalories: 0,
    avgProtein: 0,
    targetProtein: 0,
    caloriePercent: 0,
    proteinPercent: 0,
    workoutDoneCount: 0,
    workoutExpectedCount: 0,
    dietDoneCount: 0,
    periodDays: 7,
    checkinDays: 0,
    mealDays: 0,
    streak: 0,
    advice: ""
  },

  onShow() {
    this.loadStats();
  },

  setPeriod(event) {
    this.setData({ period: event.currentTarget.dataset.period });
    this.loadStats();
  },

  loadStats() {
    const profile = storage.getProfile();
    const workoutPlan = storage.getWorkoutPlan();
    const mealPlan = storage.getMealPlan();
    const checkins = storage.getCheckins();
    const workoutLogs = storage.getWorkoutLogs();
    const mealHistory = storage.getMealHistory();
    const range = this.buildRange(this.data.period);
    const periodCheckins = this.inRange(checkins, range);
    const periodWorkoutLogs = this.inRange(workoutLogs, range);
    const periodMeals = this.inRange(mealHistory, range);
    const workoutExpectedCount = this.expectedWorkouts(workoutPlan, range);
    const workoutDoneCount = this.workoutCompletionCount(periodWorkoutLogs, periodCheckins);
    const workoutRate = workoutExpectedCount ? Math.round((workoutDoneCount / workoutExpectedCount) * 100) : this.rate(periodCheckins, "workoutDone");
    const dietDoneCount = periodCheckins.filter((item) => item.dietDone).length;
    const dietRate = range.days ? Math.round((dietDoneCount / range.days) * 100) : 0;
    const weights = periodCheckins.filter((item) => item.weight).map((item) => ({ ...item, weight: Number(item.weight) }));
    const latestWeight = weights.length ? weights[weights.length - 1].weight : profile && profile.weight ? Number(profile.weight) : null;
    const startWeight = weights.length ? weights[0].weight : profile && profile.weight ? Number(profile.weight) : null;
    const mealStats = this.buildMealStats(periodMeals, mealPlan);
    
    // 计算营养百分比
    const caloriePercent = mealStats.targetCalories ? clamp(Math.round((mealStats.avgCalories / mealStats.targetCalories) * 100), 0, 100) : 0;
    const proteinPercent = mealStats.targetProtein ? clamp(Math.round((mealStats.avgProtein / mealStats.targetProtein) * 100), 0, 100) : 0;

    this.setData({
      periodText: range.label,
      hasData: periodCheckins.length > 0 || periodWorkoutLogs.length > 0 || periodMeals.length > 0,
      checkins: periodCheckins,
      workoutLogs: periodWorkoutLogs,
      mealHistory: periodMeals,
      recentLogs: periodWorkoutLogs.slice(-5).reverse(),
      workoutRate: clamp(workoutRate, 0, 100),
      dietRate: clamp(dietRate, 0, 100),
      latestWeight: latestWeight ? round(latestWeight, 1) : "-",
      startWeight: startWeight ? round(startWeight, 1) : "-",
      weightChangeText: this.weightChangeText(startWeight, latestWeight),
      weightChangeType: this.weightChangeType(startWeight, latestWeight),
      weightPoints: this.buildWeightPoints(weights),
      calorieBars: this.buildNutritionBars(periodMeals, "calories", mealPlan ? mealPlan.targetCalories : 0),
      proteinBars: this.buildNutritionBars(periodMeals, "protein", mealPlan ? mealPlan.targetProtein : 0),
      avgCalories: mealStats.avgCalories,
      targetCalories: mealStats.targetCalories,
      avgProtein: mealStats.avgProtein,
      targetProtein: mealStats.targetProtein,
      caloriePercent,
      proteinPercent,
      workoutDoneCount,
      workoutExpectedCount,
      dietDoneCount,
      periodDays: range.days,
      checkinDays: periodCheckins.length,
      mealDays: periodMeals.length,
      streak: this.calculateStreak(checkins),
      advice: this.buildAdvice({
        workoutRate,
        dietRate,
        periodCheckins,
        periodWorkoutLogs,
        periodMeals,
        mealStats,
        latestWeight,
        startWeight
      })
    });
  },

  buildRange(period) {
    const end = new Date();
    const start = new Date();
    if (period === "month") {
      start.setDate(end.getDate() - 29);
      return {
        label: "本月",
        startKey: todayKey(start),
        endKey: todayKey(end),
        days: 30
      };
    }
    start.setDate(end.getDate() - 6);
    return {
      label: "本周",
      startKey: todayKey(start),
      endKey: todayKey(end),
      days: 7
    };
  },

  inRange(items, range) {
    return (items || [])
      .filter((item) => item.date >= range.startKey && item.date <= range.endKey)
      .sort((a, b) => this.recordSortKey(a).localeCompare(this.recordSortKey(b)));
  },

  recordSortKey(item) {
    return `${item.date || ""}_${item.createdAt || item.savedAt || item.updatedAt || item.id || ""}`;
  },

  workoutCompletionCount(workoutLogs, checkins) {
    const loggedDates = new Set((workoutLogs || []).map((item) => item.date));
    const checkinOnlyCount = (checkins || []).filter((item) => item.workoutDone && !loggedDates.has(item.date)).length;
    return (workoutLogs || []).length + checkinOnlyCount;
  },

  expectedWorkouts(workoutPlan, range) {
    if (!workoutPlan || !workoutPlan.weeklyDays) return 0;
    return Math.max(1, Math.round((Number(workoutPlan.weeklyDays) * range.days) / 7));
  },

  rate(checkins, field) {
    if (!checkins.length) return 0;
    const total = checkins.filter((item) => item[field]).length;
    return Math.round((total / checkins.length) * 100);
  },

  weightChangeText(start, latest) {
    if (!start || !latest) return "暂无";
    const diff = round(latest - start, 1);
    if (diff === 0) return "持平";
    return `${diff > 0 ? "+" : ""}${diff}kg`;
  },

  weightChangeType(start, latest) {
    if (!start || !latest) return "flat";
    const diff = round(latest - start, 1);
    if (diff === 0) return "flat";
    return diff > 0 ? "up" : "down";
  },

  buildWeightPoints(weights) {
    const recent = weights.slice(-7);
    if (!recent.length) return [];
    const values = recent.map((item) => Number(item.weight));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return recent.map((item, index) => {
      const value = Number(item.weight);
      const percent = ((value - min) / range) * 80 + 10; // 10% - 90%
      const position = (index / (recent.length - 1)) * 100;
      return {
        date: item.date,
        label: item.date.slice(5).replace("-", "/"),
        value: round(value, 1),
        percent: Math.round(percent),
        position: Math.round(position)
      };
    });
  },

  buildMealStats(mealHistory, mealPlan) {
    const meals = (mealHistory || []).map((item) => item.plan).filter(Boolean);
    const count = meals.length || 1;
    const totals = meals.reduce(
      (acc, plan) => {
        acc.calories += Number(plan.totals && plan.totals.calories ? plan.totals.calories : 0);
        acc.protein += Number(plan.totals && plan.totals.protein ? plan.totals.protein : 0);
        return acc;
      },
      { calories: 0, protein: 0 }
    );
    return {
      avgCalories: meals.length ? Math.round(totals.calories / count) : 0,
      targetCalories: mealPlan ? Math.round(mealPlan.targetCalories || 0) : 0,
      avgProtein: meals.length ? Math.round(totals.protein / count) : 0,
      targetProtein: mealPlan ? Math.round(mealPlan.targetProtein || 0) : 0
    };
  },

  buildNutritionBars(mealHistory, field, target) {
    const recent = (mealHistory || []).slice(-7);
    if (!recent.length) return [];
    const values = recent.map((item) => Number(item.plan && item.plan.totals ? item.plan.totals[field] || 0 : 0));
    const max = Math.max(...values, Number(target || 0), 1);
    return recent.map((item, index) => {
      const value = values[index];
      return {
        date: item.date,
        label: item.date.slice(5).replace("-", "/"),
        value: Math.round(value),
        height: Math.max(18, Math.round((value / max) * 132)),
        targetHeight: Math.max(18, Math.round((Number(target || 0) / max) * 132))
      };
    });
  },

  calculateStreak(checkins) {
    const dates = new Set((checkins || []).map((item) => item.date));
    let streak = 0;
    const cursor = new Date();
    while (dates.has(todayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  buildAdvice(payload) {
    const { workoutRate, dietRate, periodCheckins, periodWorkoutLogs, periodMeals, mealStats, latestWeight, startWeight } = payload;
    const lastWorkout = periodWorkoutLogs[periodWorkoutLogs.length - 1];
    const lastCheckin = periodCheckins[periodCheckins.length - 1];
    if (lastWorkout && Number(lastWorkout.completionRate) < 70) {
      return "最近一次训练完成度偏低，下次可以减少 1 个动作或降低 1 组，先保证完成。";
    }
    if (workoutRate < 60) return "训练完成率偏低，建议下周减少动作数量或缩短单次训练时间。";
    if (dietRate < 60) return "饮食达标率偏低，建议优先固定早餐和午餐，晚餐再做微调。";
    if (periodMeals.length && mealStats.targetCalories && mealStats.avgCalories > mealStats.targetCalories * 1.15) {
      return "平均热量高于目标，优先减少高油外卖、甜饮和主食份量。";
    }
    if (periodMeals.length && mealStats.targetProtein && mealStats.avgProtein < mealStats.targetProtein * 0.85) {
      return "平均蛋白质偏低，建议每餐补一个高蛋白来源，例如鸡蛋、鱼虾、瘦肉或豆制品。";
    }
    if (startWeight && latestWeight && latestWeight - startWeight > 1) {
      return "体重上升较快，如果目标是减脂，需要检查热量和饮食达标记录。";
    }
    if (lastCheckin && Number(lastCheckin.fatigueLevel) >= 4) {
      return "最近疲劳偏高，下一次训练可以减少 1 组或改为低强度有氧。";
    }
    return "当前执行情况稳定，优先保持当前计划，不需要频繁大改。";
  },

  goCheckin() {
    wx.navigateTo({ url: "/pages/checkin/checkin" });
  }
});
