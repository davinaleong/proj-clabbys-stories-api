export default function extractPublicId(imageUrl) {
  try {
    const parts = imageUrl.split("/")
    const fileWithExt = parts[parts.length - 1]
    return fileWithExt.split(".")[0] // remove file extension
  } catch {
    return null
  }
}
