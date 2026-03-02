<div align="center">

# 🤖 AuraPilot
### Personalized AI Assistant with Semantic Memory

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**AuraPilot** is a production-grade, full-stack AI assistant that remembers you.  
Built with a microservices architecture, it combines LLM-powered conversations with  
long-term semantic memory, real-time sentiment analysis, and secure multi-user authentication.

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🧠 Overview

AuraPilot goes beyond a typical chatbot. Most AI assistants forget you the moment a session ends. AuraPilot solves this by storing every conversation as a **vector embedding** in Qdrant — a high-performance vector database — and semantically retrieving relevant memories during future conversations.

This means the assistant gets smarter and more personalized the more you use it.

> "Built as a Final Year Engineering Project to demonstrate end-to-end full-stack development, AI integration, microservices design, and cloud deployment."

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                      CLIENT                         │
│           React + TypeScript + TailwindCSS          │
└───────────────────────┬─────────────────────────────┘
                        │ REST API (HTTP)
┌───────────────────────▼─────────────────────────────┐
│                   BACKEND API                        │
│         Node.js + Express + MongoDB + JWT           │
└───────────────────────┬─────────────────────────────┘
                        │ Internal HTTP
┌───────────────────────▼─────────────────────────────┐
│                   AI SERVICE                         │
│     Python FastAPI + LangChain + Groq (LLaMA 3)     │
│         VADER Sentiment + Sentence Embeddings        │
└──────────┬────────────────────────┬─────────────────┘
           │                        │
  ┌────────▼───────┐     ┌──────────▼──────────┐
  │    Qdrant DB   │     │      MongoDB         │
  │ Vector Memory  │     │  Users + Chat Logs   │
  └────────────────┘     └─────────────────────┘
```

All services are containerized and orchestrated using **Docker Compose**.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework with type safety |
| Vite | Lightning-fast build tool |
| TailwindCSS | Utility-first styling |
| Axios | HTTP client for API calls |
| React Router DOM | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | User data & chat history |
| JWT (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing |

### AI Service
| Technology | Purpose |
|---|---|
| Python FastAPI | High-performance AI microservice |
| LangChain | LLM orchestration framework |
| Groq API (LLaMA 3) | Ultra-fast LLM inference |
| Qdrant | Vector database for semantic memory |
| sentence-transformers | Text → vector embeddings |
| VADER Sentiment | Real-time sentiment analysis |

### DevOps
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization & orchestration |
| Render | Cloud deployment (backend + AI) |
| Vercel | Frontend deployment |
| MongoDB Atlas | Cloud database |
| Qdrant Cloud | Managed vector database |

---

## ✨ Features

- 🧠 **Semantic Long-Term Memory** — Stores conversations as vector embeddings; retrieves contextually relevant memories using cosine similarity search via Qdrant
- 💬 **Sentiment-Aware Responses** — VADER sentiment analysis detects user mood in real time and adjusts the AI's tone dynamically (warm, empathetic, or neutral)
- 🎭 **Switchable AI Personas** — Choose between Friendly, Professional, Witty, or Empathetic personalities mid-conversation
- 👤 **Secure Multi-User Auth** — JWT-based registration/login with bcrypt password hashing and per-user isolated memory
- 📜 **Persistent Chat History** — All conversations stored in MongoDB; resumable across sessions
- 🗑️ **Memory Management** — Users can clear both chat history and vector memory with one click
- 🐳 **Fully Dockerized** — 5-service Docker Compose setup with inter-service networking and persistent volumes
- ⚡ **Real-time Streaming Feel** — Groq inference is up to 10x faster than standard OpenAI calls

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node --version    # v20+
python --version  # 3.10+
docker --version  # 24+
git --version
```

You'll also need a free API key from:
- 🔑 [Groq Console](https://console.groq.com) — for LLM inference

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/ixhitva/AuraPilot--A-personalised-AI-assistant.git
cd AuraPilot--A-personalised-AI-assistant
```

**2. Set up environment variables**

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/aurapilot
JWT_SECRET=your_generated_jwt_secret
AI_SERVICE_URL=http://localhost:8000
```

Create `ai-service/.env`:
```env
GROQ_API_KEY=your_groq_api_key
QDRANT_URL=http://localhost:6333
```

> 💡 Generate a secure JWT secret instantly:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

**3. Run with Docker (Recommended)**
```bash
docker-compose up --build
```
Visit `http://localhost:3000` 🎉

**4. Run Manually (without Docker)**
```bash
# Terminal 1 — AI Service
cd ai-service
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm install && npm run dev

# Terminal 3 — Frontend
cd frontend
npm install && npm run dev
```

---

## 📡 API Reference

### Auth Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login and get JWT token | ❌ |

### Chat Endpoints (`/api/chat`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/message` | Send message, get AI reply | ✅ |
| GET | `/history` | Fetch full chat history | ✅ |
| DELETE | `/history` | Clear chat + vector memory | ✅ |
| PUT | `/persona` | Switch AI persona | ✅ |

### AI Service Endpoints (Internal — port 8000)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Process message with memory + sentiment |
| GET | `/memory/{user_id}` | Retrieve stored memories |
| DELETE | `/memory/{user_id}` | Clear vector memory |
| GET | `/health` | Health check |

---

## 📁 Project Structure

```
AuraPilot/
│
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/index.ts        # Axios instance with JWT interceptor
│   │   ├── pages/
│   │   │   ├── Chat.tsx        # Main chat interface
│   │   │   ├── Login.tsx       # Login page
│   │   │   └── Register.tsx    # Registration page
│   │   └── App.tsx             # Router setup
│   ├── Dockerfile
│   └── package.json
│
├── backend/                    # Node.js + Express
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt
│   │   └── Chat.js             # Chat history schema
│   ├── routes/
│   │   ├── auth.js             # Register/Login routes
│   │   └── chat.js             # Chat + memory routes
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── server.js               # Express app entry point
│   ├── Dockerfile
│   └── package.json
│
├── ai-service/                 # Python FastAPI
│   ├── main.py                 # FastAPI app, LangChain, Qdrant
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml          # Full orchestration
└── README.md
```

---

## ☁️ Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | `https://aurapilot.vercel.app` |
| Backend | Render | `https://aurapilot-backend.onrender.com` |
| AI Service | Render | `https://aurapilot-ai.onrender.com` |
| MongoDB | MongoDB Atlas | Cloud cluster |
| Qdrant | Qdrant Cloud | Managed vector DB |

### Deploy Frontend to Vercel
```bash
# Update src/api/index.ts baseURL to your Render backend URL first
npm run build
# Push to GitHub → Import on vercel.com → Done ✅
```

### Deploy Backend + AI Service to Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set root directory to `backend/` or `ai-service/`
4. Add environment variables in Render dashboard
5. Deploy ✅

---

<div align="center">
  <sub>Built with ❤️ as a Final Year Engineering Project</sub>
</div>
