const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const ui = require("../../utils/ui");

const equipmentByLocation = {
  home: [
    { label: "无器械", value: "none" },
    { label: "哑铃", value: "dumbbell" },
    { label: "弹力带", value: "band" },
    { label: "瑜伽垫", value: "mat" }
  ],
  gym: [
    { label: "健身房器械", value: "machine" },
    { label: "哑铃", value: "dumbbell" },
    { label: "杠铃", value: "barbell" },
    { label: "自由重量", value: "free_weight" }
  ],
  outdoor: [
    { label: "跑步", value: "running" },
    { label: "快走", value: "walking" },
    { label: "跳绳", value: "jump_rope" },
    { label: "骑行", value: "cycling" },
    { label: "自重训练", value: "bodyweight" }
  ]
};

const goalLabels = {
  fat_loss: "减脂",
  muscle_gain: "增肌",
  shape: "塑形",
  health: "保持健康"
};

Page({
  data: {
    step: 0,
    maxStep: 6,
    totalSteps: 7,
    stepDisplay: 1,
    progressPercent: 14,
    stepTitles: ["基础信息", "健身目标", "训练条件", "频率时间", "训练偏好", "饮食习惯", "推荐方案"],
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
      { label: "男", value: "male" },
      { label: "女", value: "female" }
    ],
    goalOptions: [
      { label: "减脂", value: "fat_loss", desc: "力量 + 有氧 + 热量缺口" },
      { label: "增肌", value: "muscle_gain", desc: "力量训练 + 热量盈余" },
      { label: "塑形", value: "shape", desc: "轻力量 + 适量有氧" },
      { label: "保持健康", value: "health", desc: "低强度运动 + 均衡饮食" }
    ],
    levelOptions: [
      { label: "新手", value: "beginner" },
      { label: "初级", value: "novice" },
      { label: "中级", value: "intermediate" },
      { label: "高级", value: "advanced" }
    ],
    locationOptions: [
      { label: "居家", value: "home" },
      { label: "健身房", value: "gym" },
      { label: "户外", value: "outdoor" }
    ],
    equipmentOptions: equipmentByLocation.home,
    weeklyOptions: [2, 3, 4, 5, 6],
    minuteOptions: [15, 30, 45, 60],
    preferenceOptions: [
      { label: "系统推荐", value: "auto", desc: "根据目标和条件自动选择" },
      { label: "每天练一个部位", value: "split", desc: "适合健身房和增肌训练" },
      { label: "每天全身都练一点", value: "full_body", desc: "适合新手和时间不固定的人" },
      { label: "简单力量 + 有氧", value: "strength_cardio", desc: "适合减脂和提高执行率" },
      { label: "以有氧燃脂为主", value: "cardio_focus", desc: "适合喜欢跑步、快走、骑行的人" },
      { label: "轻量塑形，不想太累", value: "light_shape", desc: "适合低压力塑形和保持习惯" }
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
    otherPlans: [],
    showOtherPlans: false,
    risks: []
  },

  onLoad() {
    const profile = storage.getProfile();
    if (profile) {
      const form = { ...this.data.form, ...profile };
      this.setData({
        form,
        equipmentOptions: equipmentByLocation[form.location] || equipmentByLocation.home
      });
    }
    this.updateStepMeta(this.data.step);
    this.updateRisk();
    this.updateSelectionMaps();
    this.refreshRecommendation();
  },

  goBack() {
    ui.goBack();
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
    if (field === "avoidFoods") this.updateSelectionMaps();
    this.updateRisk();
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
    this.setData({
      recommendation: selected,
      recommendationGoalLabel: goalLabels[selected.goal] || "保持健康",
      otherPlans: options.filter((item) => item.planStyle !== selected.planStyle)
    });
  },

  updateStepMeta(step) {
    this.setData({
      stepDisplay: step + 1,
      progressPercent: Math.round(((step + 1) * 100) / (this.data.maxStep + 1))
    });
  },

  next() {
    if (this.data.step === 5) this.refreshRecommendation();
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

  async submit() {
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
        `训练计划已生成，有以下建议：\n\n${warningText}\n\n是否继续？`,
        "计划建议"
      );
      wx.switchTab({ url: "/pages/home/home" });
    } else {
      ui.showSuccess("已生成计划");
      setTimeout(() => wx.switchTab({ url: "/pages/home/home" }), 500);
    }
  }
});
