# AI-Powered Food Management & Sustainability Platform

The AI-Powered Food Management & Sustainability Platform is a smart system designed to help individuals, families, and communities reduce food waste, optimize consumption, and improve sustainability habits. Powered by intelligent inventory tracking, expiry prediction, and image-based food recognition, the platform enables users to manage food more efficiently, save money, and make environmentally conscious decisions.

It combines inventory monitoring, consumption logging, resource recommendations, and AI-assisted insights to support better meal planning, minimize waste, and promote sustainable living.

## 🚀 Overview

The backend provides:

- JWT-based Authentication (Register/Login/Profile)
- Inventory Management (add/update/delete items)
- Activity Logs (consumption, updates, deletions)
- Food Item reference data
- File Upload handling
- MySQL Database with Prisma ORM
- Clean Controller-Service Architecture

Designed to integrate seamlessly with the React frontend and AI microservice for OCR & image classification.

## 🛠 Tech Stack

- **Runtime:** Node.js 
- **Framework:** Express.js
- **ORM:** Prisma (MySQL)
- **Database:** MySQL
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Others:** CORS, dotenv

## 📂 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── validators/
│   ├── config/
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── server.js
└── README.md
```

## ⚙️ Environment Variables

Create `.env` file:

```
JWT_SECRET=JWT_SECRET_STRING
JWT_EXPIRES_IN=Expiry Time 
DATABASE_URL="mysql://user:password@host:post/DatabaseName?ssl-mode=REQUIRED"
```

## ▶️ Running Locally

1. **Install dependencies**
    ```bash
    npm install
    ```

2. **Generate Prisma client**
    ```bash
    npx prisma generate
    ```

3. **Sync Database Schema**
    ```bash
    npx prisma db pull
    ```

4. **Start development server**
    ```bash
    npm run dev
    ```

## 📡 Scripts

```json
{
  "dev": "nodemon server.js",
  "postinstall": "prisma db pull && prisma generate"
}
```

## 📄 License

MIT License