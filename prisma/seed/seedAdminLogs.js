// prisma/seed/seedAdminLogs.js
export async function seedAdminLogs(prisma, adminId) {
  console.log("📝 Seeding admin logs...")

  const log = await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: "SEEDED_INITIAL_DATA",
      details: "Initial admin + couple + gallery + photos were seeded",
    },
  })

  console.log(`✅ Admin log created: ${log.action}`)
}
