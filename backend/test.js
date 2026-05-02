import pool from './config/db.js';
import "dotenv/config";
// import dns from "dns";
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

// console.log(process.env.sb_host);
// console.log(process.env.sb_password);

const result = await pool.query('SELECT * FROM users');
console.log(result.rows);