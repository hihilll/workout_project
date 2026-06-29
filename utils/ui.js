function showToast(title, icon = "none", duration = 1500) {
  wx.showToast({
    title,
    icon,
    duration
  });
}

function showSuccess(title) {
  showToast(title, "success");
}

function showError(title) {
  showToast(title, "error");
}

function showLoading(title = "加载中...") {
  wx.showLoading({
    title,
    mask: true
  });
}

function hideLoading() {
  wx.hideLoading();
}

function showConfirm(content, title = "提示") {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        resolve(res.confirm);
      },
      fail() {
        resolve(false);
      }
    });
  });
}

function validateNumber(value, min, max, fieldName) {
  const num = Number(value);
  if (isNaN(num)) {
    showError(`${fieldName}必须是数字`);
    return false;
  }
  if (num < min || num > max) {
    showError(`${fieldName}应在${min}-${max}之间`);
    return false;
  }
  return true;
}

function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    showError(`请填写${fieldName}`);
    return false;
  }
  return true;
}

function goBack(defaultUrl = "/pages/home/home") {
  if (getCurrentPages().length > 1) {
    wx.navigateBack();
  } else {
    wx.switchTab({ url: defaultUrl });
  }
}

module.exports = {
  showToast,
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  showConfirm,
  validateNumber,
  validateRequired,
  goBack
};
