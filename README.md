# 📸 proj-clabbys-stories-api

The **GraphQL + REST API** backend for **Clabby's Stories** – a media-sharing platform for photo & video galleries.

Built with **Node.js**, **Apollo Server (GraphQL)**, **Prisma ORM**, and **Cloudinary** for media hosting.

---

## 🚀 Features

✅ **GraphQL API** for users, galleries, photos, and admin logs  
✅ **JWT-based authentication** for couples, admins & guests  
✅ **Guest access** via unlockable galleries with temporary tokens  
✅ **REST fallback for file uploads** (via `/api/upload`)  
✅ **Prisma ORM** with PostgreSQL  
✅ **Cloudinary integration** for photo & video hosting

---

## 🛠 Tech Stack

- **Node.js** + **Express**
- **Apollo Server (GraphQL)**
- **Prisma ORM** + **PostgreSQL**
- **JWT Authentication** (`jsonwebtoken`)
- **Cloudinary** for media uploads
- **dotenv** for env management
- **Multer** for REST uploads

---

## 📂 Project Structure

```

src/
app.js                 # Combined Apollo GraphQL + Express REST server
schema/
typeDefs.js          # GraphQL schema (SDL)
resolvers.js         # Query, Mutation & nested resolvers
routes/
upload.js            # REST /api/upload endpoint
config/
cloudinary.js        # Cloudinary configuration

```

---

## ⚙️ Environment Variables

Create a `.env` file at the project root:

```env
# =========================
# 🌐 SERVER CONFIG
# =========================
PORT=4000
NODE_ENV=development

# =========================
# 🔐 AUTH / JWT
# =========================
JWT_SECRET=your_jwt_secret
GUEST_SECRET=your_guest_secret

# =========================
# 🗄️ DATABASE CONFIG (Prisma/PostgreSQL)
# =========================
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# =========================
# ☁️ CLOUDINARY CONFIG
# =========================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=uploads

# =========================
# 🏷️ OTHER OPTIONAL KEYS
# =========================
LOG_LEVEL=info
APOLLO_PLAYGROUND=true
```

---

## ▶️ Running the API

1️⃣ **Install dependencies**

```bash
npm install
```

2️⃣ **Run Prisma migrations** (ensure PostgreSQL is running)

```bash
npx prisma migrate dev
```

3️⃣ **Start the server**

```bash
npm run dev
```

- GraphQL API: [http://localhost:4000/graphql](http://localhost:4000/graphql)
- REST upload: `POST http://localhost:4000/api/upload`

---

## 🔗 Example GraphQL Queries

### Unlock a gallery (generate guest token)

```graphql
mutation {
  unlockGallery(passphrase: "wedding-secret") {
    token
    gallery {
      id
      title
    }
  }
}
```

### Fetch gallery with guest token

```graphql
query {
  guestGallery(token: "JWT_TOKEN_HERE") {
    id
    title
    photos {
      imageUrl
      caption
    }
  }
}
```

---

## 📤 REST Upload Example

`POST /api/upload` with `multipart/form-data`

```bash
curl -X POST http://localhost:4000/api/upload \
  -F "file=@/path/to/photo.jpg"
```

Returns:

```json
{
  "url": "https://res.cloudinary.com/xxx/image/upload/abc.jpg",
  "public_id": "uploads/abc",
  "resource_type": "image",
  "width": 1920,
  "height": 1080
}
```

---

## ✅ Available GraphQL Operations

**Queries**

- `users` → list all users
- `galleries(userId)` → get galleries (all or user-specific)
- `gallery(id)` → get a single gallery
- `galleryByPassphrase(passphrase)` → find gallery by passphrase
- `guestGallery(token)` → access guest gallery with JWT
- `photos(galleryId)` → get photos for a gallery
- `adminActivityLogs` → view admin logs
- `couples` → list all couples

**Mutations**

- `createUser(data)` → add new user
- `createGallery(data)` → add new gallery
- `publishGallery(id)` → publish gallery
- `unlockGallery(passphrase)` → unlock gallery & return guest token
- `createPhoto(data)` → add new photo
- `logAdminAction(adminId, action, details)` → log admin activity

---

## 🛡 Authentication

- **Couples/Admins** → Authenticated via `JWT_SECRET`
- **Guests** → Use `unlockGallery` mutation → returns a `guest token` signed with `GUEST_SECRET`, valid for 2 hours

---

## 📦 Deployment Notes

- Ensure **DATABASE_URL** & **Cloudinary keys** are set on the server
- Prisma migrations must run before first deploy
- Consider enabling CORS for frontend usage

---

## 📜 License

MIT © Clabby’s Stories
