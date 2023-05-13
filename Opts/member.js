const {
  getAllMembers,
  getMemberByNumber,
  postTodayClock,
  putReClock,
  getTodayAllInfo,
  getPeriodAllInfo,
  getPeriodNonClockOutInfo
} = require("../controllers/members");

const getMembersOpts = {
  schema: {
    response: {
      200: {
        type: "array",
        members: {
          type: "object",
          properties: {
            employeeNumber: { type: "int" },
            clockIn: { type: "string" },
            clockOut: { type: "string" },
          },
        },
        default: [
          {
            employeeNumber: 10001,
            clockIn: "2023-05-08",
            clockOut: "2023-05-08",
          },
          {
            employeeNumber: 10001,
            clockIn: "2023-05-08",
            clockOut: "2023-05-08",
          },
        ],
      },
    },
  },
  handler: getAllMembers,
};

const getMemberOpts = {
  schema: {
    params: {
      type: "object",
      properties: {
        employeeNumber: {
          type: "number",
          description: "a User id",
        },
      },
    },
    response: {
      200: {
        description: "Returns a find data",
        type: "object",
        properties: {
          employeeNumber: { type: "number" },
          clockIn: { type: "string" },
          clockOut: { type: "string" },
        },
      },
      400: {
        description: "User not found",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  handler: getMemberByNumber,
};

const postTodayClockOpts = {
  schema: {

    body: {
      type: "object",
      properties: {
        // 定义请求体的属性和类型
        employeeNumber: { type: "number",default:1110001 },
        checkCatagory: { type: "string",enum: ['clockIn', 'clockOut'],default:"clockIn",description: 'only clockIn and clockOut',default:"clockIn" },
        time: { type: "string",default:"2023-05-12 09:00" },
        // ...
      },
      required: ['employeeNumber', 'checkCatagory', 'time'],
    },
    response: {
      201: {
        description: "新增打卡記錄",
        type: "object",
        properties: {
          // 定义响应体的属性和类型
          message: { type: "string" },
          // ...
        },
        default: {
          message: "add 1110001 clockIn at 2023-05-12 09:00",
        },
      },
    },
  },
  handler: postTodayClock,
};

const putReClockOpts = {
  schema: {

    body: {
      type: "object",
      properties: {
        // 定义请求体的属性和类型
        employeeNumber: { type: "number",default:1110001 },
        checkCatagory: { type: "string",enum: ['clockIn', 'clockOut'],default:"clockIn",description: 'only clockIn and clockOut',default:"clockIn" },
        time: { type: "string",default:"2023-04-12 09:00" },
        // ...
      },
      required: ['employeeNumber', 'checkCatagory', 'time'],
    },
    response: {
      200: {
        description: "補打卡記錄",
        type: "object",
        properties: {
          // 定义响应体的属性和类型
          message: { type: "string" },
          // ...
        },
        default: {
          message: "set 1110001 clockIn at 2023-04-12 09:00",
        },
      },
    },
  },
  handler: putReClock,
};

const getTodayAllInfoOpts={
  schema: {
    response: {
      200: {
        type: "array",
        members: {
          type: "object",
          properties: {
            employeeNumber: { type: "int" },
            clockIn: { type: "string" },
            clockOut: { type: "string" },
            breakTime:{type: "number"},
            totalWorkTime:{type: "number"},
          },
        },
        default: [
          {
            employeeNumber: 10001,
            clockIn: "2023-05-08",
            clockOut: "2023-05-08",
            breakTime:1,
            totalWorkTime:8.5,
          },
          {
            employeeNumber: 10001,
            clockIn: "2023-05-08",
            clockOut: "2023-05-08",
            breakTime:1,
            totalWorkTime:8.5,
          },
        ],
      },
    },
  },
  handler: getTodayAllInfo,
}


const getPeriodAllInfoOpts={
  schema: {

    querystring: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "search from startDate",
        },
        endDate: {
          type: "string",
          description: "search to endDate",
        },
      },
      required: ['startDate','endDate'],
    },
    response: {
      201: {
        description: "新增打卡記錄",
        type: "object",
        properties: {
          // 定义响应体的属性和类型
          message: { type: "string" },
          // ...
        },
        default: {
          message: "add 1110001 clockIn at 2023-05-12 09:00",
        },
      },
    },
  },
  handler: getPeriodAllInfo,
}

const getPeriodNonClockOutInfoOpts={
  schema: {

    querystring: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "search from startDate",
        },
        endDate: {
          type: "string",
          description: "search to endDate",
        },
      },
      required: ['startDate','endDate'],
    },
    response: {
      201: {
        description: "新增打卡記錄",
        type: "object",
        properties: {
          // 定义响应体的属性和类型
          message: { type: "string" },
          // ...
        },
        default: {
          message: "add 1110001 clockIn at 2023-05-12 09:00",
        },
      },
    },
  },
  handler: getPeriodNonClockOutInfo,
}

module.exports = { getMembersOpts, getMemberOpts, postTodayClockOpts,putReClockOpts,getTodayAllInfoOpts,getPeriodAllInfoOpts,getPeriodNonClockOutInfoOpts };
