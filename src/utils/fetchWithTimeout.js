export async function fetchWithTimeout(url, options = {}) {
  const { timeout = 12000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}
