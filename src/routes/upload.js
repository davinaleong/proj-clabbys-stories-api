import express from "express"
import multer from "multer"
import cloudinary from "../config/cloudinary.js"
import streamifier from "streamifier"
import { env } from "../config/env.js" // ✅ import env.js

const router = express.Router()

// Multer: store file in memory before upload
const storage = multer.memoryStorage()
const upload = multer({ storage })

// ✅ Helper to wrap Cloudinary upload_stream as a Promise
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_UPLOAD_FOLDER, // ✅ use env.js
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // ✅ Properly stream file buffer to Cloudinary
    const result = await streamUpload(req.file.buffer)
    return res.json({ success: true, result })
  } catch (error) {
    console.error("Upload failed:", error)
    return res.status(500).json({ error: "Upload failed" })
  }
})

export default router
