const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const { clamp } = require("../../utils/format");
const ui = require("../../utils/ui");

Page({
  data: {
    profile: null,
    goalLabel: "",
    levelLabel: "",
    locationLabel: "",
    equipmentLabel: "",
    statusText: "计划进行中",
    streak: 0,
    workoutCount: 0,
    totalCalories: 0,
    activeDays: 0,
    weightDiff: "0",
    progressPercent: 0,
    dietModeText: "混合模式"
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const profile = storage.getProfile();
    const checkins = storage.getCheckins();
    const workoutLogs = storage.getWorkoutLogs();
    const mealHistory = storage.getMealHistory();
    const goalLabel = profile ? rules.goalLabels[profile.goal] : "";
    const levelLabel = profile ? rules.levelLabels[profile.level] : "";
    const locationLabel = profile ? rules.locationLabels[profile.location] : "";
    const equipmentLabel = profile ? rules.equipmentLabels[profile.equipment] : "";
    
    // 计算体重差值和进度
    let weightDiff = "0";
    let progressPercent = 0;
    if (profile) {
      const currentWeight = Number(profile.weight);
      const targetWeight = Number(profile.targetWeight);
      const startWeight = checkins.length > 0 ? Number(checkins[0].weight || currentWeight) : currentWeight;
      weightDiff = Math.abs(currentWeight - targetWeight).toFixed(1);
      
      // 计算进度百分比
      if (startWeight !== targetWeight) {
        const totalDiff = Math.abs(startWeight - targetWeight);
        const currentDiff = Math.abs(currentWeight - targetWeight);
        progressPercent = clamp(Math.round(((totalDiff - currentDiff) / totalDiff) * 100), 0, 100);
      }
    }
    
    // 计算总消耗热量（估算）
    const totalCalories = workoutLogs.reduce((sum, log) => {
      return sum + (log.estimatedCalories || 300);
    }, 0);
    
    // 计算活跃天数
    const activeDays = new Set([
      ...checkins.map(c => c.date),
      ...workoutLogs.map(l => l.date)
    ]).size;
    
    // 饮食模式文本
    const dietModeText = this.getDietModeText(profile ? profile.dietMode : "");

    this.setData({
      profile,
      goalLabel,
      levelLabel,
      locationLabel,
      equipmentLabel,
      statusText: profile ? `${goalLabel || "计划"}进行中` : "计划进行中",
      streak: this.calculateStreak(checkins),
      workoutCount: workoutLogs.length,
      totalCalories: totalCalories >= 1000 ? `${(totalCalories / 1000).toFixed(1)}k` : totalCalories,
      activeDays,
      weightDiff,
      progressPercent,
      dietModeText
    });
  },

  getDietModeText(mode) {
    const modeMap = {
      home: "自己做饭",
      canteen: "食堂模式",
      takeout: "外卖模式",
      mixed: "混合模式"
    };
    return modeMap[mode] || "混合模式";
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

  goOnboarding() {
    wx.navigateTo({ url: "/pages/onboarding/onboarding" });
  },

  goStats() {
    wx.switchTab({ url: "/pages/stats/stats" });
  },

  handleMenuTap(event) {
    const action = event.currentTarget.dataset.action;
    const handlers = {
      goal: this.openGoal,
      history: this.openHistory,
      exercises: this.openFavoriteExercises,
      foods: this.openCommonFoods,
      diet: this.openDietPreference,
      settings: this.openSettings,
      help: this.openHelp
    };
    const handler = handlers[action];
    if (handler) handler.call(this);
  },

  openGoal() {
    if (!this.data.profile) {
      wx.showToast({ title: "请先填写资料", icon: "none" });
      return;
    }
    wx.showModal({
      title: "当前目标",
      content: `目标：${this.data.goalLabel}\n水平：${this.data.levelLabel}\n地点：${this.data.locationLabel}\n器械：${this.data.equipmentLabel}`,
      confirmText: "查看计划",
      cancelText: "关闭",
      success: (res) => {
        if (res.confirm) wx.switchTab({ url: "/pages/plan/plan" });
      }
    });
  },

  openHistory() {
    const workoutPlan = storage.getWorkoutPlan();
    const mealHistory = storage.getMealHistory();
    if (!workoutPlan && !mealHistory.length) {
      wx.showToast({ title: "暂无历史计划", icon: "none" });
      return;
    }
    wx.showModal({
      title: "历史计划",
      content: `已保存当前训练计划和 ${mealHistory.length} 条饮食记录。`,
      confirmText: "查看数据",
      cancelText: "关闭",
      success: (res) => {
        if (res.confirm) wx.switchTab({ url: "/pages/stats/stats" });
      }
    });
  },

  openFavoriteExercises() {
    const plan = storage.getWorkoutPlan();
    if (!plan || !Array.isArray(plan.days)) {
      wx.showToast({ title: "请先生成训练计划", icon: "none" });
      return;
    }
    const dayIndex = plan.days.findIndex((day) => !day.isRestDay);
    if (dayIndex < 0) {
      wx.showToast({ title: "请先添加训练日", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/exerciseLibrary/exerciseLibrary?day=${dayIndex}&favorites=1` });
  },

  openCommonFoods() {
    wx.navigateTo({ url: "/pages/foodLibrary/foodLibrary" });
  },

  openDietPreference() {
    const profile = this.data.profile;
    if (!profile) {
      wx.showToast({ title: "请先填写资料", icon: "none" });
      return;
    }
    wx.showModal({
      title: "饮食偏好",
      content: `当前饮食模式：${this.data.dietModeText}\n早餐习惯：${profile.breakfastHabit === "skip" ? "不吃早餐" : "正常早餐"}\n如需修改，可重新填写计划信息。`,
      confirmText: "重新填写",
      cancelText: "关闭",
      success: (res) => {
        if (res.confirm) this.goOnboarding();
      }
    });
  },

  openSettings() {
    wx.showActionSheet({
      itemList: ["重新填写资料", "查看本地数据状态", "清除所有数据"],
      success: (res) => {
        if (res.tapIndex === 0) this.goOnboarding();
        if (res.tapIndex === 1) this.showLocalDataStatus();
        if (res.tapIndex === 2) this.clearAllData();
      }
    });
  },

  showLocalDataStatus() {
    const workoutPlan = storage.getWorkoutPlan();
    const mealPlan = storage.getMealPlan();
    const checkins = storage.getCheckins();
    const workoutLogs = storage.getWorkoutLogs();
    const mealHistory = storage.getMealHistory();
    wx.showModal({
      title: "本地数据状态",
      content: `训练计划：${workoutPlan ? "已生成" : "未生成"}\n饮食计划：${mealPlan ? "已生成" : "未生成"}\n打卡记录：${checkins.length} 条\n训练记录：${workoutLogs.length} 条\n饮食历史：${mealHistory.length} 条`,
      showCancel: false,
      confirmText: "知道了"
    });
  },

  clearAllData() {
    wx.showModal({
      title: "确认清除",
      content: "清除后所有本地数据将丢失，无法恢复。确定要清除吗？",
      confirmText: "确认清除",
      confirmColor: "#ff4444",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            this.loadData();
            wx.showToast({ title: "数据已清除", icon: "success" });
          } catch (e) {
            wx.showToast({ title: "清除失败", icon: "none" });
          }
        }
      }
    });
  },

  openHelp() {
    wx.showModal({
      title: "帮助与反馈",
      content: "如果发现页面空白、点击无反应或数据未更新，请记录页面截图和操作路径。",
      showCancel: false,
      confirmText: "知道了"
    });
  },

  showAbout() {
    wx.showModal({
      title: "关于 FitPlan",
      content: "版本：v1.2.0\n一款专业的健身计划与饮食管理应用\n基于科学规则引擎生成个性化方案",
      showCancel: false,
      confirmText: "知道了"
    });
  }
});
