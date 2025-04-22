# Rokosoko Backend

This is a Node.js/Express backend for the Rokosoko application, providing APIs for user authentication, profile management, and session handling. It uses MongoDB for data storage, Mongoose for schema management, Zod for request validation, and UploadThing for file uploads. The app is built with ES6+ modules and is optimized for serverless deployment (e.g., Vercel, AWS Lambda, Netlify Functions).

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
  - [Social Login](#social-login)
  - [Set Password](#set-password)
  - [Change Password](#change-password)
  - [Upload Profile Image](#upload-profile-image)
- [Serverless Deployment](#serverless-deployment)
- [Contributing](#contributing)

## Features
- **Social Login**: Authenticates users via Google or Facebook, storing session data with TTL expiration.
- **Password Management**: Sets and changes user passwords securely with bcrypt.
- **Profile Image Upload**: Uploads user profile images using UploadThing and stores file keys in MongoDB.
- **Session Management**: Manages user sessions with MongoDB TTL indexes for automatic cleanup.
- **Scalable Architecture**: Modular Express controllers with Zod validation and error handling.

## Tech Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **Zod**: Schema validation
- **UploadThing**: File upload service
- **ES6+ Modules**: Modern JavaScript syntax
- **serverless-http**: Serverless compatibility

## Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- UploadThing account and API keys
- Environment variables in `.env`:
  ```env
  MONGODB_URI=mongodb://localhost:27017/rokosoko
  UPLOADTHING_SECRET=your_uploadthing_secret
  UPLOADTHING_APP_ID=your_uploadthing_app_id
  PORT=5001