export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/auth/login?expired=1';
    return new Promise(() => {});
  }
  return res;
}
