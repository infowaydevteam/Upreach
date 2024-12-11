// server.js
const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');
const moment = require('moment');
const Twilio = require('twilio');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const port = process.env.PORT || 5005;

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Check required environment variables
if (
  !process.env.PGDATABASE ||
  !process.env.PGUSER ||
  !process.env.PGPASSWORD ||
  !process.env.PGHOST ||
  !process.env.PGPORT ||
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_PHONE_NUMBER
) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

// Set up PostgreSQL client
const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Initialize Twilio client
const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Connect to the database
client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Connection error', err.stack));


// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists in the database
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password (assuming plain text for now)
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Login successful
    // Send back the user info along with the success message
    res.status(200).json({ 
      message: 'Login successful',
      username: user.username, // Assuming the column name is 'username'
      email: user.email
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

app.post('/api/customer', async (req, res) => {
  const { email, customerName, customerEmail, industry, subdomain, natureOfBusiness } = req.body;

  try {
    // Use client for queries instead of pool
    const result = await client.query(
      'INSERT INTO customer_accounts (email, customer_name, customer_email, industry, subdomain, nature_of_business) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, customerName, customerEmail, industry, subdomain, natureOfBusiness]
    );

    res.status(201).json({
      message: 'Customer account created successfully!',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error creating customer account',
      error: err.message,
    });
  }
});

app.get('/api/customer', async (req, res) => {
  const { email } = req.query;

  try {
    // Use client for queries instead of pool
    const result = await client.query(
      'SELECT * FROM customer_accounts WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        message: 'Customer accounts retrieved successfully!',
        data: result.rows,
      });
    } else {
      res.status(404).json({
        message: 'No customer accounts found for this email.',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error fetching customer accounts',
      error: err.message,
    });
  }
});
// Fetch customers API
app.get('/api/customers', async (req, res) => {
  const { email } = req.query; // Get the email from the query parameters

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Query to fetch customers from the 'customer_accounts' table and filter by email
    const result = await client.query(
      'SELECT customer_name FROM customer_accounts WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        message: 'Customers fetched successfully!',
        data: result.rows, // Returning the list of customers
      });
    } else {
      res.status(404).json({
        message: 'No customers found for this email.',
      });
    }
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({
      message: 'Error fetching customers',
      error: err.message,
    });
  }
});

app.post('/api/contact', async (req, res) => {
  const { customer, name, title, countryCode, phone, email } = req.body;

  if (!customer || !name || !title || !countryCode || !phone || !email) {
    return res.status(400).json({
      message: 'All fields (including email) are required.',
    });
  }

  try {
    // Insert the form data into the database (assuming a `contacts` table exists)
    const result = await client.query(
      'INSERT INTO contacts (customer_name, name, title, country_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer, name, title, countryCode, phone, email]
    );

    // Respond with the inserted data
    res.status(201).json({
      message: 'Contact created successfully!',
      data: result.rows[0], // Return the inserted data
    });
  } catch (err) {
    console.error('Error storing contact:', err);
    res.status(500).json({
      message: 'Error storing contact data.',
      error: err.message,
    });
  }
});
// Assuming you're using Express.js and your database client is already configured
app.get('/api/contacts', async (req, res) => {
  try {
    // Get the userEmail from the query parameters
    const userEmail = req.query.userEmail;

    if (!userEmail) {
      return res.status(400).json({
        message: 'Missing userEmail parameter.',
      });
    }

    // Query to fetch contacts for the specific email
    const result = await client.query(
      'SELECT * FROM contacts WHERE email = $1',
      [userEmail]
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        message: 'Contacts fetched successfully!',
        data: result.rows, // Returning the filtered list of contacts
      });
    } else {
      res.status(404).json({
        message: 'No contacts found for the given email.',
      });
    }
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({
      message: 'Error fetching contacts',
      error: err.message,
    });
  }
});


app.get('/api/contacts1', async (req, res) => {
  const { customerName } = req.query; // Get the selected customerName from the query string

  if (!customerName) {
    return res.status(400).json({
      message: 'Customer name is required.',
    });
  }

  try {
    // Query to fetch contacts from the database for the selected customer
    const result = await client.query(
      'SELECT * FROM contacts WHERE customer_name = $1', // Adjust the column name if needed
      [customerName] // Use parameterized query to avoid SQL injection
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        message: 'Contacts fetched successfully!',
        data: result.rows, // Returning the list of contacts
      });
    } else {
      res.status(404).json({
        message: `No contacts found for customer: ${customerName}`,
      });
    }
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({
      message: 'Error fetching contacts',
      error: err.message,
    });
  }
});

app.post('/api/contact/upload', async (req, res) => {
  const data = req.body;
  console.log("Received data:", data);

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: 'No data provided.' });
  }

  const errors = [];
  data.forEach((row, index) => {
    const { customer_name, name, title, country_code, phone, email } = row;

    if (!customer_name || !name || !title || !country_code || !phone || !email) {
      errors.push(`Row ${index + 1}: All fields are required.`);
    }

    // Ensure phone is a string and clean it
    const cleanedPhone = String(phone).replace(/[^0-9+]/g, '');

    const phonePattern = /^[0-9]{10}$/;
    if (cleanedPhone && !phonePattern.test(cleanedPhone)) {
      errors.push(`Row ${index + 1}: Invalid phone number format.`);
    }

    // Update the row phone number with cleaned phone
    row.phone = cleanedPhone;
  });

  if (errors.length > 0) {
    console.log("Validation errors:", errors);
    return res.status(400).json({ errors });
  }

  try {
    await client.query('BEGIN'); // Start a transaction

    const query =
      'INSERT INTO contacts (customer_name, name, title, country_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

    for (const row of data) {
      const { customer_name, name, title, country_code, phone, email } = row;
      const result = await client.query(query, [customer_name, name, title, country_code, phone, email]);

      console.log(`Inserted Contact: ${result.rows[0].name}`);
    }

    await client.query('COMMIT'); // Commit transaction
    res.status(201).json({ message: 'Contacts uploaded successfully!' });

  } catch (err) {
    await client.query('ROLLBACK'); // Roll back transaction in case of error
    console.error('Error storing contacts:', err);
    res.status(500).json({ message: 'Error storing contact data.', error: err.message });
  }
});


app.get('/api/customers/:customerName/numbers', async (req, res) => {
  const { customerName } = req.params;
  const { email } = req.query; // Get the email from query parameters

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Query to fetch phone numbers for the specified customer name, filtered by email
    const result = await client.query(
      'SELECT phone, country_code, name, customer_name FROM contacts WHERE customer_name = $1 AND email = $2',
      [customerName, email]
    );

    if (result.rows.length > 0) {
      // Map the result to an array of phone numbers with customer details
      const phoneNumbers = result.rows.map(row => ({
        phoneNumber: `${row.country_code} ${row.phone}`,
        customerName: row.customer_name,
        name: row.name,
      }));
      
      // Return the phone numbers
      res.json({ data: phoneNumbers });
    } else {
      res.status(404).json({
        message: `No contacts found for customer '${customerName}' with this email.`,
      });
    }
  } catch (error) {
    console.error('Error fetching customer numbers:', error);
    res.status(500).json({
      message: 'Error fetching customer contacts.',
      error: error.message,
    });
  }
});

const generateUniqueId = async () => {
  const prefix = 'CM'; // Constant prefix
  let campaignId;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 4-digit number
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
    campaignId = `${prefix}${randomNumber}`;

    // Check if the campaign_id already exists in the database
    const result = await client.query('SELECT campaign_id FROM campaigns WHERE campaign_id = $1', [campaignId]);

    // If not found, the ID is unique
    if (result.rows.length === 0) {
      isUnique = true;
    }
  }

  return campaignId;
};

app.post('/api/campaigns', async (req, res) => {
  const { campaignName, selectedCustomers, selectedNumbers, scheduleDatetime, email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Generate a unique campaign ID
    const campaignId = await generateUniqueId();

    // Insert the new campaign with the email
    await client.query(
      `INSERT INTO campaigns 
        (campaign_name, campaign_id, customer_name, selected_numbers, created_at, email) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
      [campaignName, campaignId, selectedCustomers, selectedNumbers, scheduleDatetime, email]
    );

    res.status(201).json({
      message: 'Campaign created successfully!',
      campaignId,
      campaignName,
      customers: selectedCustomers,
      phoneNumbers: selectedNumbers,
      email,  // Return the email in the response as well
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error creating campaign.' });
  }
});



// API endpoint to get all campaign names
app.get('/api/campaigns1', async (req, res) => {
  try {
    // Extract the email from the request headers or query parameters
    const userEmail = req.headers['x-user-email'] || req.query.email;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required.' });
    }

    // Query to fetch campaigns for the specific user email
    const result = await client.query(
      'SELECT campaign_id, campaign_name, created_at FROM campaigns WHERE email = $1',
      [userEmail]
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        campaigns: result.rows, // Return filtered campaigns array
      });
    } else {
      res.status(404).json({ message: 'No campaigns found for the given email.' });
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns.' });
  }
});


app.get('/api/campaigns2', async (req, res) => {
  try {
    // Get the user email from localStorage or wherever it's stored
    const userEmail = req.headers['user-email'];  // Assuming the email is passed in headers

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Query the database with parameterized query to avoid SQL injection
    const result = await client.query(
      `SELECT campaign_id, campaign_name, created_at 
       FROM campaigns
       WHERE email = $1 
       ORDER BY created_at DESC`, 
      [userEmail]  // Pass the email as parameter to the query
    );

    // Respond with the campaigns data
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns.' });
  }
});


app.put('/api/campaigns/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  const { updatedDatetime } = req.body;

  try {
    const utcDatetime = moment(updatedDatetime).utc().local().format(); // Ensure UTC format

    await client.query(
      `UPDATE campaigns SET created_at = $1 WHERE campaign_id = $2`,
      [utcDatetime, campaignId]
    );

    res.status(200).json({ message: 'Campaign updated successfully!' });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Error updating campaign.' });
  }
});
app.get('/api/campaignDetails', async (req, res) => {
  const { campaignId } = req.query;

  if (!campaignId) {
    return res.status(400).json({ error: "Missing campaignId" });
  }

  try {
    const query = `
      WITH unnested_numbers AS (
        SELECT 
          unnest(c.selected_numbers::text[]) AS campaign_number,
          REPLACE(REPLACE(REPLACE(SUBSTRING(unnest(c.selected_numbers::text[]) FROM '([0-9]{10})$'), ' ', ''), '-', ''), '(', '') AS normalized_campaign_number
        FROM campaigns c
        WHERE c.campaign_id = $1
      )
      SELECT 
        unnested_numbers.campaign_number,
        unnested_numbers.normalized_campaign_number,
        ct.phone AS contact_phone,
        REPLACE(REPLACE(REPLACE(SUBSTRING(ct.phone FROM '([0-9]{10})$'), ' ', ''), '-', ''), '(', '') AS normalized_contact_phone,
        ct.customer_name,
        ct.name AS contact_name, -- Include name here
        ct.country_code
      FROM unnested_numbers
      LEFT JOIN contacts ct 
        ON unnested_numbers.normalized_campaign_number = REPLACE(REPLACE(REPLACE(SUBSTRING(ct.phone FROM '([0-9]{10})$'), ' ', ''), '-', ''), '(', '')
    `;

    const result = await client.query(query, [campaignId]);

    console.log("Query result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No matches found for this campaign" });
    }

    // Process the data
    const data = result.rows.map(row => ({
      campaignNumber: row.campaign_number || 'Unknown',
      contactPhone: row.contact_phone || 'Unknown',
      normalizedCampaignNumber: row.normalized_campaign_number || 'Unknown',
      normalizedContactPhone: row.normalized_contact_phone || 'Unknown',
      customerName: row.customer_name || 'Unknown',
      contactName: row.contact_name || 'Unknown', // Process the name column
      countryCode: row.country_code || ''
    }));

    // Extract arrays for response
    const selectedNumbers = data.map(d => d.campaignNumber);
    const customerNames = data.map(d => d.customerName);
    const contactNames = data.map(d => d.contactName); // Add contactNames
    const countryCodes = data.map(d => d.countryCode);
    const normalizedCampaignNumbers = data.map(d => d.normalizedCampaignNumber);
    const normalizedContactPhones = data.map(d => d.normalizedContactPhone);

    console.log("Processed campaign data:", {
      selectedNumbers,
      customerNames,
      contactNames, // Log the contact names
      countryCodes,
      normalizedCampaignNumbers,
      normalizedContactPhones
    });

    res.json({
      selectedNumbers,
      customerNames,
      contactNames, // Include in the response
      countryCodes,
      normalizedCampaignNumbers,
      normalizedContactPhones
    });
  } catch (err) {
    console.error("Error fetching campaign details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post('/api/save-message', async (req, res) => {
  const { campaignId, message } = req.body;

  // Validate the input
  if (!campaignId || !message) {
    return res.status(400).json({ error: 'Campaign ID and message are required.' });
  }

  try {
    // Insert or update the message if the campaign_id already exists
    const query = `
      INSERT INTO campaign_messages (campaign_id, message)
      VALUES ($1, $2)
      ON CONFLICT (campaign_id) 
      DO UPDATE SET message = EXCLUDED.message
      RETURNING id;
    `;
    
    const result = await client.query(query, [campaignId, message]);

    // Respond with success and the new/updated message ID
    res.status(201).json({
      success: true,
      message: 'Message saved successfully.',
      messageId: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'An error occurred while saving the message.' });
  }
});
app.get("/api/template-categories", async (req, res) => {
  try {
    // Query to fetch distinct message categories
    const query = `
      SELECT DISTINCT message_category
      FROM public.messages
      ORDER BY message_category;
    `;
    
    // Execute the query using the existing client
    const result = await client.query(query);

    // Check if we got any categories
    if (result.rows.length > 0) {
      // Send the list of categories as the response
      res.json({ categories: result.rows.map(row => row.message_category) });
    } else {
      res.status(404).json({ error: "No categories found" });
    }
  } catch (error) {
    console.error("Error fetching template categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/messages", async (req, res) => {
  const { category } = req.query; // Get the category from query params

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    // Query to fetch messages for the selected category
    const result = await client.query(
      "SELECT message_line_text FROM public.messages WHERE message_category = $1 ORDER BY lno",
      [category]
    );

    // Check if messages exist
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No messages found for this category" });
    }

    // Return the messages
    res.json({ messages: result.rows.map(row => row.message_line_text) });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "An error occurred while fetching messages" });
  }
});
app.post('/api/triggerCampaign', async (req, res) => {
  const { campaignId, contacts, userEmail } = req.body;

  console.log('Received request:', req.body);  // Log the full incoming request body

  if (!campaignId || contacts.length === 0 || !userEmail) {
    return res.status(400).json({ message: 'Campaign ID, contacts, and user email are required.' });
  }

  try {
    // Fetch the message template for the campaign
    const campaignMessageQuery = 'SELECT message FROM campaign_messages WHERE campaign_id = $1';
    const result = await client.query(campaignMessageQuery, [campaignId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No message found for the campaign.' });
    }

    const messageTemplate = result.rows[0].message;
    console.log(`Message Template: ${messageTemplate}`);  // Log the fetched message template

    // Iterate through the contacts and send SMS
    const sendSmsPromises = contacts.map(async (contact, index) => {
      let { country_code, phone } = contact;

      console.log(`Processing contact ${index + 1}:`, contact);  // Log each contact before processing

      // Ensure the country code has '+' at the start (for formatting purposes only)
      if (!country_code.startsWith('+')) {
        country_code = `+${country_code}`;
      }

      // Clean the phone number to remove any spaces or country code part
      phone = phone.replace(/\s+/g, '');  // Remove spaces if any
      if (phone.startsWith(country_code)) {
        phone = phone.slice(country_code.length);  // Remove country code from the phone number if present
      }

      console.log(`Cleaned phone number: ${phone}`);  // Log the cleaned phone number

      // Construct the full phone number by combining country code and phone number
      const fullPhoneNumber = `${country_code}${phone}`;
      console.log(`Full phone number: ${fullPhoneNumber}`);  // Log the full phone number

      // Query for the contact name using only the phone number (no country code)
      const contactQuery = 'SELECT name FROM contacts WHERE phone = $1';
      const contactResult = await client.query(contactQuery, [phone]);

      if (contactResult.rows.length === 0) {
        console.log(`Contact not found: ${fullPhoneNumber}`);  // Log when contact is not found
        return; // Skip if contact is not found
      }

      const contactName = contactResult.rows[0].name;
      console.log(`Contact name found: ${contactName}`);  // Log the contact name found

      const personalizedMessage = messageTemplate.replace('[Name]', contactName);
      console.log(`Personalized message: ${personalizedMessage}`);  // Log the personalized message

      try {
        const message = await twilioClient.messages.create({
          to: fullPhoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER,
          body: personalizedMessage,
        });

        console.log(`SMS sent to ${fullPhoneNumber}: ${message.sid}`);  // Log the successful SMS sending

        // Insert SMS details into the sent_campaign_sms table
        const insertQuery = `
          INSERT INTO sent_campaign_sms (
            campaign_id, email, phone, message_sid, message, "from", sent_at
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
          campaignId,
          userEmail,
          fullPhoneNumber,
          message.sid,
          personalizedMessage,
          process.env.TWILIO_PHONE_NUMBER, // The Twilio phone number used to send the SMS
          new Date().toISOString(),
        ];

        await client.query(insertQuery, values);

        console.log(`SMS details stored for ${fullPhoneNumber}`);
      } catch (err) {
        console.error(`Failed to send SMS to ${fullPhoneNumber}:`, err);  // Log any error during SMS sending
      }
    });

    await Promise.all(sendSmsPromises);
    res.status(200).json({ message: 'Campaign triggered successfully.' });
  } catch (error) {
    console.error('Error triggering campaign:', error);  // Log any error in the API processing
    res.status(500).json({ message: 'Error triggering campaign.' });
  }
});

app.post('/api/getReceivedMessages', async (req, res) => {
  try {
    // Fetch messages from Twilio
    const messages = await twilioClient.messages.list({ limit: 2000 });

    // Filter only received messages (where the direction is inbound)
    const receivedMessages = messages.filter((message) => message.direction === 'inbound');

    // Insert each received message into the database
    for (const message of receivedMessages) {
      try {
        // Insert the message into the database
        await client.query(
          `INSERT INTO received_messages 
          (from_phone_number, message_body, date_received, status) 
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (from_phone_number, date_received) DO NOTHING`,
          [
            message.from,
            message.body,
            message.dateSent || new Date(),
            message.status,
          ]
        );
      } catch (insertError) {
        console.error('Error saving message:', insertError);
      }
    }

    res.status(200).json({
      success: true,
      message: `${receivedMessages.length} received messages processed and stored.`,
    });
  } catch (err) {
    console.error('Error fetching or storing received messages:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.get('/api/getSentCampaignSms', async (req, res) => {
  try {
    const { email } = req.query;

    // Validate that email is provided
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "A valid email is required to fetch sent campaign SMS records.",
      });
    }

    // Build the query to fetch sent SMS data and join with contacts to get the name
    const query = `
      SELECT 
        sc.campaign_id, 
        sc.phone, 
        sc.message_sid, 
        sc.message, 
        sc."from", 
        sc.sent_at,
        c.name AS contact_name
      FROM 
        sent_campaign_sms sc
      LEFT JOIN 
        contacts c
      ON 
        c.country_code || c.phone = sc.phone  -- Match phone by concatenating country_code and phone
      WHERE 
        sc.email = $1
      ORDER BY 
        sc.sent_at DESC
    `;

    // Execute the query
    const { rows } = await client.query(query, [email.trim()]);

    // Respond with the fetched data
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('Error fetching sent SMS data:', err);

    // Handle server errors
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching sent SMS records.',
    });
  }
});
app.get('/api/getReceivedMessages', async (req, res) => {
  try {
    const { email } = req.query;

    // Validate that email is provided
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "A valid email is required to fetch received messages.",
      });
    }

    // Build the query to fetch received messages and join with contacts to get the name, campaign_id, and from from sent_campaign_sms table
    const query = `
      SELECT 
        rm.from_phone_number, 
        rm.message_body, 
        rm.status, 
        TO_CHAR(rm.date_received, 'DD MM YYYY HH24:MI:SS') AS date_received, 
        c.name AS contact_name,
        sc.campaign_id,         -- Include campaign_id from the sent_campaign_sms table
        sc.from AS sender_from   -- Get the 'from' column from the sent_campaign_sms table
      FROM 
        received_messages rm
      LEFT JOIN 
        contacts c 
      ON 
        c.country_code || c.phone = rm.from_phone_number  -- Match phone by concatenating country_code and phone
      LEFT JOIN 
        sent_campaign_sms sc
      ON 
        sc.phone = rm.from_phone_number AND sc.email = $1  -- Join sent_campaign_sms to fetch campaign_id and 'from' based on the phone number and email
      WHERE 
        rm.from_phone_number IN (
          SELECT DISTINCT sc.phone
          FROM sent_campaign_sms sc
          WHERE sc.email = $1
        )
      ORDER BY 
        rm.date_received DESC
    `;

    // Execute the query with the email to filter the phone numbers
    const { rows } = await client.query(query, [email.trim()]);

    // Respond with the fetched data
    res.status(200).json({
      success: true,
      messages: rows,
    });
  } catch (err) {
    console.error('Error fetching received messages:', err);

    // Handle server errors
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching received messages.',
    });
  }
});
app.get('/api/check-role', async (req, res) => {
  try {
    // Get the email from request headers
    const userEmail = req.headers['x-user-email'];

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required.' });
    }

    // Query the database for the user's role
    const query = `SELECT user_role FROM public.users WHERE email = $1`;
    const result = await client.query(query, [userEmail]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { user_role } = result.rows[0];
    if (user_role === 'Product Owner' || user_role === 'Licensed Owner') {
      return res.status(200).json({ access: true, message: 'Access granted.' });
    }

    return res.status(403).json({ access: false, message: 'Access denied. Role does not permit access to the Users tab.' });
  } catch (error) {
    console.error('Error checking user role:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
app.post('/api/create-user', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if all required fields are provided
  if (!username || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    // Check if the email already exists in the database
    const emailCheckQuery = 'SELECT * FROM users WHERE email = $1';
    const emailCheckResult = await client.query(emailCheckQuery, [email]);

    if (emailCheckResult.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email is already in use' });
    }

    // Insert the new user into the database (updated column name to user_role)
    const insertUserQuery = `
      INSERT INTO users (username, email, password, user_role)
      VALUES ($1, $2, $3, $4) RETURNING id, username, email, user_role
    `;
    const values = [username, email, password, role];

    const insertResult = await client.query(insertUserQuery, values);

    const newUser = insertResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'An error occurred while creating the user' });
  }
});
















































// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
