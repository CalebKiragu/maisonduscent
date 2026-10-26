export function isPreview(): boolean {
  return process.env.PREVIEW_MODE === "true";
}
