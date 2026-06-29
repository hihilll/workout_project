const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const ui = require("../../utils/ui");

const dayTypeOptions = [
  { label: "全身 A", value: "full_body_a" },
  { label: "全身 B", value: "full_body_b" },
  { label: "上肢", value: "upper" },
  { label: "上肢推", value: "upper_push" },
  { label: "上肢拉", value: "upper_pull" },
  { label: "下肢", value: "lower" },
  { label: "下肢核心", value: "lower_core" },
  { label: "胸部", value: "chest" },
  { label: "背部", value: "back" },
  { label: "腿部", value: "legs" },
  { label: "肩部", value: "shoulders" },
  { label: "手臂核心", value: "arms_core" },
  { label: "有氧", value: "cardio" },
  { label: "有氧核心", value: "cardio_core" }
];

Page({
  data: {
    dayIndex: 0,
    profile: null,
    plan: null,
    day: null,
    dayDraftTitle: "",
    dayTypeOptions,
    dragIndex: -1,
    dragStartY: 0,
    totalSets: 0
  },

  onLoad(query) {
    this.setData({
      dayIndex: Number(query.day || 0)
    });
  },

  goBack() {
    ui.goBack("/pages/plan/plan");
  },

  onShow() {
    this.load();
  },

  load() {
    const profile = storage.getProfile();
    const plan = storage.getWorkoutPlan();
    const day = plan ? this.normalizeDay(plan.days[this.data.dayIndex]) : null;
    const totalSets = day ? day.exercises.reduce((sum, ex) => sum + Number(ex.sets || 0), 0) : 0;
    this.setData({
      profile,
      plan,
      day,
      dayDraftTitle: day ? day.title : "",
      totalSets
    });
  },

  persist(plan) {
    const next = rules.recalculateWorkoutPlan(plan, this.data.profile);
    storage.saveWorkoutPlan(next);
    const day = this.normalizeDay(next.days[this.data.dayIndex]);
    const totalSets = day ? day.exercises.reduce((sum, ex) => sum + Number(ex.sets || 0), 0) : 0;
    this.setData({
      plan: next,
      day,
      dayDraftTitle: next.days[this.data.dayIndex] ? next.days[this.data.dayIndex].title : "",
      totalSets
    });
  },

  normalizeDay(day) {
    if (!day) return null;
    return {
      ...day,
      warmups: day.warmups || [],
      stretches: day.stretches || [],
      exercises: day.exercises || []
    };
  },

  updateExercise(event) {
    const index = Number(event.currentTarget.dataset.index);
    const field = event.currentTarget.dataset.field;
    const plan = { ...this.data.plan };
    plan.days[this.data.dayIndex].exercises[index][field] = event.detail.value;
    this.persist(plan);
  },

  updateDayTitle(event) {
    const title = String(event.detail.value || "").trim();
    this.setData({ dayDraftTitle: event.detail.value });
    if (!title || !this.data.plan) {
      this.setData({ dayDraftTitle: this.data.day ? this.data.day.title : "" });
      if (!title) wx.showToast({ title: "名称不能为空", icon: "none" });
      return;
    }
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.days[this.data.dayIndex].title = title;
    this.persist(plan);
  },

  replaceDayType(event) {
    const type = event.currentTarget.dataset.type;
    if (!this.data.plan || !this.data.profile) return;
    const current = this.data.day;
    wx.showModal({
      title: "替换训练日",
      content: "会用新模板替换当天动作，已编辑的当天动作将被覆盖。",
      confirmText: "替换",
      success: (res) => {
        if (!res.confirm) return;
        const plan = JSON.parse(JSON.stringify(this.data.plan));
        plan.days[this.data.dayIndex] = rules.buildWorkoutDayFromType(this.data.dayIndex, type, this.data.profile, {
          id: current.id,
          title: rules.buildWorkoutDayFromType(this.data.dayIndex, type, this.data.profile).title
        });
        this.persist(plan);
        wx.showToast({ title: "已替换训练日", icon: "success" });
      }
    });
  },

  setRestDay() {
    if (!this.data.plan || !this.data.profile) return;
    const current = this.data.day;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.days[this.data.dayIndex] = rules.buildWorkoutDayFromType(this.data.dayIndex, "rest", this.data.profile, {
      id: current.id
    });
    this.persist(plan);
    wx.showToast({ title: "已设为休息日", icon: "success" });
  },

  restoreTrainingDay() {
    if (!this.data.plan || !this.data.profile) return;
    const current = this.data.day;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.days[this.data.dayIndex] = rules.buildWorkoutDayFromType(this.data.dayIndex, "full_body_a", this.data.profile, {
      id: current.id
    });
    this.persist(plan);
    wx.showToast({ title: "已恢复训练日", icon: "success" });
  },

  removeExercise(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.removeExerciseAt(index);
  },

  removeExerciseAt(index) {
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    plan.days[this.data.dayIndex].exercises.splice(index, 1);
    this.persist(plan);
  },

  removeWarmup(event) {
    const index = Number(event.currentTarget.dataset.index);
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const warmups = plan.days[this.data.dayIndex].warmups || [];
    warmups.splice(index, 1);
    plan.days[this.data.dayIndex].warmups = warmups;
    this.persist(plan);
  },

  removeStretch(event) {
    const index = Number(event.currentTarget.dataset.index);
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const stretches = plan.days[this.data.dayIndex].stretches || [];
    stretches.splice(index, 1);
    plan.days[this.data.dayIndex].stretches = stretches;
    this.persist(plan);
  },

  startExerciseDrag(event) {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    this.setData({
      dragIndex: Number(event.currentTarget.dataset.index),
      dragStartY: touch.clientY
    });
  },

  moveExerciseDrag(event) {
    const touch = event.touches && event.touches[0];
    const dragIndex = this.data.dragIndex;
    const exercises = this.data.day ? this.data.day.exercises || [] : [];
    if (!touch || dragIndex < 0 || exercises.length < 2) return;
    const delta = touch.clientY - this.data.dragStartY;
    if (Math.abs(delta) < 54) return;
    const targetIndex = dragIndex + (delta > 0 ? 1 : -1);
    if (targetIndex < 0 || targetIndex >= exercises.length) return;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const nextExercises = plan.days[this.data.dayIndex].exercises;
    const [item] = nextExercises.splice(dragIndex, 1);
    nextExercises.splice(targetIndex, 0, item);
    nextExercises.forEach((exercise, order) => {
      exercise.sortOrder = order + 1;
    });
    this.setData({
      plan,
      day: this.normalizeDay(plan.days[this.data.dayIndex]),
      dragIndex: targetIndex,
      dragStartY: touch.clientY
    });
  },

  endExerciseDrag() {
    if (this.data.dragIndex < 0) return;
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    this.setData({ dragIndex: -1, dragStartY: 0 });
    this.persist(plan);
  },

  openExerciseMenu(event) {
    const index = Number(event.currentTarget.dataset.index);
    wx.showActionSheet({
      itemList: ["替换动作", "删除动作"],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.replaceExerciseAt(index);
          return;
        }
        wx.showModal({
          title: "删除动作",
          content: "确认从今日训练中删除这个动作吗？",
          confirmText: "删除",
          confirmColor: "#8b3227",
          success: (modalRes) => {
            if (modalRes.confirm) this.removeExerciseAt(index);
          }
        });
      }
    });
  },

  replaceExercise(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.replaceExerciseAt(index);
  },

  replaceExerciseAt(index) {
    const current = this.data.day.exercises[index];
    const alternatives = rules.getExerciseAlternatives(current.exerciseId, this.data.profile);
    if (!alternatives.length) {
      wx.showToast({ title: "暂无可替换动作", icon: "none" });
      return;
    }
    wx.showActionSheet({
      itemList: alternatives.slice(0, 6).map((item) => item.name),
      success: (res) => {
        const selected = alternatives[res.tapIndex];
        const plan = { ...this.data.plan };
        plan.days[this.data.dayIndex].exercises[index] = {
          ...current,
          exerciseId: selected.id,
          exerciseName: selected.name,
          type: selected.type,
          muscleGroups: selected.muscleGroups,
          sets: selected.defaultSets,
          reps: selected.defaultReps,
          restSeconds: selected.defaultRest,
          instruction: selected.instruction
        };
        this.persist(plan);
      }
    });
  },

  openExercisePicker() {
    if (!this.data.day) {
      wx.showToast({ title: "没有找到训练日", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/exerciseLibrary/exerciseLibrary?day=${this.data.dayIndex}` });
  },

  startWorkout() {
    if (!this.data.day || this.data.day.isRestDay || !this.data.day.exercises.length) {
      wx.showToast({ title: "这一天还没有训练动作", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/session/session?day=${this.data.dayIndex}` });
  }
});
