Upreach

Upreach is a robust SMS application designed for use in U.S. election campaigns. It helps campaign teams manage contacts, match phone numbers, and send bulk SMS messages efficiently using the Twilio SMS API.

Features

Campaign management

Bulk SMS sending

Contacts filtering and matching

User-friendly interface

Technologies Used

Frontend: React.js

Backend: Node.js/Express.js

Database: PostgreSQL

SMS API: Twilio

Folder Structure

Backend

b
├── uploads
├── .env
├── package.json
├── package-lock.json
├── Server.js
└── j.js

Frontend

f
├── public
├── src
│   ├── components
│   │   ├── Accounts
│   │   ├── Campaigns
│   │   ├── Contacts
│   │   ├── Dashboard
│   │   ├── Login
│   │   ├── ManageLogs
│   │   ├── Side
│   │   └── TabPanel
│   ├── Users
│   ├── zips
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   └── reportWebVitals.js
├── .gitignore
├── package.json
└── package-lock.json

Installation and Setup

Prerequisites

Node.js (v16 or higher)

PostgreSQL (v13 or higher)

Steps

Clone the repository:

git clone https://github.com/your-username/upreach.git
cd upreach

Restore the Database:

Open pgAdmin and create a database named upreach_db.

Right-click the database, select Restore, and use the provided Upreach Latest Backup file.

Backend Setup:

cd b
npm install
node Server.js

Frontend Setup:

cd ../f
npm install
npm start

Open your browser and navigate to http://localhost:3000.

Environment Variables

Create a .env file in the b directory with the following content:

DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=upreach_db
DB_PORT=5432
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret

Usage

Start the backend: node Server.js

Start the frontend: npm start in the f directory.

License

This project is licensed under the MIT License.

