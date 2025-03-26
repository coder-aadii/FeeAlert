# FeeAlert

### Tagline
*Never Miss a Payment – Timely Fee Reminders via SMS and Email*

### Overview
FeeAlert is a fee reminder system designed for yoga instructors and small business owners to remind clients about upcoming fee payments via SMS and email. This web-based tool allows you to manage clients and send automated reminders without requiring clients to install or register for anything.

### Features
- **SMS and Email Reminders**: Automatically send reminders via SMS and email based on due dates.
- **Admin Dashboard**: Manage client details and track fee due dates through a simple web interface.
- **No Client Registration**: Clients receive reminders without having to sign up or install anything.
- **Unlimited SMS**: Utilize your Jio SIM for sending free SMS reminders.

### Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (optional) or JSON files for simple data storage
- **Scheduler**: node-cron for automated reminder jobs
- **Email**: Nodemailer with Gmail
- **SMS**: Gammu or alternative SMS service

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/feealert.git
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. Set up Gmail App Password for Nodemailer (email reminders).

4. Set up Gammu for SMS reminders.

### Usage

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

### Contribution
Feel free to fork the repository and contribute with new features, bug fixes, or improvements.

### License
MIT License
```

---

Let me know if you need further details or adjustments for any part of the project!