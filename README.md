🚀 Authentication & Project Management Backend

A scalable backend API built using the MERN stack backend ecosystem with JWT Authentication, Role-Based Authorization, Project Management, Task Management, and Subtask support.

📌 Features
🔐 Authentication System
User Registration
User Login
JWT Authentication
Access Token & Refresh Token
Protected Routes
Password Change
Forgot Password
Reset Password
Email Verification
Secure Cookie Handling
👥 Authorization
Role-Based Access Control
Admin
Project Admin
Member

Users can only perform actions based on their roles inside projects.

📁 Project Management
Create Project
Update Project
Delete Project
Fetch All Projects
Fetch Single Project
Add Members to Project
Remove Members
Update Member Roles
✅ Task Management

Each project can contain multiple tasks.

Task Features
Create Task
Update Task
Delete Task
Assign Task to Members
Task Status Management
Task Status
Todo
In Progress
Done
📝 Subtask Management

Each task can contain multiple subtasks.

Subtask Features
Create Subtask
Update Subtask
Mark Subtask Complete
Delete Subtask
🛠️ Tech Stack
Backend
Node.js
Express.js
MongoDB
Mongoose
Authentication & Security
JWT
bcrypt
Cookies
Validation
express-validator
📂 Folder Structure
src/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── validators/
├── utils/
├── db/
└── index.js
🗃️ Database Models
User Model
username
email
password
refreshToken
emailVerificationToken
Project Model
name
description
createdBy
ProjectMember Model
user
project
role
Task Model
title
description
project
assignedTo
assignedBy
status
Subtask Model
title
task
isCompleted
🔑 JWT Flow
Login Flow
User logs in
Server verifies credentials
Access Token generated
Refresh Token generated
Tokens sent to client
Protected routes verified using middleware
🔒 Protected Route Flow
Authorization: Bearer ACCESS_TOKEN

Middleware verifies token and attaches user to request object.

📡 API Examples
Register User
POST /api/v1/users/register
Login User
POST /api/v1/users/login
Create Project
POST /api/v1/projects
Create Task
POST /api/v1/tasks
Create Subtask
POST /api/v1/subtasks
⚙️ Installation
Clone Repository
git clone <repo-url>
Install Dependencies
npm install
Setup Environment Variables

Create .env

PORT=8000

MONGODB_URI=your_mongodb_uri

ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=10d
Run Server
npm run dev
📬 Testing APIs

Use:

Postman
Thunder Client

For protected routes:

Authorization: Bearer TOKEN
🧠 Concepts Used
MVC Architecture
REST APIs
Authentication
Authorization
Middleware
MongoDB Relationships
Aggregation Pipelines
Error Handling
Async Handler Pattern
🚀 Future Improvements
File Uploads
Notifications
Real-time Chat
Activity Logs
Team Invitations
Task Comments
Due Dates
Socket.IO Integration
👨‍💻 Author

Vishnu

MERN Stack & Backend Developer
