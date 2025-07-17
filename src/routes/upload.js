import express from "express"
import multer from "multer"
import cloudinary from "../config/cloudinary.js"
import streamifier from "streamifier" // ✅ needed for buffer streaming

const router = express.Router()

// Multer: store file in memory before upload
const storage = multer.memoryStorage()
const upload = multer({ storage })

// ✅ Helper to wrap Cloudinary upload_stream as a Promise
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",
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

    return res.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    })
  } catch (err) {
    console.error("Cloudinary upload failed:", err)
    return res.status(500).json({ error: err.message || "Upload failed" })
  }
})

export default router
