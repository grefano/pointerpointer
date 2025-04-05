
import dotenv from 'dotenv'
dotenv.config()

import mysql from 'mysql2'


const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getNotes(params) {
    const [rows] = await pool.query("SELECT * FROM notes")
    return rows
}
export async function getNote(id){
    const column = await pool.query(`
    select * from notes
    where id = ?      
    `, [id])
    return column[0][0]
}

export async function createNote(title){
    const result = await pool.query(`
    insert into notes (title)
    value (?)    
    `, [title])
    return result[0].insertId
}
