CREATE DATABASE IF NOT EXISTS KdanMember;

USE KdanMember;

CREATE TABLE IF NOT EXISTS members(
    id INT PRIMARY KEY AUTO_INCREMENT,
    employeeNumber int NOT NULL,
    clockIn DATETIME,
    clockOut DATETIME);