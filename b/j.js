const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Your database URL
});

// SQL query to create the table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_id UUID NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    selected_numbers TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Function to create the table
const createTable = async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Execute the query
    await client.query(createTableQuery);
    console.log('Table "campaigns" created successfully');
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    // Close the connection
    await client.end();
    console.log('Database connection closed');
  }
};

// Run the function
createTable();
