export async function toLocalBlobUrl(remoteUrl) {
  if (!remoteUrl || remoteUrl.startsWith("data:")) return remoteUrl;
  try {
    const res = await fetch(remoteUrl, { mode: "cors" });
    if (!res.ok) throw new Error("bad status " + res.status);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn("toLocalBlobUrl fail:", e);
    return "";
  }
}
