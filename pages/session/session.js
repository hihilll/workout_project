const storage = require("../../utils/storage");
const { todayKey } = require("../../utils/format");
const ui = require("../../utils/ui");

Page({
  data: {
    dayIndex: 0,
    profile: null,
    plan: null,
    day: null,
    currentIndex: 0,
    current: null,
    sessionExercises: [],
    warmupCount: 0,
    formalCount: 0,
    stretchCount: 0,
    completedMap: {},
    setItems: [],
    progress: 0,
    completedSets: 0,
    totalSets: 0,
    restLeft: 0,
    restPercent: 0,
    restTotal: 0,
    elapsedTime: "00:00",
    warmupProgress: 0,
    formalProgress: 0,
    stretchProgress: 0
  },

  timer: null,
  restTimer: null,
  startTime: null,
  elapsedTimer: null,

  onLoad(query) {
    this.setData({ dayIndex: Number(query.day || 0) });
  },

  goBack() {
    ui.goBack("/pages/plan/plan");
  },

  onShow() {
    const profile = storage.getProfile();
    const plan = storage.getWorkoutPlan();
    const day = plan ? plan.days[this.data.dayIndex] : null;
    const sessionExercises = day
      ? this.buildSessionExercises(day.warmups || [], day.exercises || [], day.stretches || [], {})
      : [];
    const totalSets = sessionExercises.reduce((sum, item) => sum + Number(item.sets || 0), 0);

    this.setData({
      profile,
      plan,
      day,
      currentIndex: 0,
      current: sessionExercises[0] || null,
      sessionExercises,
      warmupCount: day ? (day.warmups || []).length : 0,
      formalCount: day ? (day.exercises || []).length : 0,
      stretchCount: day ? (day.stretches || []).length : 0,
      totalSets,
      completedSets: 0
    });

    this.syncSetItems();
    this.startElapsedTimer();
  },

  onUnload() {
    this.clearTimer();
    this.clearElapsedTimer();
  },

  startElapsedTimer() {
    this.startTime = Date.now();
    this.elapsedTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.setData({
        elapsedTime: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      });
    }, 1000);
  },

  clearElapsedTimer() {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
  },

  syncSetItems() {
    const current = this.data.current;
    if (!current) return;
    const done = this.data.completedMap[current.id] || 0;
    const setItems = Array.from({ length: Number(current.sets || 0) }).map((_, index) => ({
      index,
      done: index < done,
      justCompleted: index === done - 1
    }));

    const sessionExercises = this.buildSessionExercises(
      this.data.day.warmups || [],
      this.data.day.exercises || [],
      this.data.day.stretches || [],
      this.data.completedMap
    );

    const completedSets = Object.keys(this.data.completedMap).reduce(
      (sum, key) => sum + Number(this.data.completedMap[key] || 0), 0
    );

    this.setData({ setItems, sessionExercises, completedSets });
    this.updateProgress();
    this.updatePhaseProgress();
  },

  buildSessionExercises(warmups, exercises, stretches, completedMap) {
    const warmupItems = (warmups || []).map((item) => ({
      ...item,
      phaseLabel: "热身",
      isWarmup: true,
      completedSets: completedMap[item.id] || 0
    }));
    const formalItems = (exercises || []).map((item) => ({
      ...item,
      phaseLabel: "正式训练",
      completedSets: completedMap[item.id] || 0
    }));
    const stretchItems = (stretches || []).map((item) => ({
      ...item,
      phaseLabel: "拉伸",
      isStretch: true,
      completedSets: completedMap[item.id] || 0
    }));
    return [...warmupItems, ...formalItems, ...stretchItems];
  },

  updateProgress() {
    const total = this.data.totalSets;
    const done = this.data.completedSets;
    this.setData({ progress: total ? Math.round((done / total) * 100) : 0 });
  },

  updatePhaseProgress() {
    const { sessionExercises, warmupCount, formalCount, stretchCount } = this.data;
    const warmupExercises = sessionExercises.filter((e) => e.isWarmup);
    const formalExercises = sessionExercises.filter((e) => !e.isWarmup && !e.isStretch);
    const stretchExercises = sessionExercises.filter((e) => e.isStretch);

    const warmupTotal = warmupExercises.reduce((sum, e) => sum + Number(e.sets || 0), 0);
    const warmupDone = warmupExercises.reduce((sum, e) => sum + Number(e.completedSets || 0), 0);

    const formalTotal = formalExercises.reduce((sum, e) => sum + Number(e.sets || 0), 0);
    const formalDone = formalExercises.reduce((sum, e) => sum + Number(e.completedSets || 0), 0);

    const stretchTotal = stretchExercises.reduce((sum, e) => sum + Number(e.sets || 0), 0);
    const stretchDone = stretchExercises.reduce((sum, e) => sum + Number(e.completedSets || 0), 0);

    this.setData({
      warmupProgress: warmupTotal ? Math.round((warmupDone / warmupTotal) * 100) : 0,
      formalProgress: formalTotal ? Math.round((formalDone / formalTotal) * 100) : 0,
      stretchProgress: stretchTotal ? Math.round((stretchDone / stretchTotal) * 100) : 0
    });
  },

  toggleSet(event) {
    const setIndex = Number(event.currentTarget.dataset.index);
    const current = this.data.current;
    const completedMap = { ...this.data.completedMap };
    const currentDone = completedMap[current.id] || 0;

    if (setIndex + 1 === currentDone) {
      completedMap[current.id] = setIndex;
    } else {
      completedMap[current.id] = setIndex + 1;
    }

    this.setData({ completedMap });

    if (setIndex + 1 > currentDone) {
      const restSeconds = current.restSeconds === 0 ? 0 : Number(current.restSeconds || 60);
      if (restSeconds > 0) {
        this.startRest(restSeconds);
      }
    } else {
      this.clearRestTimer();
      this.setData({ restLeft: 0, restPercent: 0 });
    }

    this.syncSetItems();
  },

  startRest(seconds) {
    this.clearRestTimer();
    const restTotal = Math.min(seconds, 120);
    this.setData({ restLeft: restTotal, restTotal, restPercent: 100 });

    this.restTimer = setInterval(() => {
      const next = this.data.restLeft - 1;
      if (next <= 0) {
        this.clearRestTimer();
        this.setData({ restLeft: 0, restPercent: 0 });
      } else {
        const percent = Math.round((next / restTotal) * 100);
        this.setData({ restLeft: next, restPercent: percent });
      }
    }, 1000);
  },

  skipRest() {
    this.clearRestTimer();
    this.setData({ restLeft: 0, restPercent: 0 });
  },

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  clearRestTimer() {
    if (this.restTimer) {
      clearInterval(this.restTimer);
      this.restTimer = null;
    }
  },

  jumpExercise(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.setCurrent(index);
  },

  prevExercise() {
    this.setCurrent(Math.max(0, this.data.currentIndex - 1));
  },

  nextExercise() {
    this.setCurrent(Math.min(this.data.sessionExercises.length - 1, this.data.currentIndex + 1));
  },

  setCurrent(index) {
    this.clearRestTimer();
    this.setData({
      currentIndex: index,
      current: this.data.sessionExercises[index],
      restLeft: 0,
      restPercent: 0
    });
    this.syncSetItems();
  },

  finishWorkout() {
    const day = this.data.day;
    const sessionExercises = this.data.sessionExercises;
    const totalSets = sessionExercises.reduce((sum, item) => sum + Number(item.sets || 0), 0);
    const completedSets = Object.keys(this.data.completedMap).reduce(
      (sum, key) => sum + Number(this.data.completedMap[key] || 0), 0
    );

    const elapsed = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    storage.saveWorkoutLog({
      date: todayKey(),
      dayTitle: day.title,
      dayOfWeek: day.dayOfWeek,
      totalSets,
      completedSets,
      completionRate: totalSets ? Math.round((completedSets / totalSets) * 100) : 0,
      duration: elapsed,
      durationText: `${minutes}分${seconds}秒`,
      warmups: (day.warmups || []).map((item) => ({
        exerciseId: item.exerciseId,
        exerciseName: item.exerciseName,
        sets: item.sets,
        completedSets: this.data.completedMap[item.id] || 0
      })),
      exercises: (day.exercises || []).map((item) => ({
        exerciseId: item.exerciseId,
        exerciseName: item.exerciseName,
        sets: item.sets,
        completedSets: this.data.completedMap[item.id] || 0
      })),
      stretches: (day.stretches || []).map((item) => ({
        exerciseId: item.exerciseId,
        exerciseName: item.exerciseName,
        sets: item.sets,
        completedSets: this.data.completedMap[item.id] || 0
      }))
    });

    this.clearElapsedTimer();
    this.showCompletionSummary(totalSets, completedSets, elapsed);
  },

  showCompletionSummary(totalSets, completedSets, elapsed) {
    const rate = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    wx.showModal({
      title: "训练完成！",
      content: `完成 ${completedSets}/${totalSets} 组\n用时 ${minutes}分${seconds}秒\n完成率 ${rate}%`,
      showCancel: false,
      confirmText: "好的",
      success: () => {
        wx.navigateBack();
      }
    });
  }
});
