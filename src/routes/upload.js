import express from "express"
import multer from "multer"
import cloudinary from "../config/cloudinary.js"
import streamifier from "streamifier"
import { env } from "../config/env.js"

const router = express.Router()

// Multer: store files in memory
const storage = multer.memoryStorage()
const upload = multer({ storage })

// ✅ Helper to wrap Cloudinary upload_stream as a Promise
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_UPLOAD_FOLDER,
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

// ✅ SINGLE UPLOAD (existing)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const result = await streamUpload(req.file.buffer)
    return res.json({ success: true, result })
  } catch (error) {
    console.error("Upload failed:", error)
    return res.status(500).json({ error: "Upload failed" })
  }
})

// ✅ MULTI UPLOAD
router.post("/multi", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    // ✅ Upload all files in parallel
    const uploadPromises = req.files.map((file) => streamUpload(file.buffer))
    const results = await Promise.all(uploadPromises)

    return res.json({ success: true, count: results.length, results })
  } catch (error) {
    console.error("Multi-upload failed:", error)
    return res.status(500).json({ error: "Multi-upload failed" })
  }
})

export default router
