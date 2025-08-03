# 📸 Clabby's Stories API

This is the backend GraphQL API for **Clabby's Stories**, built with **Express**, **Apollo Server**, and **Prisma**. It supports user authentication, gallery and photo management, secure uploads to Cloudinary, and settings configuration.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/proj-clabbys-stories-api.git
cd proj-clabbys-stories-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Rename `.env.example` to `.env` and fill in the required values:

```env
APP_NAME=...
PORT=...
NODE_ENV=...
JWT_SECRET=...
GUEST_SECRET=...
DATABASE_URL=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=...
LOG_LEVEL=...
APOLLO_PLAYGROUND=...
INTROSPECTION=...
```

---

## 🧪 Scripts

| Command                   | Description                              |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Starts the development server            |
| `npm run start`           | Starts the production server             |
| `npm run prisma:generate` | Generates Prisma client                  |
| `npm run prisma:migrate`  | Runs database migration (dev)            |
| `npm run prisma:reset`    | Resets database and re-applies migration |
| `npm run prisma:studio`   | Opens Prisma Studio                      |
| `npm run prisma:seed`     | Runs seed script to populate data        |
| `npm run db:push`         | Pushes Prisma schema to database         |

---

## 📦 Tech Stack

- **Node.js** + **Express**
- **GraphQL** via Apollo Server
- **Prisma** ORM
- **PostgreSQL** (or your preferred SQL database)
- **Cloudinary** for image uploads
- **Multer** + **Streamifier** for file handling
- **JWT** for authentication
- **dotenv** for environment config
- **ExcelJS** for Excel export
- **bcrypt** for password hashing
- **CORS** for cross-origin support

---

## 📁 Project Structure

```txt
proj-clabbys-stories-api/
├── prisma/             # Prisma schema, migrations, and seeders
├── src/                # Express app, routes, GraphQL schema and resolvers
├── .env.example        # Sample environment variables
├── LICENSE             # MIT License
├── package.json        # Project metadata and scripts
└── README.md           # Project documentation
```

---

## 🔒 Authentication

JWT is used for user authentication. Passwords are securely hashed using `bcrypt`.

---

## ☁️ Uploads

Images are uploaded to Cloudinary via a REST endpoint (`/upload`) using `multer` in memory and streamed via `streamifier`.

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE) © Davina Leong.

---

## ✨ Author

**Davina Leong** — [GitHub](https://github.com/your-username)
