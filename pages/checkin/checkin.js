const storage = require("../../utils/storage");
const { todayKey } = require("../../utils/format");
const ui = require("../../utils/ui");

Page({
  data: {
    streak: 0,
    weekDays: [
      { label: "一", done: false },
      { label: "二", done: false },
      { label: "三", done: false },
      { label: "四", done: false },
      { label: "五", done: false },
      { label: "六", done: false },
      { label: "日", done: false }
    ],
    form: {
      date: "",
      weight: "",
      workoutDone: false,
      dietDone: false,
      dietStatus: "达标",
      water: 1500,
      sleepHours: 7,
      mood: "精力充沛",
      fatigueLevel: 2,
      note: ""
    }
  },

  onLoad() {
    const profile = storage.getProfile();
    const today = storage.getTodayCheckin();
    const checkins = storage.getCheckins();
    const latestWeight = this.getLatestWeight(checkins);
    this.setData({
      form: {
        ...this.data.form,
        date: todayKey(),
        weight: latestWeight || (profile ? profile.weight : ""),
        ...today,
        dietStatus: today && today.dietStatus ? today.dietStatus : "达标",
        mood: today && today.mood ? today.mood : "精力充沛"
      },
      streak: this.calculateStreak(checkins),
      weekDays: this.buildWeekDays(checkins)
    });
  },

  getLatestWeight(checkins) {
    for (let index = checkins.length - 1; index >= 0; index -= 1) {
      if (checkins[index].weight !== "" && checkins[index].weight !== undefined && checkins[index].weight !== null) {
        return checkins[index].weight;
      }
    }
    return "";
  },

  goBack() {
    ui.goBack();
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  onSwitch(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  onWaterChange(event) {
    this.setData({ "form.water": event.detail.value });
  },

  setBoolean(event) {
    const field = event.currentTarget.dataset.field;
    const value = event.currentTarget.dataset.value === "true";
    this.setData({ [`form.${field}`]: value });
  },

  setDietStatus(event) {
    const value = event.currentTarget.dataset.value;
    this.setData({ "form.dietStatus": value, "form.dietDone": value === "达标" });
  },

  setMood(event) {
    const value = event.currentTarget.dataset.value;
    this.setData({
      "form.mood": value,
      "form.fatigueLevel": value === "疲劳" ? 4 : value === "一般" ? 2 : 1
    });
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

  buildWeekDays(checkins) {
    const labels = ["一", "二", "三", "四", "五", "六", "日"];
    const dates = new Set(checkins.map((item) => item.date));
    const today = new Date();
    const weekday = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - weekday + 1);
    return labels.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        label,
        done: dates.has(this.dateKey(date))
      };
    });
  },

  dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  submit() {
    const { form } = this.data;
    
    if (form.weight && !ui.validateNumber(form.weight, 30, 200, "体重")) return;
    if (form.water && !ui.validateNumber(form.water, 0, 5000, "饮水量")) return;
    if (form.sleepHours && !ui.validateNumber(form.sleepHours, 0, 24, "睡眠时间")) return;
    
    storage.saveCheckin({
      ...form,
      dietDone: form.dietStatus === "达标"
    });
    ui.showSuccess("已保存");
    setTimeout(() => wx.switchTab({ url: "/pages/home/home" }), 500);
  }
});
