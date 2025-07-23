import { LightboxMode, DateFormat, SortOrder } from "@prisma/client"

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

  const appSetting = await prisma.appSetting.upsert({
    where: { id: fixedId },
    update: {
      applicationName,
      lightboxMode: LightboxMode.BLACK,
      defaultDateFormat: DateFormat.EEE_D_MMM_YYYY,
      defaultSortOrder: SortOrder.NEWEST,
    },
    create: {
      id: fixedId,
      applicationName,
      lightboxMode: LightboxMode.BLACK,
      defaultDateFormat: DateFormat.EEE_D_MMM_YYYY,
      defaultSortOrder: SortOrder.NEWEST,
    },
  })

  console.log("✅ Seeded default AppSetting")
  return appSetting
}
