import express from "express"
import ExcelJS from "exceljs"
import { PrismaClient } from "@prisma/client"
import dayjs from "dayjs"
import _ from "lodash"
import { env } from "../config/env.js"

const prisma = new PrismaClient()
const router = express.Router()

function toSnakeCase(name) {
  return _.snakeCase(name).toLowerCase() // e.g. "Clabby's Stories" → "clabby_s_stories"
}

// ✅ Helper: sanitize object (remove password fields)
function omitSensitiveFields(obj) {
  const clean = {}
  for (const key in obj) {
    // Remove anything that looks like password/passphrase
    if (!/password|passphrase/i.test(key)) {
      clean[key] = obj[key]
    }
  }
  return clean
}

// ✅ Helper: sanitize an array of objects
function sanitizeData(rows) {
  return rows.map((row) => omitSensitiveFields(row))
}

router.get("/", async (req, res) => {
  try {
    // 1️⃣ Try DB app settings
    const appSetting = await prisma.appSetting.findFirst()
    let rawAppName = appSetting?.applicationName

    // 2️⃣ Fallback to ENV
    if (!rawAppName && env.APP_NAME) {
      rawAppName = env.APP_NAME
    }

    // 3️⃣ Default to "clabbys_stories"
    if (!rawAppName) {
      rawAppName = "clabbys_stories"
    }

    // 4️⃣ Convert to lower snake_case
    const appName = toSnakeCase(rawAppName)
    console.log("✅ Exporting for app:", appName)

    // ✅ Fetch DB data
    const users = await prisma.user.findMany()
    const galleries = await prisma.gallery.findMany()
    const photos = await prisma.photo.findMany()

    // ✅ Sanitize (remove password-like fields)
    const safeUsers = sanitizeData(users)
    const safeGalleries = sanitizeData(galleries)
    const safePhotos = sanitizeData(photos)

    const workbook = new ExcelJS.Workbook()

    const addSheet = (sheetName, data) => {
      const sheet = workbook.addWorksheet(sheetName)

      if (data.length > 0) {
        // ✅ Column headers in Human Case
        const headers = Object.keys(data[0]).map((col) => _.startCase(col))
        sheet.addRow(headers)

        // ✅ Add rows
        data.forEach((row) => {
          sheet.addRow(Object.values(row))
        })
      }
    }

    // ✅ Add sanitized sheets
    addSheet("Users", safeUsers)
    addSheet("Galleries", safeGalleries)
    addSheet("Photos", safePhotos)

    // ✅ Timestamped filename
    const timestamp = dayjs().format("YYYYMMDD_HHmmss")
    const filename = `${appName}_${timestamp}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    )
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.send(Buffer.from(buffer))
  } catch (err) {
    console.error("Export failed", err)
    res.status(500).json({ error: "Failed to export data" })
  }
})

export default router
