const pool = require('./models/db');
const bcrypt = require('bcrypt');

async function seedData() {
  try {
    console.log('Seeding sample data...');
    
    // Create sample users
    const hashedPassword = await bcrypt.hash('Shivani@123', 10);
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      ['shivani', 'shivani@example.com', hashedPassword]
    );
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      ['shivani.thalapaka', 'shivani.thalapaka@capgemini.com', hashedPassword]
    );
    
    // Create sample customers
    await pool.query(`
      INSERT INTO customers (name, email, phone, company, address) VALUES 
      ('Shivani Sharma', 'shivani.sharma@techcorp.com', '+91-9876543210', 'TechCorp Solutions', '123 Business Park, Mumbai, Maharashtra'),
      ('Rahul Kumar', 'rahul@innovate.com', '+91-9876543211', 'Innovate Ltd', '456 Tech Street, Delhi, India')
      ON CONFLICT (email) DO NOTHING
    `);
    
    // Create sample leads
    await pool.query(`
      INSERT INTO leads (customer_id, lead_source, status, value, description) VALUES 
      (1, 'Website Contact Form', 'new', 50000, 'Interested in enterprise software solution'),
      (2, 'Direct Sales Call', 'qualified', 75000, 'Ready for proposal presentation')
      ON CONFLICT DO NOTHING
    `);
    
    // Create sample contacts
    await pool.query(`
      INSERT INTO contacts (customer_id, contact_type, contact_value, is_primary) VALUES 
      (1, 'email', 'shivani.work@techcorp.com', true),
      (1, 'phone', '+91-9876543210', false),
      (2, 'email', 'rahul.work@innovate.com', true)
      ON CONFLICT DO NOTHING
    `);
    
    // Create sample stages
    await pool.query(`
      INSERT INTO stages (lead_id, stage_name) VALUES 
      (1, 'Initial Contact'),
      (1, 'Needs Assessment'),
      (2, 'Proposal Sent')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Sample data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error.message);
  } finally {
    process.exit();
  }
}

seedData();