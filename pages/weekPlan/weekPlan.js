const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const { clamp, weekdayIndex } = require("../../utils/format");
const ui = require("../../utils/ui");

Page({
  data: {
    profile: null,
    plan: null,
    todayIndex: 0,
    trainingDays: 0,
    restDays: 7,
    exerciseCount: 0,
    totalSets: 0,
    sessionMinutes: 0
  },

  onShow() {
    this.load();
  },

  load() {
    const profile = storage.getProfile();
    const rawPlan = storage.getWorkoutPlan();
    const plan = rawPlan && Array.isArray(rawPlan.days) ? this.decoratePlan(rawPlan) : null;
    const trainingDays = plan ? plan.days.filter((day) => !day.isRestDay).length : 0;
    this.setData({
      profile,
      plan,
      todayIndex: weekdayIndex(),
      trainingDays,
      restDays: plan ? 7 - trainingDays : 7,
      exerciseCount: plan ? plan.days.reduce((sum, day) => sum + day.exercises.length, 0) : 0,
      totalSets: plan ? plan.days.reduce((sum, day) => sum + day.totalSets, 0) : 0,
      sessionMinutes: plan ? plan.sessionMinutes : 0
    });
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
          toggleText: day.isRestDay ? "-" : "休息"
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
    if (title.includes("核心") || title.includes("手臂")) return "力";
    return "练";
  },

  goBack() {
    ui.goBack("/pages/plan/plan");
  },

  openWorkout(event) {
    const day = Number(event.currentTarget.dataset.day);
    if (!this.data.plan || !this.data.plan.days[day]) {
      wx.showToast({ title: "没有找到训练日", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/workout/workout?day=${day}` });
  },

  startWorkout(event) {
    const day = Number(event.currentTarget.dataset.day);
    const target = this.data.plan && this.data.plan.days[day];
    if (!target || target.isRestDay || !target.exercises.length) {
      wx.showToast({ title: "这一天还没有训练动作", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/session/session?day=${day}` });
  },

  toggleRest(event) {
    const dayIndex = Number(event.currentTarget.dataset.day);
    if (!this.data.plan) return;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const day = plan.days[dayIndex];
    if (!day || day.isRestDay) {
      wx.showToast({ title: "休息日可进入详情添加动作", icon: "none" });
      return;
    }
    day.isRestDay = true;
    day.title = "休息";
    day.trainingType = "rest";
    day.exercises = [];
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
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.days[restIndex] = {
      ...source,
      id: `day_${restIndex + 1}_${Date.now()}`,
      dayOfWeek: restIndex,
      dayName: plan.days[restIndex].dayName
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