App({
  globalData: {
    appName: "FitPlan"
  },
  onLaunch() {
    const profile = wx.getStorageSync("user_profile");
    if (!profile) {
      wx.setStorageSync("app_initialized_at", Date.now());
    }
  }
});
