# Exam App Backend (Node.js + Express + MongoDB) — Student Module

A production-ready backend for a student-side exam-taking application. It provides secure JWT authentication, randomized exam start, server-side timing and scoring, and results retrieval.

## 🚀 Features

- **JWT Authentication** with httpOnly cookies
- **Register, Login, Me, Logout** endpoints
- **Start Exam** with randomized MCQs and frozen question set per attempt
- **Submit Exam** with server-side scoring (no correct answers leaked)
- **Get Submission Results** 
- **Security Features**: Validation (Zod), security headers (Helmet), CORS, rate limiting
- **Seed Script** with 1 exam template and 50 sample questions
- **Postman Examples** for every controller/endpoint

> **Scope**: Student module only. No admin UI, no question upload UI, no analytics, no proctoring.

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: jsonwebtoken, bcryptjs, cookie-parser
- **Validation & Security**: zod, helmet, cors, express-rate-limit, morgan
- **Environment**: dotenv
- **Development**: nodemon

## 📁 Project Structure

```
server/
  src/
    app.js
    config/
      db.js
      env.js
    controllers/
      authController.js
      examController.js
      submissionController.js
      submissionStateController.js   # optional
    middlewares/
      auth.js
      error.js
      validate.js
    models/
      User.js
      Question.js
      Exam.js
      Submission.js
    routes/
      auth.routes.js
      exams.routes.js
      submissions.routes.js
    scripts/
      seed.js
    validations/
      auth.schemas.js
      exam.schemas.js
  .env.example
  package.json
```


## 📋 Requirements

- Node.js 18+
- MongoDB (local or Atlas)

## ⚡ Installation

1. **Clone and install**
   ```bash
   cd server
   npm install
   ```

2. **Environment variables**
   
   Copy `.env.example` to `.env` and fill values:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/examapp
   JWT_SECRET=replace_with_long_random_string
   JWT_EXPIRES_IN=1d
   CORS_ORIGIN=http://localhost:5173
   COOKIE_SECURE=false
   NODE_ENV=development
   ```

3. **Seed database**
   ```bash
   npm run seed
   ```

4. **Start server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Health check**
   ```bash
   GET http://localhost:4000/health → { "ok": true }
   ```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/examapp` |
| `JWT_SECRET` | Strong secret for signing JWTs | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:5173` |
| `COOKIE_SECURE` | HTTPS required for cookies | `false` (dev), `true` (production) |
| `NODE_ENV` | Environment | `development` or `production` |

## 📊 Data Models

### User
- `name`: String
- `email`: String (unique)
- `passwordHash`: String
- `timestamps`

### Question
- `text`: String
- `options`: [String] (2–10; typical 4)
- `correctIndex`: Number (0-based)
- `tags`: [String] (optional)
- `difficulty`: 'easy' | 'medium' | 'hard' (optional)
- `isActive`: Boolean
- `timestamps`

### Exam (template)
- `title`: String
- `durationSeconds`: Number (e.g., 1800)
- `totalQuestions`: Number (e.g., 20)
- `isActive`: Boolean
- `timestamps`

### Submission (attempt)
- `userId`: ObjectId (User)
- `examId`: ObjectId (Exam)
- `questionIds`: [ObjectId] (Question; frozen set)
- `answers`: [{ questionId, selectedIndex }]
- `score`: Number (nullable until finalized)
- `startedAt`: Date
- `submittedAt`: Date (nullable)
- `status`: 'started' | 'submitted' | 'expired'
- `timestamps`

**Indexes:**
- `User.email` unique
- `Submission.userId`, `Submission.status` indexed

## 🔒 Security Features

- **Password hashing**: bcryptjs (10–12 rounds)
- **JWT**: httpOnly cookie, SameSite=strict, Secure in production
- **Helmet**: security headers
- **CORS**: restrict to frontend origin, credentials enabled
- **Rate limit**: login/register (default 10req/min)
- **Validation**: Zod schemas on all inputs
- **Server-side scoring**: No correct answers leaked to clients
- **Time enforcement**: Server enforces time window; client timers are UX only

## 🌐 API Reference

**Base URL**: `http://localhost:4000/api`

### Auth Endpoints
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Exam Endpoints
- `POST /exams/start`
- `POST /exams/submit`

### Submission Endpoints
- `GET /submissions/:id`
- `GET /submissions/:id/state` (optional convenience for remainingSeconds)

> **Notes**: 
> - Auth uses httpOnly cookies. Ensure client sends credentials (`withCredentials: true`).
> - All protected endpoints require an active session (cookie set from login).

## 📚 Detailed API Documentation

### Auth Controller

#### Register
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test.user@example.com",
  "password": "Passw0rd!"
}
```

**Response:**
```json
{
  "message": "Registered",
  "user": { 
    "id": "...", 
    "name": "Test User", 
    "email": "test.user@example.com" 
  }
}
```

#### Login
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "Passw0rd!"
}
```

**Response:**
```json
{
  "message": "Logged in",
  "user": { 
    "id": "...", 
    "name": "Test User", 
    "email": "test.user@example.com" 
  }
}
```

#### Get Current User
```http
GET {{base_url}}/auth/me
```

**Response:**
```json
{
  "user": { 
    "_id": "...", 
    "name": "Test User", 
    "email": "test.user@example.com" 
  }
}
```

#### Logout
```http
POST {{base_url}}/auth/logout
```

**Response:**
```json
{ "message": "Logged out" }
```

### Exam Controller

#### Start Exam
```http
POST {{base_url}}/exams/start
Content-Type: application/json

{
  "examId": "PUT_YOUR_EXAM_ID"
}
```

**Response:**
```json
{
  "submissionId": "...",
  "durationSeconds": 1800,
  "questions": [
    { 
      "_id": "...", 
      "text": "...", 
      "options": ["A", "B", "C", "D"] 
    }
  ]
}
```

#### Submit Exam
```http
POST {{base_url}}/exams/submit
Content-Type: application/json

{
  "submissionId": "{{submissionId}}",
  "answers": [
    { 
      "questionId": "{{firstQuestionId}}", 
      "selectedIndex": 1 
    }
  ]
}
```

**Response:**
```json
{
  "submissionId": "...",
  "score": 1,
  "total": 20,
  "status": "submitted",
  "timeExpired": false
}
```

### Submission Controller

#### Get Submission Result
```http
GET {{base_url}}/submissions/{{submissionId}}
```

**Response:**
```json
{
  "submissionId": "...",
  "score": 8,
  "total": 20,
  "status": "submitted",
  "startedAt": "2025-08-19T10:05:00.000Z",
  "submittedAt": "2025-08-19T10:25:00.000Z"
}
```

#### Get Submission State (Optional)
```http
GET {{base_url}}/submissions/{{submissionId}}/state
```

**Response:**
```json
{
  "submissionId": "...",
  "status": "started",
  "remainingSeconds": 1257
}
```

## 🧪 cURL Examples

### Auth
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test.user@example.com","password":"Passw0rd!"}'

# Login (save cookie)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test.user@example.com","password":"Passw0rd!"}' \
  -c cookies.txt

# Get current user
curl http://localhost:4000/api/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:4000/api/auth/logout -b cookies.txt
```

### Exams
```bash
# Start exam
curl -X POST http://localhost:4000/api/exams/start \
  -H "Content-Type: application/json" \
  -d '{"examId":"<EXAM_ID>"}' \
  -b cookies.txt

# Submit exam
curl -X POST http://localhost:4000/api/exams/submit \
  -H "Content-Type: application/json" \
  -d '{"submissionId":"<SUB_ID>","answers":[{"questionId":"<QID>","selectedIndex":1}]}' \
  -b cookies.txt
```

### Submissions
```bash
# Get submission result
curl http://localhost:4000/api/submissions/<SUBMISSION_ID> -b cookies.txt
```

## ✅ Validation

### Zod Schemas

**Auth:**
- `register`: { name (2–100), email, password (>=8) }
- `login`: { email, password }

**Exam:**
- `start`: { examId: ObjectId string }
- `submit`: { submissionId: ObjectId string, answers: [{ questionId: ObjectId string, selectedIndex: int >=0 }] }
- `submissionId` param: ObjectId string

Invalid inputs return `400` with a structured error object.

## 🚫 Error Handling

| Status Code | Description |
|-------------|-------------|
| `400` | Validation error, already finalized, insufficient questions, etc. |
| `401` | Missing/invalid auth token |
| `403` | Forbidden (submission not owned by user) |
| `404` | Not found (submission/exam) |
| `500` | Server error (generic message in production) |

**Error Response Format:**
```json
{ 
  "error": { 
    "message": "...", 
    "details": "..." 
  } 
}
```

## 🔧 Development Scripts

```bash
npm run dev    # Start with nodemon
npm start      # Start Node
npm run seed   # Seed exam and questions
```

## 🌱 Seeding

The seed script:
1. Clears existing Exams and Questions
2. Creates one Exam:
   - title: "General MCQ"
   - durationSeconds: 1800
   - totalQuestions: 20
   - isActive: true
3. Inserts 50 demo questions with 4 options and random correctIndex

After seeding, find examId using your DB tool:
```javascript
// MongoDB Compass or mongosh
db.exams.findOne({}, { _id: 1 })
```

Use this examId in Postman (Start Exam).

## 💡 Implementation Notes & Best Practices

- **Source of truth**: The server enforces time and computes the score using the frozen questionIds in Submission
- **Security**: Do not send or store correctIndex client-side
- **Id normalization**: When scoring, always convert ObjectIds to strings before using them as map keys
- **Idempotency**: If submit is called twice, return the finalized result rather than re-scoring
- **CORS**: Ensure CORS origin matches your frontend, credentials enabled for cookie auth
- **Cookies**: In production, use secure cookies (requires HTTPS), SameSite=strict

## 🔍 Troubleshooting

### 401 on protected routes
- Ensure login succeeded and Postman is sending cookies (Cookies tab shows "token" for your domain)
- If using a browser client, set `withCredentials: true` on Axios and CORS `credentials: true` on server

### Start Exam fails with 400 "Not enough active questions"
- Seed may not have enough active questions. Re-run seed or check isActive flags

### Score is lower than expected
- Verify the client sends 0-based selectedIndex matching the displayed options order
- Confirm the payload includes all answered questions (inspect the POST /exams/submit body)
- Ensure you submit for the same submissionId you started

### Time not syncing
- Use the optional `/submissions/:id/state` endpoint to fetch remainingSeconds and status periodically

## 📄 License

This project is provided for evaluation and educational purposes. Adapt and extend as needed for production use.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Happy coding! 🚀**
