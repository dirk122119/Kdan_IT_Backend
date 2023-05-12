const members = require("../member_data");

const {getMembersOpts,getMemberOpts,postTodayCheckOpts} = require("../Opts/member")




function memberRoutes(fastify, options, done) {
  fastify.get("/members", getMembersOpts);

  fastify.get("/members/:employeeNumber", getMemberOpts);
  fastify.post("/members/check", postTodayCheckOpts);
  done();
}
module.exports = memberRoutes;
