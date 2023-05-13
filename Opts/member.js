const {
  postTodayClock,
  putReClock,
  getTodayAllInfo,
  getPeriodAllInfo,
  getPeriodUnClockOutInfo,
  getDateFirstFiveEmployeesInfo
} = require("../controllers/members");



const postTodayClockOpts = {
  schema: {

    body: {
      type: "object",
      properties: {
        employeeNumber: { type: "number",default:1110001 },
        checkCatagory: { type: "string",enum: ['clockIn', 'clockOut'],default:"clockIn",description: 'only accept clockIn and clockOut' },
        time: { type: "string",default:"2023-05-12 09:00" },
      },
      required: ['employeeNumber', 'checkCatagory', 'time'],
    },
    response: {
      201: {
        description: "在資料庫成功新增打卡記錄",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "add 1110001 clockIn at 2023-05-12 09:00",
        },
      },
      400: {
        description: "打卡上班晚於打卡下班時間",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "wrong clockOut time, clockIn must be early than clockOut",
        },
      },
      409: {
        description: "資料庫已有資料，重複打卡",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "1110001 today clockIn data is exist",
        },
      },
      500: {
        description: "資料庫錯誤",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "Internal Server Error",
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
        employeeNumber: { type: "number",default:1110001 },
        checkCatagory: { type: "string",enum: ['clockIn', 'clockOut'],default:"clockIn",description: 'only clockIn and clockOut',default:"clockIn" },
        time: { type: "string",default:"2023-04-12 09:00" },
      },
      required: ['employeeNumber', 'checkCatagory', 'time'],
    },
    response: {
      200: {
        description: "補打卡記錄",
        type: "object",
        properties: {
          message: { type: "string" },

        },
        default: {
          message: "set 1110001 clockIn at 2023-04-12 09:00",
        },
      },
      201: {
        description: "若資料庫沒當天紀錄，新增打卡記錄",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "add 1110001 clockIn at 2023-04-12 09:00",
        },
      },
      400: {
        description: "打卡上班晚於打卡下班時間",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "wrong clockOut time, clockIn must be early than clockOut",
        },
      },
      409: {
        description: "資料庫已有資料，重複打卡",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "1110001 today clockIn data is exist",
        },
      },
      500: {
        description: "資料庫錯誤",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "Internal Server Error",
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
        description: "回傳格式",
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
            employeeNumber: 1110013,
            clockIn: "2022-01-03 08:55",
            clockOut: "2022-01-03 17:53",
            breakTime:1.5,
            totalWorkTime:7.47,
          },
          {
            employeeNumber: 1110014,
            clockIn: "2022-01-03 08:55",
            clockOut: "2022-01-03 17:32",
            breakTime:1.5,
            totalWorkTime:7.12,
          },
        ],
      },
      404: {
        description: "找不到資料",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "data not found",
        },
      },
      500: {
        description: "資料庫錯誤",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "Internal Server Error",
        },
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
      200: {
        description: "回傳格式",
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
            employeeNumber: 1110013,
            clockIn: "2022-01-03 08:55",
            clockOut: "2022-01-03 17:53",
            breakTime:1.5,
            totalWorkTime:7.47,
          },
          {
            employeeNumber: 1110013,
            clockIn: "2022-01-03 08:55",
            clockOut: "2022-01-03 17:32",
            breakTime:1.5,
            totalWorkTime:7.12,
          },
        ],
      },
      404: {
        description: "找不到資料",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "data not found",
        },
      },
      500: {
        description: "資料庫錯誤",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "Internal Server Error",
        },
      },
    },
  },
  handler: getPeriodAllInfo,
}

const getPeriodUnClockOutInfoOpts={
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
      200: {
        description: "回傳格式",
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
            employeeNumber: 1110010,
            clockIn: "2022-01-03 08:40",
            clockOut: null,
          },
          {
            employeeNumber: 1110011,
            clockIn: "2022-01-03 08:39",
            clockOut: null,
          },
        ],
      },
      404: {
        description: "找不到資料",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "data not found",
        },
      },
      500: {
        description: "資料庫錯誤",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "Internal Server Error",
        },
      },
    },
  },
  handler: getPeriodUnClockOutInfo,
}

const getDateFirstFiveEmployeesInfoOpts={
  schema: {

    querystring: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "search date",
        }
      },
      required: ['date'],
    },
    response: {
      200: {
        description: "回傳格式",
        type: "array",
        members: {
          type: "object",
          properties: {
            employeeNumber: { type: "int" },
            clockIn: { type: "string" },
          },
        },
        default: [
          {
            employeeNumber: 1110010,
            clockIn: "2022-01-03 08:10",
          },
          {
            employeeNumber: 1110011,
            clockIn: "2022-01-03 08:39",
          },
        ],
      },
      404: {
        description: "找不到資料",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "data not found",
        },
      },
      500: {
        description: "資料庫錯誤",
        type: "object",
        properties: {
          message: { type: "string" },
        },
        default: {
          message: "Internal Server Error",
        },
      },
    },
  },
  handler: getDateFirstFiveEmployeesInfo,
}

module.exports = { postTodayClockOpts,putReClockOpts,getTodayAllInfoOpts,getPeriodAllInfoOpts,getPeriodUnClockOutInfoOpts,getDateFirstFiveEmployeesInfoOpts };
