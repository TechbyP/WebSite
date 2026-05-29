const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() ?? '').replace(/\/+$/, '');

export const resolveApiUrl = (path: string) => {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with '/': ${path}`);
  }

  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
};