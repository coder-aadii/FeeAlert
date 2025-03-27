# FeeAlert

## Tagline
*Never Miss a Payment – Timely Fee Reminders via SMS and Email*

## Overview
FeeAlert is a comprehensive fee reminder system designed for yoga instructors, tutors, and small business owners to automate client payment reminders via SMS and email. This web-based tool allows you to manage clients and send automated reminders without requiring clients to install or register for anything.

## Features

- **SMS and Email Reminders**: Automatically send reminders via SMS and email based on configurable due dates
- **Admin Dashboard**: Manage client details and track fee due dates through an intuitive web interface
- **No Client Registration**: Clients receive reminders without having to sign up or install anything
- **Reminder Scheduling**: Set up custom reminder schedules (e.g., 3 days before due date, on due date)
- **Client Management**: Add, edit, and organize client information and payment schedules
- **Payment Tracking**: Monitor payment status and history for each client
- **Customizable Templates**: Personalize reminder messages for different client groups

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (optional) or JSON files for simple data storage
- **Scheduler**: node-cron for automated reminder jobs
- **Email Service**: Nodemailer with Gmail
- **SMS Service**: Options include:
  - Twilio (paid service with reliable delivery)
  - Gammu (free with your own SIM card)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (optional)
- Gmail account (for email notifications)
- SIM card or Twilio account (for SMS notifications)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/feealert.git
   cd feealert
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri_or_connection_string
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   SMS_PROVIDER=twilio_or_gammu
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

5. Set up Gmail App Password for Nodemailer (email reminders).

6. Set up your preferred SMS service (Twilio or Gammu).

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   # Or for development with auto-restart:
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
feealert/
├── backend/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── utils/      # Helper functions
│   │   └── App.js      # Main component
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

Let me know if you need further details or adjustments for any part of the project!
