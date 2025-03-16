const mysql = require('mysql2')
const dotenv = require("dotenv");
dotenv.config();
const config = {
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
}
console.log(config.user)
const connection = mysql.createConnection(config)
connection.connect((err) => {
    if (err) {
        console.error("Connection error", err.stack)
        return
    } else {
        console.log('Connection id', connection.threadId)
    }
})

module.exports = { connection }