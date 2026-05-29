# Sanadak Portfolio - Premium Software Agency Full-Stack Application

This project is a premium, modern, and elegant portfolio management system for a software team. It's built with Angular 18+ (Standalone Architecture), Tailwind CSS, Node.js (Express), and MongoDB.

## 🌟 Tech Stack

### Frontend
- **Framework:** Angular 18+ (Standalone Architecture, Zoneless ready)
- **Styling:** Tailwind CSS (Custom Color System, Dark Mode, Animations)
- **State Management:** Angular Signals & RxJS
- **Routing:** Angular Router (Lazy Loaded)
- **UI UX:** Glassmorphism, Smooth transitions, Custom Typography (Outfit & Inter)

### Backend
- **Runtime:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **File Uploads:** Cloudinary (via Multer)

---

## 📂 Project Structure

### Frontend (`/frontend`)
The frontend is architected for scalability:
- `src/app/pages/` - Contains lazy-loaded route components (`home`, `projects`, `team`, `dashboard`).
- `src/app/components/` - Reusable UI components (buttons, cards, modals).
- `src/app/services/` - Angular services for API communication.
- `src/app/models/` - TypeScript interfaces matching backend DTOs.
- `src/styles.css` - Global Tailwind layers and custom CSS classes.

### Backend (`/backend`)
The backend is a modular Express API:
- `src/models/` - Mongoose models (projects, team members, admin).
- `src/routes/` - HTTP route handlers (projects, team-members, auth).
- `src/services/` - Business logic and database operations.
- `src/middleware/` - JWT auth and error handling.

---

## 🎨 UI/UX Design System
- **Primary Colors:** Custom elegant reds (`#8B1A1A`, `#6B0F0F`)
- **Accent Colors:** Luxury Golds (`#C9A84C`, `#D4A574`)
- **Typography:** Outfit (Headings) and Inter (Body)
- **Features:** Dark mode toggle, Glassmorphism navbar, Soft glows, Animated gradients.

---

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with MONGODB_URI, JWT_SECRET, CLOUDINARY credentials
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
*The Angular app will run on `http://localhost:4200` with the premium UI showcasing the Hero section and Featured Projects.*
