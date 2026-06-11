# DobbyDrive 📂

A high-fidelity, secure, Google Drive-like nested folder and image management application built using the MERN stack.

## ✨ Features
1. **Secure custom JWT Authentication** implemented entirely in Node.js (no Firebase).
2. **Infinite Nested Folders** (similar to Google Drive breadcrumb navigation).
3. **Recursive Folder Size Calculation**:
   - Each folder displays its total size by dynamically summing the sizes of all images inside it, including images inside nested folders at any depth.
4. **User-Specific Access**:
   - Complete privacy isolation. Users can only see directories and images they uploaded.
5. **Aesthetics & Premium Styling**:
   - Modern glassmorphic theme (blur backdrops, glowing borders, Outfit typography, custom scrollbars).
   - Drag-and-drop file upload zone.
   - Interactive full-screen image preview overlay.

---

## 🛠️ Tech Stack
- **Frontend**: ReactJS (Vite), Lucide Icons, Custom Glassmorphism CSS.
- **Backend**: NodeJS, Express, Multer (local image storage).
- **Database**: MongoDB (Mongoose).

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js**: `v24.x` or higher
- **MongoDB**: A local MongoDB instance running at `mongodb://127.0.0.1:27017` or a remote MongoDB Atlas URI.

---

### 📦 Setup & Run Locally

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd DobbyAds_assignment
```

#### 2. Start the Backend Server
Navigate to the `backend/` directory:
```bash
cd backend
```
Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dobbyads_assignment
JWT_SECRET=super_secret_key_for_dobbyads_assignment_token_validation_2026
```
Install dependencies and run:
```bash
npm install
npm run dev
```
The backend API server will run at **`http://localhost:5000`**.

---

#### 3. Start the Frontend App
Open a new terminal and navigate to the `frontend/` directory:
```bash
cd frontend
```
Install dependencies and run:
```bash
npm install
npm run dev
```
The frontend web application will run at **`http://localhost:5173`**. Open it in your browser!

---

## 🔑 Demo / Testing Credentials
You can register any new account on the signup screen, but to make evaluation easy, you can use the pre-created test account:
- **Username**: `admin`
- **Password**: `password123`

---

## 🧠 Design Details

### 📂 Folder Size Calculation Logic
Folder sizes are computed recursively in-memory on the backend inside the `/api/folders/contents` route. When a user requests directory contents, the backend:
1. Fetches all folders and images belonging to the authenticated user.
2. Builds parent-child and folder-image index maps.
3. Computes sizes using a memoized Depth First Search (DFS):
   $$\text{Size}(F) = \sum_{i \in \text{Images}(F)} \text{Size}(i) + \sum_{C \in \text{Children}(F)} \text{Size}(C)$$
4. Attaches the calculated sizes dynamically to each folder object returned to the frontend.

This ensures that any change in an image nested deep down is instantly reflected across all ancestor folders up to the root.

---

## 🌐 Deployment Instructions

### Backend Deployment (e.g., Render)
1. Sign up on [Render](https://render.com/).
2. Click **New** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following details:
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. Under **Environment Variables**, add:
   - `PORT`: `10000` (or leave default)
   - `MONGODB_URI`: Connect to a free MongoDB Atlas cluster.
   - `JWT_SECRET`: A long secure random string.
6. Set the Web Service to public.

### Frontend Deployment (e.g., Vercel)
1. Sign up on [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. In the configuration page, set:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Vercel will automatically host your static assets.

*(Note: Ensure the frontend URL references the deployed backend URL instead of `http://localhost:5000` by changing the base URL inside the frontend components or updating environment variables).*
