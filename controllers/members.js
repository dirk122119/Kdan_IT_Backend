const members = require("../member_data");
const momentTz = require("moment-timezone");
const moment = require("moment");
const { pool } = require("../lib/SQLfunction");

const getAllMembers = (req, reply) => {
  reply.send(members);
};
const getMemberByNumber = (req, reply) => {
  const { employeeNumber } = req.params;
  const member = members.find(
    (item) => item.employeeNumber === Number(employeeNumber)
  );
  if (member == undefined) {
    reply.code(400).send({ message: "not found" });
  }
  reply.send(member);
};

const postTodayCheck = async (req, reply) => {
  const reqBody = req.body;

  try {
    const connection = await pool.getConnection();
    const today = momentTz();
    const timezone = "Asia/Taipei";
    const todayInTaiwan = today.tz(timezone);

    if (reqBody.checkCatagory === "clockIn") {
      let query =
        "select * From members where DATE(clockIn) = CURDATE() and employeeNumber = ?";
      let values = [reqBody.employeeNumber];
      const [rows, fields] = await connection.query(query, values);
      if (rows.length != 0 && rows[0].clockIn) {
        reply.status(409).send({
          messgae: `${reqBody.employeeNumber} today clockIn data is exist`,
        });
      } else if (rows.length === 0) {
        query = "INSERT INTO members (employeeNumber, clockIn) VALUES (?,?);";
        values = [reqBody.employeeNumber, reqBody.time];
        const [result] = await connection.query(query, values);
        reply.status(201).send({
          message: `${reqBody.employeeNumber} clockIn at ${reqBody.time} `,
        });
      }
    } else if (reqBody.checkCatagory === "clockOut") {
      let query =
        "select * From members where DATE(clockIn) = CURDATE() and employeeNumber = ?";
      let values = [reqBody.employeeNumber];
      const [rows, fields] = await connection.query(query, values);
      // 早上未打卡新增下班打卡資料
      if (rows.length === 0) {
        query = "INSERT INTO members (employeeNumber, clockOut) VALUES (?,?);";
        values = [reqBody.employeeNumber, reqBody.time];
        const [result] = await connection.query(query, values);
        reply.status(201).send({
          message: `add ${reqBody.employeeNumber} clockOut at ${reqBody.time} `,
        });
      }
      // 早上有打卡，下班重複打卡
      else if (rows.length != 0 && rows[0].clockOut) {
        reply.status(409).send({
          messgae: `${reqBody.employeeNumber} today clockOut data is exist`,
        });
      }
      //早上有打卡，新增下班打卡
      else if (rows.length != 0 && rows[0].clockOut === null) {
        const stringformat = "YYYY-MM-DD HH:mm";
        const clockOutStringToTime = moment(reqBody.time, stringformat);
        if (clockOutStringToTime - rows[0].clockIn > 0) {
          query =
            "UPDATE members SET clockOut = ? where DATE(clockIn) = CURDATE() and employeeNumber = ?;";
          values = [reqBody.time, reqBody.employeeNumber];
          const [result] = await connection.query(query, values);
          reply.status(201).send({
            message: `set ${reqBody.employeeNumber} clockOut at ${reqBody.time} `,
          });
        }
        else{
          reply.code(400).send({ message: 'wrong clockOut time, clockIn must be early than clockOut' });
        }
      }
    }
    connection.release();
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send("Internal Server Error");
  }
};

module.exports = { getAllMembers, getMemberByNumber, postTodayCheck };
