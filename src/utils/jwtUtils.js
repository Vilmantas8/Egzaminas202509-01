// JWT Token utilities
export const getTokenExpiry = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const expiry = getTokenExpiry(token);
  return !expiry || Date.now() >= expiry;
};

export const getTokenPayload = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

export const refreshTokenIfNeeded = async (token) => {
  if (!token || isTokenExpired(token)) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
          const { accessToken, refreshToken: newRefreshToken } = await response.json();
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          return accessToken;
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('token');
        localStorage.removeToken('refreshToken');
        window.location.href = '/login';
      }
    }
  }
  return token;
};