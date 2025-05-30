import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQl_HOST,
    user: process.env.MYSQl_USER,
    password: process.env.MYSQl_PASSWORD,
    database: process.env.MYSQl_DATABASE
}).promise()

async function getUsers() {
    const [rows]  = await pool.query("select * from users")
    return rows
}
const users = await getUsers()
console.log(users)