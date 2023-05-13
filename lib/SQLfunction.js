const fs = require("fs");
require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getConnect = async () => {
  const connection = await pool.getConnection();
  return connection;
};
const insertData = async (data) => {
  const connection = await pool.getConnection();
  const sql =
    "INSERT INTO members (employeeNumber, clockIn,clockOut) VALUES (?, ?, ?)";
  try {
    let values = [];
    const processedArray = await Promise.all(
      data.map(async (element) => {
        elementValue = Object.values(element);
        values = [elementValue[0], elementValue[1], elementValue[2]];
        const [result] = await connection.execute(sql, values);
        console.log("Data inserted successfully. Insert ID:", result.insertId);
        return result;
      })
    );
  } catch (error) {
    console.log(error);
  } finally {
    connection.release();
    process.exit();
  }
};
const insertJsonFile = () => {
  // 读取 JSON 文件
  fs.readFile("member.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    try {
      // 解析 JSON 数据
      const jsonData = JSON.parse(data);
      insertData(jsonData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  });
};
module.exports = { insertJsonFile,pool };
