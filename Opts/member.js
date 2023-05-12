const {
  getAllMembers,
  getMemberByNumber,
  postTodayCheck,
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

const postTodayCheckOpts = {
  schema: {

    body: {
      type: "object",
      properties: {
        // 定义请求体的属性和类型
        employeeNumber: { type: "number",default:1001 },
        checkCatagory: { type: "string",enum: ['clockIn', 'clockOut'],default:"clockIn",description: 'only clockIn and clockOut' },
        time: { type: "string",default:"2023-05-12" },
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
          message: "新增打卡紀錄成功",
        },
      },
    },
  },
  handler: postTodayCheck,
};
module.exports = { getMembersOpts, getMemberOpts, postTodayCheckOpts };
