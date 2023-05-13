const members = require("../member_data");
const momentTz = require("moment-timezone");
const moment = require("moment");
const { pool } = require("../lib/SQLfunction");
const { getBreakTime, getTotalWorkTime } = require("../lib/getDiffTime");
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

const postTodayClock = async (req, reply) => {
  const reqBody = req.body;

  try {
    const connection = await pool.getConnection();
    const today = momentTz();
    const timezone = "Asia/Taipei";
    const todayInTaiwan = today.tz(timezone);

    if (reqBody.checkCatagory === "clockIn") {
      let query =
        "select employeeNumber, CONVERT_TZ(clockIn, '+00:00', '+08:00') as clockIn, CONVERT_TZ(clockOut, '+00:00', '+08:00') as clockOut From members where DATE(clockIn) = CURDATE() and employeeNumber = ?";
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
        "select employeeNumber,CONVERT_TZ(clockIn, '+00:00', '+08:00') as clockIn, CONVERT_TZ(clockOut, '+00:00', '+08:00') as clockOut From members where DATE(clockIn) = CURDATE() and employeeNumber = ?";
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
          reply.status(200).send({
            message: `set ${reqBody.employeeNumber} clockOut at ${reqBody.time} `,
          });
        } else {
          reply.code(400).send({
            message: "wrong clockOut time, clockIn must be early than clockOut",
          });
        }
      }
    }
    connection.release();
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send("Internal Server Error");
  }
};

const putReClock = async (req, reply) => {
  const reqBody = req.body;
  const dateTime = moment(reqBody.time, "YYYY-MM-DD HH:mm");
  const date = dateTime.format("YYYY-MM-DD");

  try {
    const connection = await pool.getConnection();
    let query =
      "select employeeNumber,CONVERT_TZ(clockIn, '+00:00', '+08:00') as clockIn, CONVERT_TZ(clockOut, '+00:00', '+08:00') as clockOut From members where employeeNumber = ? and ( DATE(clockIn) = ? or DATE(clockOut) = ?)";
    let values = [reqBody.employeeNumber, date, date];
    const [rows, fields] = await connection.query(query, values);
    if (rows.length == 0) {
      query =
        reqBody.checkCatagory === "clockIn"
          ? "INSERT INTO members (employeeNumber, clockIn) VALUES (?,?);"
          : "INSERT INTO members (employeeNumber, clockOut) VALUES (?,?);";
      values = [reqBody.employeeNumber, reqBody.time];
      const [result] = await connection.query(query, values);
      reply.status(201).send({
        message: `add ${reqBody.employeeNumber} ${reqBody.checkCatagory} data at ${reqBody.time} `,
      });
    } else if (rows[0][`${reqBody.checkCatagory}`] != null) {
      reply.status(409).send({
        messgae: `employeeNumber:${reqBody.employeeNumber},date:${date} ${reqBody.checkCatagory} data is exist`,
      });
    } else if (rows[0][`${reqBody.checkCatagory}`] === null) {
      let flag = true;
      //判斷clockOut時間有沒有比clockIn時間晚
      if (reqBody.checkCatagory === "clockIn") {
        const stringformat = "YYYY-MM-DD HH:mm";
        const clockInTime = moment(reqBody.time, stringformat);
        const clockOutTime = rows[0]["clockOut"];
        const diffTime = clockOutTime.diff(clockInTime, "minutes");
        if (diffTime < 0) {
          reply.code(400).send({
            message: "wrong clockOut time, clockIn must be early than clockOut",
          });
          flag = false;
        }
        // 判斷clockOut時間有沒有比clockIn時間晚
      } else if (reqBody.checkCatagory === "clockOut") {
        const stringformat = "YYYY-MM-DD HH:mm";
        const clockOutTime = moment(reqBody.time, stringformat);
        const clockInTime = rows[0]["clockIn"];
        const diffTime = clockOutTime.diff(clockInTime, "minutes");

        if (diffTime < 0) {
          reply.code(400).send({
            message: "wrong clockOut time, clockIn must be early than clockOut",
          });
          flag = false;
        }
      }
      if (flag) {
        query =
          reqBody.checkCatagory === "clockIn"
            ? "UPDATE members set clockIn = ? where employeeNumber = ? and ( DATE(clockIn) = ? or DATE(clockOut) = ?);"
            : "UPDATE members set clockOut = ? where employeeNumber = ? and ( DATE(clockIn) = ? or DATE(clockOut) = ?);";
        values = [reqBody.time, reqBody.employeeNumber, date, date];
        const [result] = await connection.query(query, values);
        reply.status(200).send({
          message: `employeeNumber:${reqBody.employeeNumber},  re${reqBody.checkCatagory} at ${reqBody.time} `,
        });
      }
    }
    connection.release();
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send("Internal Server Error");
  }
};

const getTodayAllInfo = async (req, reply) => {
  const today = momentTz();
  const timezone = "Asia/Taipei";
  const todayInTaiwan = today.tz(timezone);
  const dateToday = todayInTaiwan.format("YYYY-MM-DD");
  try {
    const connection = await pool.getConnection();
    let query =
      "select employeeNumber,clockIn, clockOut From members where DATE(clockIn) = ? or DATE(clockOut) = ?";
    let values = [dateToday, dateToday];
    const [rows, fields] = await connection.query(query, values);
    console.log(rows);
    const return_array = rows.map((row) => {
      if (row["clockIn"] != null && row["clockOut"] != null) {
        const clockInTime = moment(row["clockIn"], "HH:mm").utcOffset(8);
        const clockOutTime = moment(row["clockOut"], "HH:mm").utcOffset(8);
        const breakStartTime = moment("12:00", "HH:mm").utcOffset(8);
        const breakEndTime = moment("13:30", "HH:mm").utcOffset(8);
        const breakTime = getBreakTime(
          clockInTime,
          clockOutTime,
          breakStartTime,
          breakEndTime
        );
        const totalWorkTime = getTotalWorkTime(
          clockInTime,
          clockOutTime,
          breakStartTime,
          breakEndTime
        );
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: `${moment(row["clockIn"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          clockOut: `${moment(row["clockOut"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          breakTime: Number(breakTime.toFixed(2)),
          totalWorkTime: Number(totalWorkTime.toFixed(2)),
        };
      } else if (row["clockIn"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: null,
          clockOut: `${moment(row["clockOut"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          breakTime: null,
          totalWorkTime: null,
        };
      } else if (row["clockOut"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: `${moment(row["clockIn"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          clockOut: null,
          breakTime: null,
          totalWorkTime: null,
        };
      }
    });
    connection.release();
    reply.status(200).send(return_array);
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send("Internal Server Error");
  }
};

const getPeriodAllInfo = async (req, reply) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  try {
    const connection = await pool.getConnection();
    let query =
      "select employeeNumber,clockIn, clockOut From members where (DATE(clockIn) >= ? and DATE(clockIn) <= ?) or (DATE(clockOut) >= ? and DATE(clockOut) <= ?)";
    let values = [startDate, endDate, startDate, endDate];
    const [rows, fields] = await connection.query(query, values);
    const return_array = rows.map((row) => {
      if (row["clockIn"] != null && row["clockOut"] != null) {
        const clockInTime = moment(row["clockIn"], "HH:mm").utcOffset(8);
        const clockOutTime = moment(row["clockOut"], "HH:mm").utcOffset(8);
        const breakStartTime = moment("12:00", "HH:mm").utcOffset(8);
        const breakEndTime = moment("13:30", "HH:mm").utcOffset(8);
        const breakTime = getBreakTime(
          clockInTime,
          clockOutTime,
          breakStartTime,
          breakEndTime
        );

        const totalWorkTime = getTotalWorkTime(
          clockInTime,
          clockOutTime,
          breakStartTime,
          breakEndTime
        );

        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: `${moment(row["clockIn"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          clockOut: `${moment(row["clockOut"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          breakTime: Number(breakTime.toFixed(2)),
          totalWorkTime: Number(totalWorkTime.toFixed(2)),
        };
      } else if (row["clockIn"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: null,
          clockOut: `${moment(row["clockOut"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          breakTime: null,
          totalWorkTime: null,
        };
      } else if (row["clockOut"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: `${moment(row["clockIn"])
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm")}`,
          clockOut: null,
          breakTime: null,
          totalWorkTime: null,
        };
      }
    });
    connection.release();
    reply.status(200).send(return_array);
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send("Internal Server Error");
  }
};

const getPeriodNonClockOutInfo = async (req, reply) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  try {
    const connection = await pool.getConnection();
    let query =
      "select employeeNumber,clockIn, clockOut From members where (DATE(clockIn) >= ? and DATE(clockIn) <= ?) or (DATE(clockOut) >= ? and DATE(clockOut) <= ?)";
    let values = [startDate, endDate, startDate, endDate];
    const [rows, fields] = await connection.query(query, values);
    const getNonClockOut = rows.map((row)=>{
      if (row["clockOut"] === null) {
        return ({employeeNumber:row["employeeNumber"],clockIn:`${moment(row["clockIn"])
        .utcOffset(8)
        .format("YYYY-MM-DD HH:mm")}`,clockOut:null})
      }
    })
    const return_array=getNonClockOut.filter((employee)=>employee!=null)
    if(return_array){
      reply.status(200).send(return_array)
    }
    else if(return_array.length===0){
      reply.code(400).send({ message: "no employee unclockOut" });
    }
   
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send("Internal Server Error");
  }

  
};
module.exports = {
  getAllMembers,
  getMemberByNumber,
  postTodayClock,
  putReClock,
  getTodayAllInfo,
  getPeriodAllInfo,
  getPeriodNonClockOutInfo,
};
