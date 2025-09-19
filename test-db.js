// Test d      port: process.env.DATABASE_PORT || 11776,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,ase connection
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT || 11776,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'TOOLS', 'ca.pem')),
        rejectUnauthorized: true
      }
    });

    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
