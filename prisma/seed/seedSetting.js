import pkg from "@prisma/client"
const { LightboxMode, DateFormat, SortOrder } = pkg

export async function seedSetting(
  prisma,
  {
    applicationName = "Clabby's Stories",
    lightboxMode = "BLACK",
    defaultDateFormat = "EEE_D_MMM_YYYY",
    defaultSortOrder = "NEWEST",
  } = {}
) {
  const fixedId = "00000000-0000-0000-0000-000000000001"

  const existing = await prisma.appSetting.findUnique({
    where: { id: fixedId },
  })

  if (existing) {
    console.log("⚠️ AppSetting already exists, skipping seed.")
    return existing
  }

  const appSetting = await prisma.appSetting.create({
    data: {
      id: fixedId,
      applicationName,
      lightboxMode: LightboxMode[lightboxMode],
      defaultDateFormat: DateFormat[defaultDateFormat],
      defaultSortOrder: SortOrder[defaultSortOrder],
    },
  })

  console.log("✅ Seeded default AppSetting")
  return appSetting
}
