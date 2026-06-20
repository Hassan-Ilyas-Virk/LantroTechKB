# LantroTech Knowledge Base

An intelligent, AI-powered internal knowledge base and Q&A platform tailored for LantroTech employees. The application allows team members to ask questions, share answers, search the knowledge base, and earn reputation points.

## 🚀 Features

- **Ask & Answer**: Create rich-text questions and answers.
- **AI Verification**: Automatically analyzes and verifies answers using AI, flagging them as "AI Verified" if accurate.
- **Reputation System**: Earn points through upvotes and correct answers.
- **Admin Dashboard**: Powerful analytics tracking knowledge gaps, trending topics, and auto-generating FAQs based on missing knowledge.
- **Responsive Design**: Fully mobile-friendly interface with an off-canvas drawer and dynamic glassmorphism UI.
- **Interactive UI**: Custom styling with deep teal and yellow branding, complete with mouse-driven parallax effects on the authentication pages.

## 💻 Tech Stack

- **Frontend**: React (Vite), React Router, Context API, Vanilla CSS (Glassmorphism design).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **AI Integration**: Google Gemini API for answer verification and FAQ generation.
- **Deployment**: Vercel-ready (Serverless Node environment configured via `vercel.json`).

## 🛠️ Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Google Gemini API Key

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hassan-Ilyas-Virk/LantroTechKB.git
   cd LantroTechKB
   ```

2. **Install Dependencies:**
   Install dependencies for both the root, client, and server.
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Application:**
   Start both the frontend and backend servers concurrently:
   ```bash
   npm run dev
   ```
   - Client runs on `http://localhost:5173`
   - Server runs on `http://localhost:5001`

### Demo Accounts
- **Admin**: `admin@lantrotech.com` / `admin123`
- **Employee**: `sarah@lantrotech.com` / `password123`

## 🌍 Deployment (Vercel)

The repository is configured to be deployed seamlessly on Vercel. 
Simply import the project from GitHub, set your environment variables, and Vercel will automatically build the React frontend and deploy the Express API via serverless functions using the provided `vercel.json` routing rules.
