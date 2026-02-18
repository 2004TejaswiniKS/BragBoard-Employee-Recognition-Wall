const TOKEN_KEY = "access_token";

export const saveAccessToken = (token) =>
  localStorage.setItem(TOKEN_KEY, token);

export const getAccessToken = () =>
  localStorage.getItem(TOKEN_KEY);

export const clearTokens = () =>
  localStorage.removeItem(TOKEN_KEY);
