const storage = require("../../utils/storage");
const rules = require("../../utils/rules");
const { exercises } = require("../../data/exercises");
const ui = require("../../utils/ui");

const categoryFilters = [
  { label: "全部", value: "all" },
  { label: "胸部", value: "chest" },
  { label: "背部", value: "back" },
  { label: "腿部", value: "legs" },
  { label: "肩部", value: "shoulders" },
  { label: "手臂", value: "arms" },
  { label: "核心", value: "core" },
  { label: "臀部", value: "glutes" },
  { label: "有氧", value: "cardio" },
  { label: "拉伸", value: "stretch" }
];

const equipmentFilters = [
  { label: "全部器械", value: "all" },
  { label: "无器械", value: "none" },
  { label: "哑铃", value: "dumbbell" },
  { label: "杠铃", value: "barbell" },
  { label: "弹力带", value: "band" },
  { label: "健身房器械", value: "machine" }
];

const typeLabels = {
  stretch: "拉伸",
  lower: "下肢",
  push: "推类",
  pull: "拉类",
  core: "核心",
  cardio: "有氧"
};

Page({
  data: {
    dayIndex: -1,
    profile: null,
    plan: null,
    day: null,
    query: "",
    categoryFilter: "all",
    equipmentFilter: "all",
    categoryFilters,
    equipmentFilters,
    favoriteOnly: false,
    favoriteExerciseIds: [],
    library: [],
    resultCount: 0,
    titleText: "动作库",
    subtitleText: "浏览和筛选训练动作"
  },

  onLoad(query) {
    const dayIndex = query.day === undefined ? -1 : Number(query.day);
    this.setData({
      dayIndex,
      favoriteOnly: query.favorites === "1"
    });
  },

  onShow() {
    const profile = storage.getProfile();
    const plan = storage.getWorkoutPlan();
    const day = plan && this.data.dayIndex >= 0 ? plan.days[this.data.dayIndex] : null;
    this.setData({
      profile,
      plan,
      day,
      favoriteExerciseIds: storage.getFavoriteExercises(),
      titleText: this.data.favoriteOnly ? "收藏动作" : "动作库",
      subtitleText: day ? `选择动作加入${day.dayName}训练` : "浏览和筛选训练动作"
    });
    this.refreshLibrary();
  },

  goBack() {
    ui.goBack("/pages/plan/plan");
  },

  onSearch(event) {
    this.setData({ query: event.detail.value });
    this.refreshLibrary();
  },

  setCategory(event) {
    this.setData({ categoryFilter: event.currentTarget.dataset.value });
    this.refreshLibrary();
  },

  setEquipment(event) {
    this.setData({ equipmentFilter: event.currentTarget.dataset.value });
    this.refreshLibrary();
  },

  toggleFavoriteOnly() {
    this.setData({
      favoriteOnly: !this.data.favoriteOnly,
      titleText: this.data.favoriteOnly ? "动作库" : "收藏动作"
    });
    this.refreshLibrary();
  },

  toggleFavorite(event) {
    const exerciseId = event.currentTarget.dataset.id;
    this.setData({ favoriteExerciseIds: storage.toggleFavoriteExercise(exerciseId) });
    this.refreshLibrary();
  },

  matchesCategory(exercise) {
    const category = this.data.categoryFilter;
    if (exercise.type === "warmup") return false;
    if (category === "all") return true;
    if (category === "stretch") return exercise.phase === "stretch";
    if (category === "cardio") return exercise.phase === "cardio";
    if (category === "arms") {
      return (exercise.muscleGroups || []).some((group) => group === "biceps" || group === "triceps");
    }
    return (exercise.muscleGroups || []).includes(category);
  },

  matchesEquipment(exercise) {
    return this.data.equipmentFilter === "all" || (exercise.equipment || []).includes(this.data.equipmentFilter);
  },

  isExerciseMatched(exercise) {
    const profile = this.data.profile || {};
    if (!profile.location || !profile.level || !profile.goal) return true;
    const equipmentOk =
      (exercise.equipment || []).includes(profile.equipment) ||
      (exercise.equipment || []).includes("none") ||
      (profile.location === "gym" && (exercise.equipment || []).includes("machine"));
    const injuryOk = !(exercise.avoidIf || []).some((tag) => (profile.injuries || []).includes(tag));
    return (
      (exercise.locations || []).includes(profile.location) &&
      equipmentOk &&
      (exercise.levels || []).includes(profile.level) &&
      (exercise.goals || []).includes(profile.goal) &&
      injuryOk
    );
  },

  refreshLibrary() {
    const favoriteIds = new Set(this.data.favoriteExerciseIds || []);
    const selectedIds = new Set(
      this.data.day
        ? [...(this.data.day.warmups || []), ...(this.data.day.exercises || []), ...(this.data.day.stretches || [])].map(
            (item) => item.exerciseId
          )
        : []
    );
    const query = String(this.data.query || "").trim().toLowerCase();
    const library = exercises
      .filter((item) => this.matchesCategory(item))
      .filter((item) => this.matchesEquipment(item))
      .map((item) => {
        const injuryConflict = (item.avoidIf || []).some((tag) => ((this.data.profile || {}).injuries || []).includes(tag));
        const match = this.isExerciseMatched(item);
        return {
          ...item,
          typeLabel: typeLabels[item.type] || "训练",
          muscleText: (item.muscleGroups || []).map((group) => rules.muscleNames[group] || group).join(" / "),
          equipmentText: (item.equipment || []).map((equipment) => rules.equipmentLabels[equipment] || equipment).join(" / "),
          desc:
            item.type === "stretch"
              ? `${item.defaultReps} · 训练后放松`
              : `${item.defaultSets}组 × ${item.defaultReps}${item.defaultRest ? ` · 休息${item.defaultRest}秒` : ""}`,
          favorite: favoriteIds.has(item.id),
          joined: selectedIds.has(item.id),
          match,
          injuryConflict,
          matchText: injuryConflict ? "不建议使用" : match ? "适合当前档案" : "需确认条件"
        };
      })
      .filter((item) => !this.data.favoriteOnly || item.favorite)
      .filter(
        (item) =>
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.muscleText.toLowerCase().includes(query) ||
          item.equipmentText.toLowerCase().includes(query)
      )
      .sort((a, b) => Number(b.match) - Number(a.match) || Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name));
    this.setData({ library, resultCount: library.length });
  },

  selectExercise(event) {
    const exerciseId = event.currentTarget.dataset.id;
    const selected = exercises.find((item) => item.id === exerciseId);
    if (!selected) return;
    if (!this.data.day || !this.data.plan || this.data.dayIndex < 0) {
      wx.showModal({
        title: selected.name,
        content: selected.instruction,
        showCancel: false,
        confirmText: "知道了"
      });
      return;
    }
    const injuryConflict = (selected.avoidIf || []).some((tag) => ((this.data.profile || {}).injuries || []).includes(tag));
    if (injuryConflict) {
      wx.showToast({ title: "该动作不适合当前伤病情况", icon: "none" });
      return;
    }
    const currentExercises = [
      ...(this.data.day.warmups || []),
      ...(this.data.day.exercises || []),
      ...(this.data.day.stretches || [])
    ];
    if (currentExercises.some((item) => item.exerciseId === selected.id)) {
      wx.showToast({ title: "该动作已在当天计划中", icon: "none" });
      return;
    }
    const plan = JSON.parse(JSON.stringify(this.data.plan));
    const day = plan.days[this.data.dayIndex];
    if (day.isRestDay) {
      day.isRestDay = false;
      day.title = "自定义训练";
      day.trainingType = "custom";
    }
    const targetList = selected.type === "stretch" ? "stretches" : "exercises";
    day[targetList] = day[targetList] || [];
    day[targetList].push({
      id: `custom_${selected.id}_${Date.now()}`,
      exerciseId: selected.id,
      exerciseName: selected.name,
      type: selected.type,
      muscleGroups: selected.muscleGroups,
      sets: selected.defaultSets,
      reps: selected.defaultReps,
      weight: "",
      restSeconds: selected.defaultRest,
      instruction: selected.instruction,
      sortOrder: day[targetList].length + 1,
      isStretch: selected.type === "stretch",
      isCustom: true
    });
    const next = rules.recalculateWorkoutPlan(plan, this.data.profile || {});
    storage.saveWorkoutPlan(next);
    this.setData({ plan: next, day: next.days[this.data.dayIndex] });
    this.refreshLibrary();
    wx.showToast({ title: "已加入当天训练", icon: "success" });
  }
});
