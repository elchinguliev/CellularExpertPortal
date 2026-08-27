require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_NAME = String(process.env.ADMIN_NAME || '').trim();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: `-c search_path=${process.env.DB_SCHEMA || "ce_boss"}`,
});

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD must be set explicitly.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, company, product, role, avatar)
     VALUES ($1, $2, $3, 'Cellular Expert', 'Both', 'admin', 'AU')
     ON CONFLICT (LOWER(email)) WHERE deleted_at IS NULL DO NOTHING
     RETURNING id, name, email, role`,
    [ADMIN_NAME, ADMIN_EMAIL, hash],
  );

  if (rows[0]) {
    console.log(`Admin account created for ${rows[0].email}.`);
  } else {
    console.log('An account with that email already exists; no account was changed.');
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
