require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const ADMIN_EMAIL = "admin@cellular-expert.com";
const ADMIN_PASSWORD = "ChangeMe123!";
const ADMIN_NAME = "Admin User";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, company, product, role, avatar)
     VALUES ($1, $2, $3, 'Cellular Expert', 'Both', 'admin', 'AU')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, name, email, role`,
    [ADMIN_NAME, ADMIN_EMAIL, hash],
  );

  console.log("✅ Admin account ready:");
  console.log(rows[0]);
  console.log(
    `\nLogin with:\n  email:    ${ADMIN_EMAIL}\n  password: ${ADMIN_PASSWORD}`,
  );

  await pool.end();
}

main().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
