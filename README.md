# DevSwap - Skill Exchange Platform

A peer-to-peer skill exchange platform where users can teach what they know and learn what they need—**without money**.

## 🎯 Core Concept

DevSwap solves the problem of skill-sharing by:
- Allowing users to define skills they can teach
- Allowing users to list skills they want to learn
- Matching users based on compatible skill needs
- Creating a collaborative learning ecosystem

## 🏗️ Project Structure

```
DevSwap/
├── backend/              # Node.js + Express API
│   ├── config/          # Database configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth & custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Reusable services
│   ├── utils/           # Helper functions
│   ├── server.js        # Entry point
│   ├── package.json     # Dependencies
│   └── .env.example     # Environment variables template
│
├── frontend/            # React application
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context API
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   ├── utils/       # Helper functions
│   │   ├── App.js       # Main component
│   │   ├── App.css      # Styling
│   │   └── index.js     # Entry point
│   ├── package.json     # Dependencies
│   └── .env.example     # Environment variables
│
└── README.md            # This file
```

## ⚙️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt

### Frontend
- **Library**: React.js
- **Styling**: CSS (Tailwind ready)
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB URI and JWT secret

5. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start development server:
   ```bash
   npm start
   ```

## 🔄 Key Features

### 1. User Authentication
- Register & Login with email/password
- JWT-based sessions
- Secure password hashing with bcrypt

### 2. Profile Management
- Define skills you can teach (skillsOffered)
- List skills you want to learn (skillsWanted)
- Beginner Mode for new users

### 3. Skill Matching
- Automatic matching based on skill compatibility
- Find users who offer skills you want to learn
- View matched user profiles

### 4. User Matching Logic
```
If:
  User A wants: DSA
  User B offers: DSA
Then: MATCH ✓
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users

### Matches
- `GET /api/matches/find` - Find skill matches for current user
- `GET /api/matches/:userId` - Get details of a specific user

## 🔮 Future Enhancements

- [ ] Real-time chat (Socket.IO)
- [ ] Connection requests system
- [ ] Skill rating/reviews
- [ ] Notifications
- [ ] AI-based skill suggestions
- [ ] Session scheduling

## 🚢 Deployment

### Frontend
- Deploy to **Vercel** or Netlify
- Set `REACT_APP_API_URL` environment variable

### Backend
- Deploy to **Render**, Railway, or Heroku
- Configure MongoDB Atlas for production

## 📝 License

ISC

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests.

---

**Start learning. Start teaching. No money needed.** 🌟
