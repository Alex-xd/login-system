# Project Overview

This project is a full-stack authentication web system with many login methods, including registration, email with verification code login, Google login and Passkey login. Project use many technology and framework to make these function, and use Docker and Docker Compose to manage and run services.

# Technology and Framework Used

## Backend
- Framework: Node.js, Express  
- Language: JavaScript/TypeScript  
- Database: MongoDB (with Mongoose ODM)  
- Cache: Redis (for store short-time verification code)  
- Authentication Framework: Passport.js (for Google OAuth 2.0 authentication)  
- WebAuthn: @simplewebauthn/server (for Passkey authentication)  
- Email Service: Nodemailer (send verification code)  
- Password Encryption: bcrypt (password hash and verify)  
- Security Middleware: helmet (HTTP header security)  
- Session Management: express-session  
- Rate Limit: express-rate-limit (prevent brute force attack)  
- Token Generation: jsonwebtoken (JWT implementation)  
- Environment Variable: dotenv  

## Frontend
- Framework: React 19 (newest version)  
- Build Tool: Vite 6.x  
- Language: TypeScript  
- UI Library: Ant Design 5.x  
- State Management: Zustand 5.0.3 (lightweight state management, use persist middleware for save data)  
- HTTP Client: Axios  
- Router: React Router v7  
- WebAuthn: Native browser API (for Passkey function)  

# Architecture

![Architecture.png](./Architecture.png)

# How to run the project

1. Configure private environment variables in `.env` and `.env.docker` files:

   ```
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   EMAIL_USER
   EMAIL_PASS
   EMAIL_HOST
   EMAIL_PORT
   EMAIL_SECURE
   ```

2. Make sure your computer have docker and it running

3. Start project in project root directory with command

   ```bash
   docker-compose up --build
   ```

4. Visit `localhost:5173` on your browser

# How to reset the project

1. Stop the project with command

   ```bash
   docker-compose down
   ```

2. Remove the volume with command

   ```bash
   docker volume rm my-private-login_mongodb_data my-private-login_redis_data
   ```

3. Start the project with command

   ```bash
   docker-compose up --build
   ```

4. Visit `localhost:5173` on your browser


# Directory Description

```
/
├── auth-system/             # Backend service directory  
├── login-app/              # Frontend web-ui directory  
├── docker-compose.yml      # Docker config for development environment  
├── zap-report             # ZAP security test report
└── README.md               # Project documentation  
```

# Key File Description

**Backend Core Files**

- authController.ts: Core logic for various authentication methods
- passkeyController.ts: Handles WebAuthn-related authentication logic
- authMiddleware.ts: Middleware for JWT verification and other authentication
- response.ts: Utility for unified API response format

**Frontend Core Files**
- SignIn.tsx: Main page implementing multiple login methods
- webAuthnUtils.ts: Utility functions for WebAuthn operations
- request.ts: Wrapped HTTP request utility
- OTPInput.tsx: Verification code input component

**Docker-Related Files**
- docker-compose.yml: Service orchestration for development environment

# Containerized Deployment

The system uses Docker and Docker Compose for containerized deployment, including the following services:

- auth-system: Backend service (port 5009)
- login-app: Frontend service (port 5173 in development, port 80 in production)
- mongodb: Database service (port 27017)
- redis: Cache service (port 6379)

# Security Test Report

Security scanning and simulated attacks were performed using `ZAP`.
The related reports are in the `zap-report/` directory.
Open the HTML file to view the results.