// utils/auth.ts
// Authentication utilities

export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Thử các key có thể có
    return localStorage.getItem('auth_token') || 
           localStorage.getItem('auth-token') || 
           localStorage.getItem('token');
  } catch (error) {
    return null;
  }
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Lưu với key chính và backup
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth-token', token);
  } catch (error) {
    }
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Xóa tất cả các key có thể
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('token');
  } catch (error) {
    }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};
