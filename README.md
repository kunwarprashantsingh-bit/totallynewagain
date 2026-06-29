# Survvi Opulence Insights - Deployment Guide

This project is a high-performance industrial intelligence dashboard built with React, Vite, Express, and Firebase. It is optimized for deployment on **AI Studio** and **Vercel**.

## 🚀 Deployment Options

### 1. Export to GitHub (Recommended)
The easiest way to move your project to GitHub is to use the **Export to GitHub** feature in AI Studio:
1. Open the **Settings** menu in AI Studio.
2. Select **Export to GitHub**.
3. Follow the prompts to connect your account and create a new repository.

### 2. Manual Upload to GitHub
If you prefer to manually upload the files:
1. Download a ZIP of the project from the AI Studio menu.
2. Initialize a new git repository: `git init`
3. Add all files: `git add .`
4. Commit: `git commit -m "Initial commit"`
5. Push to your GitHub repository.

---

## ⚡ Deploying to Vercel

This project is pre-configured for Vercel using Serverless Functions in the `api/` directory.

### Steps to Deploy:
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. In the **Environment Variables** section, you **MUST** add the following:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `FIREBASE_CONFIG`: The JSON configuration for your Firebase project.
     - You can find this in `firebase-applet-config.json`.
     - Copy the entire JSON object from that file: `{"apiKey": "...", ...}`.
4. Click **Deploy**.

### Project Structure (Vercel):
- **Frontend**: Vite build output (`dist/`) served as a Single Page Application (SPA).
- **Backend**: Serverless functions in `api/*.ts` handle market data and news fetching.
- **Routing**: `vercel.json` ensures that all frontend requests are routed to `index.html` while API requests are routed to the functions.

---

## 🛠 Local Development

To run the project locally on your machine:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables in a `.env` file (copy from `.env.example`).
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 🏗 Key Components
- **`src/`**: React functional components and styles.
- **`api/`**: Vercel-compatible serverless functions.
- **`server.ts`**: Express server for local development and AI Studio runtime.
- **`vercel.json`**: Routing and configuration for Vercel deployment.
