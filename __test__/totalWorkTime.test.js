const { getTotalWorkTime } = require("../lib/getDiffTime");
const moment = require("moment");

test("狀況一上班在午休開始前，下班在午休結束後", () => {
  const clockInTime = moment("8:00", "HH:mm");
  const clockOutTime = moment("18:00", "HH:mm");
  const breakStartTime = moment("12:00", "HH:mm");
  const breakEndTime = moment("13:30", "HH:mm");
  expect(
    getTotalWorkTime(clockInTime, clockOutTime, breakStartTime, breakEndTime)
  ).toBe(8.5);
});

test("狀況二午休時打上下班卡", () => {
  const clockInTime = moment("12:01", "HH:mm");
  const clockOutTime = moment("13:20", "HH:mm");
  const breakStartTime = moment("12:00", "HH:mm");
  const breakEndTime = moment("13:30", "HH:mm");
  expect(
    getTotalWorkTime(clockInTime, clockOutTime, breakStartTime, breakEndTime)
  ).toBe(0);
});

test("狀況三之一，午休時打卡下班", () => {
  const clockInTime = moment("8:00", "HH:mm");
  const clockOutTime = moment("13:20", "HH:mm");
  const breakStartTime = moment("12:00", "HH:mm");
  const breakEndTime = moment("13:30", "HH:mm");
  expect(
    getTotalWorkTime(clockInTime, clockOutTime, breakStartTime, breakEndTime)
  ).toBe(4);
});

test("狀況三之二，午休開始前打卡下班", () => {
  const clockInTime = moment("8:00", "HH:mm");
  const clockOutTime = moment("11:30", "HH:mm");
  const breakStartTime = moment("12:00", "HH:mm");
  const breakEndTime = moment("13:30", "HH:mm");
  expect(
    getTotalWorkTime(clockInTime, clockOutTime, breakStartTime, breakEndTime)
  ).toBe(3.5);
});

test("狀況四之一，午休時打卡上班", () => {
    const clockInTime = moment("12:30", "HH:mm");
    const clockOutTime = moment("18:30", "HH:mm");
    const breakStartTime = moment("12:00", "HH:mm");
    const breakEndTime = moment("13:30", "HH:mm");
    expect(
      getTotalWorkTime(clockInTime, clockOutTime, breakStartTime, breakEndTime)
    ).toBe(5);
  });
  
  test("狀況四之二，午休結束後打卡上班", () => {
    const clockInTime = moment("14:00", "HH:mm");
    const clockOutTime = moment("20:30", "HH:mm");
    const breakStartTime = moment("12:00", "HH:mm");
    const breakEndTime = moment("13:30", "HH:mm");
    expect(
      getTotalWorkTime(clockInTime, clockOutTime, breakStartTime, breakEndTime)
    ).toBe(6.5);
  });