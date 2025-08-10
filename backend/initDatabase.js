const pool = require('./models/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database', 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Database initialized successfully!');
    
    // Test if tables exist with correct columns
    const tables = ['users', 'customers', 'contacts', 'leads', 'stages', 'tasks', 'communication_history'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name IN ('created_at', 'updated_at')
      `, [table]);
      
      console.log(`${table} table has columns:`, result.rows.map(r => r.column_name));
    }
    
  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    process.exit();
  }
}

initializeDatabase();