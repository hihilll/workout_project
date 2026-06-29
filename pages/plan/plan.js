const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const { clamp, weekdayIndex } = require("../../utils/format");
const ui = require("../../utils/ui");

const equipmentByLocation = {
  home: [
    { label: "无器械", value: "none", icon: "空" },
    { label: "哑铃", value: "dumbbell", icon: "铃" },
    { label: "弹力带", value: "band", icon: "带" },
    { label: "瑜伽垫", value: "mat", icon: "垫" }
  ],
  gym: [
    { label: "健身房器械", value: "machine", icon: "器" },
    { label: "哑铃", value: "dumbbell", icon: "铃" },
    { label: "杠铃", value: "barbell", icon: "杠" },
    { label: "自由重量", value: "free_weight", icon: "重" }
  ],
  outdoor: [
    { label: "跑步", value: "running", icon: "跑" },
    { label: "快走", value: "walking", icon: "走" },
    { label: "跳绳", value: "jump_rope", icon: "绳" },
    { label: "骑行", value: "cycling", icon: "骑" },
    { label: "自重训练", value: "bodyweight", icon: "自" }
  ]
};

const goalLabels = {
  fat_loss: "减脂",
  muscle_gain: "增肌",
  shape: "塑形",
  health: "保持健康"
};

const locationLabels = {
  home: "居家",
  gym: "健身房",
  outdoor: "户外"
};

Page({
  data: {
    mode: "builder",
    step: 0,
    maxStep: 5,
    totalSteps: 6,
    stepDisplay: 1,
    progressSegments: [],
    stepTitles: ["建立档案", "健身目标", "训练条件", "训练偏好", "饮食习惯", "推荐方案"],
    stepHeadings: ["建立个人档案", "你的健身目标是什么？", "训练条件", "训练偏好", "饮食习惯", "为你推荐的计划"],
    form: {
      gender: "female",
      age: 25,
      height: 165,
      weight: 60,
      targetWeight: 55,
      injuries: [],
      goal: "fat_loss",
      level: "beginner",
      location: "home",
      equipment: "none",
      weeklyDays: 3,
      sessionMinutes: 30,
      planStyle: "auto",
      activityLevel: "light",
      dietPattern: "normal",
      breakfastHabit: "eat",
      dietMode: "takeout",
      avoidFoods: ""
    },
    genderOptions: [
      { label: "男", value: "male", icon: "男" },
      { label: "女", value: "female", icon: "女" }
    ],
    goalOptions: [
      { label: "减脂", value: "fat_loss", desc: "降低体脂，提升轻盈感", icon: "燃" },
      { label: "增肌", value: "muscle_gain", desc: "提升肌肉量与力量表现", icon: "力" },
      { label: "塑形", value: "shape", desc: "优化线条，改善体态", icon: "形" },
      { label: "保持健康", value: "health", desc: "规律运动，提升日常状态", icon: "心" }
    ],
    levelOptions: [
      { label: "新手", value: "beginner" },
      { label: "初级", value: "novice" },
      { label: "中级", value: "intermediate" },
      { label: "高级", value: "advanced" }
    ],
    locationOptions: [
      { label: "居家", value: "home", icon: "家" },
      { label: "健身房", value: "gym", icon: "馆" },
      { label: "户外", value: "outdoor", icon: "户" }
    ],
    equipmentOptions: equipmentByLocation.home,
    weeklyOptions: [2, 3, 4, 5, 6],
    minuteOptions: [15, 30, 45, 60],
    preferenceOptions: [
      { label: "系统推荐", value: "auto", desc: "根据你的目标与条件自动匹配", icon: "荐" },
      { label: "每天练一个部位", value: "split", desc: "适合分化训练与增肌", icon: "臂" },
      { label: "每天全身都练一点", value: "full_body", desc: "更轻松，适合小白与塑形", icon: "全" },
      { label: "简单力量 + 有氧", value: "strength_cardio", desc: "先练力量，再做有氧", icon: "铃" },
      { label: "以有氧燃脂为主", value: "cardio_focus", desc: "快走、慢跑、跳绳等", icon: "跑" },
      { label: "轻量塑形，不想太累", value: "light_shape", desc: "低压力塑形，更容易坚持", icon: "轻" }
    ],
    dietPatternOptions: [
      { label: "正常饮食", value: "normal" },
      { label: "高蛋白", value: "high_protein" },
      { label: "低碳", value: "low_carb" },
      { label: "清淡", value: "light" },
      { label: "素食", value: "vegetarian" }
    ],
    breakfastOptions: [
      { label: "吃", value: "eat" },
      { label: "不吃", value: "skip" },
      { label: "不固定", value: "irregular" }
    ],
    dietModeOptions: [
      { label: "自己做饭", value: "home" },
      { label: "食堂", value: "canteen" },
      { label: "外卖", value: "takeout" },
      { label: "混合", value: "mixed" }
    ],
    avoidOptions: ["无", "牛肉", "猪肉", "鸡蛋", "牛奶", "海鲜"],
    injuryOptions: [
      { label: "膝盖不适", value: "knee_pain" },
      { label: "肩部不适", value: "shoulder_pain" },
      { label: "手腕不适", value: "wrist_pain" }
    ],
    injuryMap: {},
    avoidMap: {},
    recommendation: null,
    recommendationGoalLabel: "减脂",
    recommendationLocationLabel: "居家",
    recommendationPreview: [],
    nutritionSummary: null,
    otherPlans: [],
    showOtherPlans: false,
    risks: [],
    forceBuilder: false,
    profile: null,
    plan: null,
    summaryText: "目标 · 每周 0 天",
    currentPlanText: "尚未生成计划",
    todayIndex: 0,
    weekProgress: 0,
    weekWorkoutDone: 0,
    trainingDays: 0,
    restDays: 7,
    exerciseCount: 0,
    totalSets: 0,
    weekPreviewDays: [],
    recentLogs: [],
    muscleVolume: { list: [], highlight: {} },
    muscleHighlight: {},
    maxVolume: 0
  },

  onShow() {
    this.load();
  },

  load() {
    const profile = storage.getProfile();
    let rawPlan = storage.getWorkoutPlan();
    if ((!rawPlan || !Array.isArray(rawPlan.days)) && profile) {
      rawPlan = rules.generateWorkoutPlan(profile);
      storage.saveWorkoutPlan(rawPlan);
    }
    const plan = rawPlan && Array.isArray(rawPlan.days) ? this.decoratePlan(rawPlan) : null;
    const form = profile ? { ...this.data.form, ...profile } : this.data.form;
    const trainingDays = plan ? plan.days.filter((day) => !day.isRestDay).length : 0;
    const logs = storage.getWorkoutLogs();
    const todayIndex = weekdayIndex();
    const todayWorkout = plan ? plan.days[todayIndex] : null;
    const weekWorkoutDone = this.countRecentLogs(logs, 7);
    const weekProgress = trainingDays > 0 ? Math.round((weekWorkoutDone / trainingDays) * 100) : 0;
    const nextMode = plan ? "overview" : this.data.mode;
    
    const recentLogs = logs.slice(-3).reverse().map((log) => ({
      ...log,
      completionText: `${log.completedSets}/${log.totalSets}组`,
      durationText: log.durationText || "-",
      rateClass: log.completionRate >= 80 ? "good" : log.completionRate >= 60 ? "normal" : "low"
    }));
    
    const muscleVolume = plan ? this.calculateMuscleVolume(plan) : { list: [], highlight: {} };
    const maxVolume = muscleVolume.list.length ? Math.max(...muscleVolume.list.map((item) => item.sets)) : 0;
    
    this.setData({
      mode: nextMode,
      profile,
      plan,
      form,
      todayWorkout,
      equipmentOptions: equipmentByLocation[form.location] || equipmentByLocation.home,
      summaryText: plan ? `${plan.goalLabel} · 每周 ${plan.weeklyDays} 天 · ${plan.sessionMinutes} 分钟` : "目标 · 每周 0 天",
      currentPlanText: profile ? `${goalLabels[profile.goal] || "目标"} · ${locationLabels[profile.location] || "训练"} · 每周${profile.weeklyDays}练` : "尚未生成计划",
      todayIndex,
      weekProgress,
      weekWorkoutDone,
      trainingDays,
      restDays: plan ? 7 - trainingDays : 7,
      exerciseCount: plan ? plan.days.reduce((sum, day) => sum + day.exercises.length, 0) : 0,
      totalSets: plan ? plan.days.reduce((sum, day) => sum + day.totalSets, 0) : 0,
      weekPreviewDays: plan ? plan.days : [],
      recentLogs,
      muscleVolume,
      muscleHighlight: muscleVolume.highlight,
      maxVolume
    });
    this.updateStepMeta(this.data.step);
    this.updateRisk();
    this.updateSelectionMaps();
    this.refreshRecommendation();
  },

  calculateMuscleVolume(plan) {
    const volumeMap = {};
    const muscleNames = {
      chest: "胸",
      back: "背",
      legs: "腿",
      glutes: "臀",
      shoulders: "肩",
      biceps: "肱二头",
      triceps: "肱三头",
      core: "核心",
      cardio: "有氧"
    };
    
    plan.days.forEach((day) => {
      if (day.isRestDay) return;
      (day.exercises || []).forEach((exercise) => {
        (exercise.muscleGroups || []).forEach((group) => {
          if (!volumeMap[group]) {
            volumeMap[group] = { key: group, name: muscleNames[group] || group, sets: 0 };
          }
          volumeMap[group].sets += Number(exercise.sets || 0);
        });
      });
    });
    
    const volumeList = Object.values(volumeMap)
      .filter((item) => item.sets > 0)
      .sort((a, b) => b.sets - a.sets)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        percent: 0
      }))
      .map((item, _, arr) => ({
        ...item,
        percent: arr[0] ? Math.round((item.sets / arr[0].sets) * 100) : 0
      }));
    
    // 生成肌肉高亮数据
    const muscleHighlight = {
      chest: volumeMap.chest ? volumeMap.chest.sets : 0,
      back: volumeMap.back ? volumeMap.back.sets : 0,
      shoulders: volumeMap.shoulders ? volumeMap.shoulders.sets : 0,
      biceps: volumeMap.biceps ? volumeMap.biceps.sets : 0,
      triceps: volumeMap.triceps ? volumeMap.triceps.sets : 0,
      core: volumeMap.core ? volumeMap.core.sets : 0,
      legs: volumeMap.legs ? volumeMap.legs.sets : 0,
      glutes: volumeMap.glutes ? volumeMap.glutes.sets : 0
    };
    
    return {
      list: volumeList,
      highlight: muscleHighlight
    };
  },

  countRecentLogs(logs, days) {
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    const startKey = this.dateKey(start);
    return logs.filter((item) => item.date >= startKey).length;
  },

  dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  decoratePlan(plan) {
    const maxSets = Math.max(...(plan.volume || []).map((item) => item.sets), 1);
    return {
      ...plan,
      volume: (plan.volume || []).map((item) => ({
        ...item,
        percent: clamp(Math.round((item.sets / maxSets) * 100), 0, 100)
      })),
      days: plan.days.map((day) => {
        const warmups = day.warmups || [];
        const stretches = day.stretches || [];
        const exercises = day.exercises || [];
        const totalSets = exercises.reduce((sum, item) => sum + Number(item.sets || 0), 0);
        return {
          ...day,
          warmups,
          stretches,
          exercises,
          totalSets,
          iconClass: day.isRestDay ? "rest" : "",
          iconText: day.isRestDay ? "休" : this.iconForDay(day),
          metaText: day.isRestDay ? "-" : `${totalSets}组 · ${plan.sessionMinutes}分钟`,
          toggleText: day.isRestDay ? "-" : "删除"
        };
      })
    };
  },

  iconForDay(day) {
    const title = day.title || "";
    if (title.includes("胸")) return "胸";
    if (title.includes("背")) return "背";
    if (title.includes("腿") || title.includes("下肢")) return "腿";
    if (title.includes("肩")) return "肩";
    if (title.includes("有氧")) return "跑";
    if (title.includes("核心") || title.includes("手臂")) return "臂";
    return "练";
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
    if (field === "avoidFoods") this.updateSelectionMaps();
    this.updateRisk();
    this.refreshRecommendation();
  },

  selectOption(event) {
    const { field, value } = event.currentTarget.dataset;
    const normalizedValue = ["weeklyDays", "sessionMinutes"].includes(field) ? Number(value) : value;
    const next = { [`form.${field}`]: normalizedValue };
    if (field === "location") {
      const equipmentOptions = equipmentByLocation[normalizedValue] || equipmentByLocation.home;
      next.equipmentOptions = equipmentOptions;
      next["form.equipment"] = equipmentOptions[0].value;
    }
    this.setData(next);
    this.updateRisk();
    this.refreshRecommendation();
  },

  toggleInjury(event) {
    const value = event.currentTarget.dataset.value;
    const injuries = new Set(this.data.form.injuries || []);
    if (injuries.has(value)) injuries.delete(value);
    else injuries.add(value);
    this.setData({ "form.injuries": Array.from(injuries) });
    this.updateRisk();
    this.updateSelectionMaps();
  },

  toggleAvoid(event) {
    const label = event.currentTarget.dataset.value;
    if (label === "无") {
      this.setData({ "form.avoidFoods": "" });
      this.updateSelectionMaps();
      this.refreshRecommendation();
      return;
    }
    const current = this.data.form.avoidFoods ? this.data.form.avoidFoods.split("、").filter(Boolean) : [];
    const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
    this.setData({ "form.avoidFoods": next.join("、") });
    this.updateSelectionMaps();
    this.refreshRecommendation();
  },

  updateSelectionMaps() {
    const injuryMap = {};
    (this.data.form.injuries || []).forEach((item) => {
      injuryMap[item] = true;
    });
    const avoidMap = {};
    (this.data.form.avoidFoods || "")
      .split("、")
      .filter(Boolean)
      .forEach((item) => {
        avoidMap[item] = true;
      });
    this.setData({ injuryMap, avoidMap });
  },

  updateRisk() {
    const profile = rules.normalizeProfile(this.data.form);
    this.setData({ risks: rules.riskCheck(profile).risks });
  },

  refreshRecommendation() {
    const options = rules.recommendPlanOptions(this.data.form);
    const selected = this.data.form.planStyle === "auto" ? options[0] : options.find((item) => item.planStyle === this.data.form.planStyle) || options[0];
    const profile = rules.normalizeProfile({
      ...this.data.form,
      planStyle: selected.planStyle,
      noBreakfast: this.data.form.breakfastHabit === "skip"
    });
    const previewPlan = rules.generateWorkoutPlan(profile);
    const nutrition = rules.calculateNutrition(profile);
    this.setData({
      recommendation: selected,
      recommendationGoalLabel: goalLabels[selected.goal] || "保持健康",
      recommendationLocationLabel: locationLabels[profile.location] || "居家",
      recommendationPreview: previewPlan.days
        .filter((day) => !day.isRestDay)
        .slice(0, 4)
        .map((day) => ({
          dayName: day.dayName,
          title: day.title
        })),
      nutritionSummary: {
        calories: nutrition.targetCalories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat
      },
      otherPlans: options.filter((item) => item.planStyle !== selected.planStyle)
    });
  },

  updateStepMeta(step) {
    const total = this.data.maxStep + 1;
    this.setData({
      stepDisplay: step + 1,
      progressSegments: Array.from({ length: total }, (_, index) => ({
        id: index,
        active: index < step,
        current: index === step
      }))
    });
  },

  next() {
    if (this.data.step === 4) this.refreshRecommendation();
    const step = Math.min(this.data.maxStep, this.data.step + 1);
    this.setData({ step, showOtherPlans: false });
    this.updateStepMeta(step);
  },

  prev() {
    const step = Math.max(0, this.data.step - 1);
    this.setData({ step, showOtherPlans: false });
    this.updateStepMeta(step);
  },

  viewOtherPlans() {
    this.setData({ showOtherPlans: true });
  },

  choosePlan(event) {
    const planStyle = event.currentTarget.dataset.style;
    this.setData({ "form.planStyle": planStyle, showOtherPlans: false });
    this.refreshRecommendation();
  },

  async useRecommendation() {
    const { form } = this.data;
    
    if (!ui.validateNumber(form.age, 10, 80, "年龄")) return;
    if (!ui.validateNumber(form.height, 100, 230, "身高")) return;
    if (!ui.validateNumber(form.weight, 30, 200, "体重")) return;
    if (!ui.validateNumber(form.targetWeight, 30, 200, "目标体重")) return;
    
    ui.showLoading("生成计划中...");
    
    const selected = this.data.recommendation || rules.recommendPlanOptions(this.data.form)[0];
    const profile = rules.normalizeProfile({
      ...this.data.form,
      planStyle: selected.planStyle,
      noBreakfast: this.data.form.breakfastHabit === "skip"
    });
    const workoutPlan = rules.generateWorkoutPlan(profile);
    const mealPlan = rules.generateMealPlan(profile);
    storage.saveProfile(profile);
    storage.saveWorkoutPlan(workoutPlan);
    storage.saveMealPlan(mealPlan);
    
    ui.hideLoading();
    
    if (workoutPlan.warnings && workoutPlan.warnings.length > 0) {
      const warningText = workoutPlan.warnings.join("\n");
      const confirmed = await ui.showConfirm(
        `训练计划已生成，有以下建议：\n\n${warningText}\n\n是否查看并调整计划？`,
        "计划建议"
      );
      if (confirmed) {
        this.setData({ mode: "overview", forceBuilder: false });
        this.load();
      } else {
        this.setData({ mode: "overview", forceBuilder: false });
        this.load();
      }
    } else {
      ui.showSuccess("已生成计划");
      this.setData({ mode: "overview", forceBuilder: false });
      this.load();
    }
  },

  editFlow() {
    this.setData({ mode: "builder", step: 0, showOtherPlans: false, forceBuilder: true });
    this.updateStepMeta(0);
  },

  showOverview() {
    if (!this.data.plan) {
      wx.showToast({ title: "请先生成计划", icon: "none" });
      return;
    }
    this.setData({ mode: "overview", forceBuilder: false });
  },

  adjustPlan() {
    this.openWeekPlan();
  },

  openWeekPlan() {
    if (!this.data.plan) {
      wx.showToast({ title: "请先生成计划", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/weekPlan/weekPlan" });
  },

  openExerciseLibrary() {
    if (!this.data.plan) {
      wx.showToast({ title: "请先生成计划", icon: "none" });
      return;
    }
    const fallback = this.data.plan.days.findIndex((day) => !day.isRestDay);
    const todayWorkout = this.data.plan.days[this.data.todayIndex];
    const dayIndex = todayWorkout && !todayWorkout.isRestDay ? this.data.todayIndex : fallback;
    if (dayIndex < 0) {
      wx.showToast({ title: "请先添加训练日", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/exerciseLibrary/exerciseLibrary?day=${dayIndex}` });
  },

  showWeekPicker() {
    wx.showToast({ title: "当前本地版先支持第 1 周", icon: "none" });
  },

  openWorkout(event) {
    const day = event.currentTarget.dataset.day;
    if (!this.data.plan.days[day]) {
      wx.showToast({ title: "没有找到训练日", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/workout/workout?day=${day}` });
  },

  goStats() {
    wx.switchTab({ url: "/pages/stats/stats" });
  },

  startTodayWorkout() {
    if (!this.data.plan) {
      wx.showToast({ title: "请先生成计划", icon: "none" });
      return;
    }
    const todayWorkout = this.data.plan.days[this.data.todayIndex];
    if (!todayWorkout || todayWorkout.isRestDay) {
      wx.navigateTo({ url: "/pages/checkin/checkin" });
      return;
    }
    if (!todayWorkout.exercises.length) {
      wx.showToast({ title: "今天还没有训练动作", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/session/session?day=${this.data.todayIndex}` });
  },

  startWorkout(event) {
    const day = event.currentTarget.dataset.day;
    const target = this.data.plan.days[day];
    if (!target || target.isRestDay || !target.exercises.length) {
      wx.showToast({ title: "这一天还没有训练动作", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/session/session?day=${day}` });
  },

  toggleRest(event) {
    const dayIndex = Number(event.currentTarget.dataset.day);
    const plan = { ...this.data.plan };
    const day = plan.days[dayIndex];
    if (!day.isRestDay) {
      day.isRestDay = true;
      day.title = "休息";
      day.trainingType = "rest";
      day.exercises = [];
    } else {
      wx.showToast({ title: "请重新生成或进入详情添加动作", icon: "none" });
      return;
    }
    const next = rules.recalculateWorkoutPlan(plan, this.data.profile);
    storage.saveWorkoutPlan(next);
    this.load();
  },

  addTrainingDay() {
    if (!this.data.profile || !this.data.plan) {
      wx.showToast({ title: "请先生成计划", icon: "none" });
      return;
    }
    const restIndex = this.data.plan.days.findIndex((day) => day.isRestDay);
    if (restIndex < 0) {
      wx.showToast({ title: "本周已经排满训练日", icon: "none" });
      return;
    }
    const generated = rules.generateWorkoutPlan({
      ...this.data.profile,
      weeklyDays: 6,
      planStyle: this.data.profile.planStyle || "full_body"
    });
    const source = generated.days.find((day) => !day.isRestDay && day.exercises.length);
    if (!source) {
      wx.showToast({ title: "暂无可添加训练模板", icon: "none" });
      return;
    }
    const plan = {
      ...this.data.plan,
      days: this.data.plan.days.map((day, index) =>
        index === restIndex
          ? {
              ...source,
              id: `day_${index + 1}_${Date.now()}`,
              dayOfWeek: index,
              dayName: day.dayName
            }
          : day
      )
    };
    const next = rules.recalculateWorkoutPlan(plan, this.data.profile);
    storage.saveWorkoutPlan(next);
    this.load();
    wx.showToast({ title: "已添加训练日", icon: "success" });
  },

  savePlan() {
    if (!this.data.plan) {
      wx.showToast({ title: "暂无计划可保存", icon: "none" });
      return;
    }
    storage.saveWorkoutPlan(this.data.plan);
    wx.showToast({ title: "计划已保存", icon: "success" });
  }
});
