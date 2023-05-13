const {
  postTodayClockOpts,
  putReClockOpts,
  getTodayAllInfoOpts,
  getPeriodAllInfoOpts,
  getPeriodUnClockOutInfoOpts,
  getDateFirstFiveEmployeesInfoOpts
} = require("../Opts/member");

function memberRoutes(fastify, options, done) {

  fastify.post("/members/clock", postTodayClockOpts);
  fastify.put("/members/reClock", putReClockOpts);
  fastify.get("/members/todayAllInfo", getTodayAllInfoOpts);
  fastify.get("/members/periodAllInfo", getPeriodAllInfoOpts);
  fastify.get("/members/periodUnClockOutInfo", getPeriodUnClockOutInfoOpts);
  fastify.get("/members/dateFirstFiveEmployees",getDateFirstFiveEmployeesInfoOpts)
  done();
}
module.exports = memberRoutes;
