const {
  postTodayClockOpts,
  putReClockOpts,
  getTodayAllInfoOpts,
  getPeriodAllInfoOpts,
  getPeriodUnClockOutInfoOpts,
  getPeriodFirstFiveEmployeesInfoOpts
} = require("../Opts/member");

function memberRoutes(fastify, options, done) {

  fastify.post("/members/clock", postTodayClockOpts);
  fastify.put("/members/reClock", putReClockOpts);
  fastify.get("/members/todayAllInfo", getTodayAllInfoOpts);
  fastify.get("/members/periodAllInfo", getPeriodAllInfoOpts);
  fastify.get("/members/periodUnClockOutInfo", getPeriodUnClockOutInfoOpts);
  fastify.get("/members/periodFirstFiveEmployees",getPeriodFirstFiveEmployeesInfoOpts)
  done();
}
module.exports = memberRoutes;
