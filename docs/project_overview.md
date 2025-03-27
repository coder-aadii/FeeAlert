# FeeAlert Project Overview

## Project Structure
The project follows a typical full-stack application structure with separate frontend and backend directories.

```
.
├── backend/               # Node.js/Express backend
├── frontend/             # React frontend
└── src/                  # Additional source files
```

### Backend Structure
```
backend/
├── config/              # Configuration files
│   └── db.js           # Database configuration
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── emailController.js
│   ├── memberController.js
│   └── smsController.js
├── models/            # Database models
│   ├── adminModel.js
│   ├── clientModel.js
│   └── passwordResetTokenModel.js
├── scripts/          # Utility scripts
│   └── createAdmin.js
└── utils/           # Helper utilities
    ├── sendEmail.js
    └── sendSMS.js
```

### Frontend Structure
```
frontend/
├── public/          # Static files
└── src/
    ├── components/  # Reusable React components
    │   ├── EmailReminderForm.js
    │   ├── Footer.js
    │   ├── Navbar.js
    │   └── SMSReminderForm.js
    ├── pages/      # Page components
    │   ├── Alerts.js
    │   ├── ForgotPassword.js
    │   ├── Home.js
    │   ├── Login.js
    │   ├── MemberManagement.js
    │   └── Settings.js
    └── utils/     # Frontend utilities
        ├── api.js
        └── authService.js
```

## Key Components

### Backend Components
1. **Authentication System**
   - Handles user authentication and authorization
   - Includes password reset functionality
   - Managed by authController.js

2. **Member Management**
   - Handles member-related operations
   - Managed by memberController.js

3. **Communication Services**
   - Email notifications (emailController.js, sendEmail.js)
   - SMS notifications (smsController.js, sendSMS.js)

### Frontend Components
1. **Authentication Pages**
   - Login.js
   - ForgotPassword.js
   - ResetPassword.js

2. **Core Features**
   - EmailReminderForm.js and SMSReminderForm.js for sending reminders
   - MemberManagement.js for managing members
   - Alerts.js for handling notifications

3. **Common Components**
   - Navbar.js for navigation
   - Footer.js for footer content

## Architecture Overview
- Frontend: React-based single-page application
- Backend: Node.js/Express RESTful API
- Authentication: Custom authentication system with password reset capability
- Communication: Integrated email and SMS notification systems

## Main Features
1. User Authentication and Authorization
2. Member Management
3. Email Reminders
4. SMS Reminders
5. Settings Management
6. Password Reset Functionality

This project appears to be a fee reminder system that allows administrators to manage members and send notifications via email and SMS.