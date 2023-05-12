const members = require("../member_data");

const {getMembersOpts,getMemberOpts,postTodayClockOpts,putReClockOpts} = require("../Opts/member")




function memberRoutes(fastify, options, done) {
  fastify.get("/members", getMembersOpts);

  fastify.get("/members/:employeeNumber", getMemberOpts);
  fastify.post("/members/clock", postTodayClockOpts);
  fastify.put('/members/reClock', putReClockOpts)
  done();
}
module.exports = memberRoutes;
