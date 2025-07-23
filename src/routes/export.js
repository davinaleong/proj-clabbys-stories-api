import express from "express"
import ExcelJS from "exceljs"
import { PrismaClient } from "@prisma/client"
import dayjs from "dayjs"
import _ from "lodash"
import { env } from "./../config/env"

const prisma = new PrismaClient()
const router = express.Router()

function toSnakeCase(name) {
  return _.snakeCase(name).toLowerCase() // e.g. "Clabby's Stories" → "clabby_s_stories"
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

    // Continue with DB fetch → Excel export
    const users = await prisma.user.findMany()
    const galleries = await prisma.gallery.findMany()
    const photos = await prisma.photo.findMany()

    const workbook = new ExcelJS.Workbook()
    const addSheet = (sheetName, data) => {
      const sheet = workbook.addWorksheet(sheetName)
      if (data.length > 0) {
        const headers = Object.keys(data[0]).map((col) => _.startCase(col))
        sheet.addRow(headers)
        data.forEach((row) => sheet.addRow(Object.values(row)))
      }
    }

    addSheet("Users", users)
    addSheet("Galleries", galleries)
    addSheet("Photos", photos)

    // ✅ Timestamped filename
    const timestamp = dayjs().format("YYYYMMDD_HHmmss")
    const filename = `${appName}_${timestamp}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
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
