import pg from 'pg';
const { Pool } = pg;
import "dotenv/config";

// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT || 5432,
//     database: process.env.DB_NAME
// })

// const pool = new Pool({
//   user: process.env.render_username,     // NOT render_hostname
//   password: process.env.render_password, // NOT render_port
//   host: process.env.render_hostname,     // NOT render_database
//   port: process.env.render_port,         // NOT render_username
//   database: process.env.render_database, // NOT render_password
//   ssl: {
//     rejectUnauthorized: false
//   }
// });


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});


export default pool;