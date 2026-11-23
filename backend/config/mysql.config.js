const mysql = require('mysql2/promise')
// 连接 MySQL 数据库，连接参数可用环境变量覆盖
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  port: Number(process.env.MYSQL_PORT || 3306),
  password: process.env.MYSQL_PASSWORD || '123456',
  database: process.env.MYSQL_DATABASE || 'crpp',
  charset: 'utf8mb4',
});

module.exports = db
