const moment = require("moment");

const getBreakTime = (
  clockInTime,
  clockOutTime,
  breakStartTime,
  breakEndTime
) => {
  clockInTime = moment(clockInTime.format("HH:mm"), "HH:mm");
  clockOutTime = moment(clockOutTime.format("HH:mm"), "HH:mm");
  breakStartTime = moment(breakStartTime.format("HH:mm"), "HH:mm");
  breakEndTime = moment(breakEndTime.format("HH:mm"), "HH:mm");

  let breakTime;
  if (clockInTime - breakStartTime < 0 && clockOutTime - breakEndTime > 0) {
    breakTime = 1.5;
  }
  // 考慮午休完再打卡上班
  else if (clockInTime - breakEndTime > 0) {
    breakTime = 0;
  }
  // 考慮午休前打卡下班
  else if (breakEndTime - clockOutTime > 0) {
    breakTime = 0;
  }
  // 考慮上班在午休開始後跟下班在午休結束後
  else if (
    clockInTime - breakStartTime > 0 &&
    clockOutTime - breakEndTime > 0
  ) {
    breakTime = breakEndTime.diff(clockInTime, "minutes") / 60;
  }
  // 考慮上班在午休開始前跟下班在午休結束前
  else if (
    clockInTime - breakStartTime < 0 &&
    clockOutTime - breakEndTime < 0
  ) {
    breakTime = clockOutTime.diff(breakStartTime, "minutes") / 60;
  }
  // 考慮上班在午休開始後跟下班在午休結束前
  else if (
    clockInTime - breakStartTime > 0 &&
    clockOutTime - breakEndTime < 0
  ) {
    breakTime = clockOutTime.diff(clockInTime, "minutes") / 60;
  }
  return breakTime;
};

const getTotalWorkTime = (
  clockInTime,
  clockOutTime,
  breakStartTime,
  breakEndTime
) => {
  clockInTime = moment(clockInTime.format("HH:mm"), "HH:mm");
  clockOutTime = moment(clockOutTime.format("HH:mm"), "HH:mm");
  breakStartTime = moment(breakStartTime.format("HH:mm"), "HH:mm");
  breakEndTime = moment(breakEndTime.format("HH:mm"), "HH:mm");
  let totalWorkTime;
  // 考慮上班在午休開始前跟下班在午休結束後
  if (clockInTime - breakStartTime < 0 && clockOutTime - breakEndTime > 0) {
    totalWorkTime = (clockOutTime.diff(clockInTime, "minutes") - 90) / 60;
  }
  // 考慮上班在午休開始後跟下班在午休結束後
  else if (
    clockInTime - breakStartTime > 0 &&
    clockOutTime - breakEndTime > 0
  ) {
    totalWorkTime = clockOutTime.diff(clockInTime, "minutes") / 60;
  }
  // 考慮上班在午休開始前跟下班在午休結束前
  else if (
    clockInTime - breakStartTime < 0 &&
    clockOutTime - breakEndTime < 0
  ) {
    // 午休前走
    if (clockOutTime - breakStartTime < 0) {
      totalWorkTime = clockOutTime.diff(clockInTime, "minutes") / 60;
    } 
    // 午休時走
    else {
      totalWorkTime = breakStartTime.diff(clockInTime, "minutes") / 60;
    }
  }
  // 考慮上班在午休開始後跟下班在午休結束前
  else if (
    clockInTime - breakStartTime > 0 &&
    clockOutTime - breakEndTime < 0
  ) {
    totalWorkTime = 0;
  }
  return totalWorkTime;
};

module.exports = { getBreakTime, getTotalWorkTime };
