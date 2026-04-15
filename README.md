# BloggerSpotted

A full-stack blog platform where users can sign in with Google, write and manage blog posts, explore trending topics, and use AI-powered features like content summarization, blog enhancement, and image-to-blog generation.

## Features

- Google OAuth 2.0 login
- Create, edit, and delete blog posts organized by topic
- Trending topics sourced from live news
- AI summarization of blog posts
- AI-powered content enhancement
- AI blog generation from an uploaded image
- Share posts to Reddit and Twitter/X

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Auth | Google OAuth 2.0, Passport.js, express-session |
| AI | HuggingFace Inference API |
| News | NewsData.io API |
| Containerization | Docker |
| Hosting | AWS (S3, CloudFront, EC2) |

## Architecture

```
User
 │
 ▼
Amazon CloudFront (CDN + HTTPS)
 │
 ├── /* ──────────► S3 Bucket
 │                  (React build — static files)
 │
 └── /api/* ──────► EC2 t2.micro (Docker container)
                    (Node.js / Express — port 5000)
                     │
                     ├── MongoDB Atlas (database)
                     ├── HuggingFace API (AI features)
                     └── NewsData API (trending topics)
```

### Frontend

The React app is built using Vite and compiled into static files. These are uploaded to an S3 bucket configured for static website hosting. CloudFront sits in front of S3 to serve files over HTTPS with low latency.

### Backend

The Express server is containerized with Docker and runs on an EC2 t2.micro instance (free tier). CloudFront proxies all `/api/*` requests to the EC2 instance on port 5000, keeping both the frontend and backend under a single domain. This eliminates CORS complexity and allows session cookies to work correctly.

### Database

MongoDB Atlas hosts the database in the cloud. The EC2 instance connects to it via the MongoDB connection string — no database infrastructure is managed on AWS.

### Authentication

Google OAuth 2.0 is handled server-side using Passport.js. After a successful login, Google redirects back to the backend callback route, which is proxied through CloudFront. Sessions are maintained using express-session with a server-side secret.

### AI Features

All AI functionality is powered by the HuggingFace Inference API:
- **Summarization** — facebook/bart-large-cnn
- **Content enhancement** — Qwen/Qwen2.5-7B-Instruct
- **Image captioning + blog generation** — Salesforce/blip-image-captioning-large + Mixtral

## Project Structure

```
BlogLog1/
├── blog-website/        # React frontend
│   └── src/
│       ├── Components/  # Page and UI components
│       ├── StyleSheets/ # CSS files
│       └── AuthContext.jsx
└── server/              # Express backend
    ├── routes/          # API route handlers
    ├── models/          # Mongoose models
    ├── config/          # Passport OAuth config
    └── Dockerfile
```
