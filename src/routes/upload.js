import express from "express"
import multer from "multer"
import cloudinary from "../config/cloudinary.js"

const router = express.Router()

// Multer: store file in memory before upload
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",
        resource_type: "auto", // auto-detect image/video
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message })
        return res.json({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        })
      }
    )

    // Pipe file buffer to Cloudinary upload_stream
    req.file.stream.pipe(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Upload failed" })
  }
})

export default router
