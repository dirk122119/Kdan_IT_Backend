
const momentTz = require("moment-timezone");
const moment = require("moment");
const { pool } = require("../lib/SQLfunction");
const { getBreakTime, getTotalWorkTime } = require("../lib/getDiffTime");


const postTodayClock = async (req, reply) => {
  const reqBody = req.body;

  try {
    const connection = await pool.getConnection();
    const today = momentTz();
    const timezone = "Asia/Taipei";
    const todayInTaiwan = today.tz(timezone);
    const timeDate = moment(reqBody.time, "YYYY-MM-DD HH:mm")
    if(todayInTaiwan.format("YYYY-MM-DD")!=timeDate.format("YYYY-MM-DD")){
      reply.status(400).send({
        message: "date wrong",
      });
    }
    else{
    if (reqBody.checkCatagory === "clockIn") {
      let query =
        "select employeeNumber, clockIn, clockOut From members where DATE(clockIn) = ? and employeeNumber = ?";
      let values = [todayInTaiwan.format("YYYY-MM-DD"),reqBody.employeeNumber];
      const [rows, fields] = await connection.query(query, values);
      if (rows.length != 0 && rows[0].clockIn) {
        reply.status(409).send({
          message: `${reqBody.employeeNumber} today clockIn data is exist`,
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
        "select employeeNumber,clockIn, clockOut From members where DATE(clockIn) = ? and employeeNumber = ?";
      let values = [todayInTaiwan.format("YYYY-MM-DD"),reqBody.employeeNumber];
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
        const clockInStringToTime = moment(rows[0].clockIn);
        console.log(clockOutStringToTime)
        console.log(clockInStringToTime)
        if (clockOutStringToTime - clockInStringToTime > 0) {
          query =
            "UPDATE members SET clockOut = ? where DATE(clockIn) = CURDATE() and employeeNumber = ?;";
          values = [reqBody.time, reqBody.employeeNumber];
          const [result] = await connection.query(query, values);
          reply.status(201).send({
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
  }
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send({message:"Internal Server Error"});
  }
};

const putReClock = async (req, reply) => {
  const reqBody = req.body;
  const dateTime = moment(reqBody.time, "YYYY-MM-DD HH:mm");
  const date = dateTime.format("YYYY-MM-DD");

  try {
    const connection = await pool.getConnection();
    let query =
      "select employeeNumber, clockIn, clockOut From members where employeeNumber = ? and ( DATE(clockIn) = ? or DATE(clockOut) = ?)";
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
        message: `employeeNumber:${reqBody.employeeNumber},date:${date} ${reqBody.checkCatagory} data is exist`,
      });
    } else if (rows[0][`${reqBody.checkCatagory}`] === null) {
      let flag = true;
      //判斷clockOut時間有沒有比clockIn時間晚
      if (reqBody.checkCatagory === "clockIn") {
        const stringformat = "YYYY-MM-DD HH:mm";
        const clockInTime = moment(reqBody.time, stringformat);
        const clockOutTime = moment(rows[0]["clockOut"], stringformat);
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
        const clockInTime = moment(rows[0]["clockIn"], stringformat);
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
    reply.status(500).send({message:"Internal Server Error"});
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
    if(rows.length===0){
      reply.status(404).send({message:"data not found"});
    }
    const return_array = rows.map((row) => {
      if (row["clockIn"] != null && row["clockOut"] != null) {
        const clockInTime = moment(row["clockIn"], "HH:mm");
        const clockOutTime = moment(row["clockOut"], "HH:mm");
        const breakStartTime = moment("12:00", "HH:mm");
        const breakEndTime = moment("13:30", "HH:mm");
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
          clockIn: `${moment(row["clockIn"]).format("YYYY-MM-DD HH:mm")}`,
          clockOut: `${moment(row["clockOut"]).format("YYYY-MM-DD HH:mm")}`,
          breakTime: Number(breakTime.toFixed(2)),
          totalWorkTime: Number(totalWorkTime.toFixed(2)),
        };
      } else if (row["clockIn"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: null,
          clockOut: `${moment(row["clockOut"]).format("YYYY-MM-DD HH:mm")}`,
          breakTime: null,
          totalWorkTime: null,
        };
      } else if (row["clockOut"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: `${moment(row["clockIn"]).format("YYYY-MM-DD HH:mm")}`,
          clockOut: null,
          breakTime: null,
          totalWorkTime: null,
        };
      }
    });
    reply.status(200).send(return_array);
    connection.release();
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send({message:"Internal Server Error"});
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
        const clockInTime = moment(row["clockIn"], "HH:mm");
        const clockOutTime = moment(row["clockOut"], "HH:mm");
        const breakStartTime = moment("12:00", "HH:mm");
        const breakEndTime = moment("13:30", "HH:mm");
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
          clockIn: `${moment(row["clockIn"]).format("YYYY-MM-DD HH:mm")}`,
          clockOut: `${moment(row["clockOut"]).format("YYYY-MM-DD HH:mm")}`,
          breakTime: Number(breakTime.toFixed(2)),
          totalWorkTime: Number(totalWorkTime.toFixed(2)),
        };
      } else if (row["clockIn"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: null,
          clockOut: `${moment(row["clockOut"]).format("YYYY-MM-DD HH:mm")}`,
          breakTime: null,
          totalWorkTime: null,
        };
      } else if (row["clockOut"] === null) {
        return {
          employeeNumber: `${row["employeeNumber"]}`,
          clockIn: `${moment(row["clockIn"]).format("YYYY-MM-DD HH:mm")}`,
          clockOut: null,
          breakTime: null,
          totalWorkTime: null,
        };
      }
    });
    
    if(return_array.length===0){
      reply.status(404).send({message:"data not found"});
    }
    else{
      reply.status(200).send(return_array);
    }
    connection.release();
    
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send({message:"Internal Server Error"});
  }
};

const getPeriodUnClockOutInfo = async (req, reply) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  try {
    const connection = await pool.getConnection();
    let query =
      "select employeeNumber,clockIn, clockOut From members where (DATE(clockIn) >= ? and DATE(clockIn) <= ?) or (DATE(clockOut) >= ? and DATE(clockOut) <= ?)";
    let values = [startDate, endDate, startDate, endDate];
    const [rows, fields] = await connection.query(query, values);
    const getUnClockOut = rows.map((row) => {
      if (row["clockOut"] === null) {
        return {
          employeeNumber: row["employeeNumber"],
          clockIn: `${moment(row["clockIn"]).format("YYYY-MM-DD HH:mm")}`,
          clockOut: null,
        };
      }
    });
    const return_array = getUnClockOut.filter((employee) => employee != null);

    if (return_array.length === 0) {
      reply.code(404).send({ message: "no employee unclockOut" });
    } else {
      reply.status(200).send(return_array);
    }
    connection.release();
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send({message:"Internal Server Error"});
  }
};

const getDateFirstFiveEmployeesInfo = async (req, reply) => {
  const date = req.query.date;


  try {
    const connection = await pool.getConnection();
    let query =
      "select employeeNumber,clockIn, clockOut From members where DATE(clockIn) = ? ";
    let values = [date];
    const [rows, fields] = await connection.query(query, values);
    const getDateArray=rows.map((row)=>{
      return ({employeeNumber:row["employeeNumber"],clockIn:moment(row["clockIn"]).format("YYYY-MM-DD HH:mm")})
    })
    getDateArray.sort((a,b)=>{
      const aDateTime=moment(a["clockIn"])
        const bDateTime=moment(b["clockIn"])
        return aDateTime-bDateTime
    })
    let returnFirstFive=getDateArray.slice(0,5)
    if(returnFirstFive.length==0){
      reply.code(404).send({ message: "no employee unclockOut" });
    }
    else{
      reply.status(200).send(returnFirstFive);
    }
    connection.release();
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    reply.status(500).send({message:"Internal Server Error"});
  }
};
module.exports = {

  postTodayClock,
  putReClock,
  getTodayAllInfo,
  getPeriodAllInfo,
  getPeriodUnClockOutInfo,
  getDateFirstFiveEmployeesInfo,
};
