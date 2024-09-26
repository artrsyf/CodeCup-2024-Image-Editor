import axios from "axios";
import { authStore } from "../store/AuthStore";

export const instance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:8080/", // правильный URL для вашего API
});

instance.interceptors.request.use((config) => {
  const token = authStore.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response, // Возвращаем ответ как есть
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, что ошибка 401 и это не повторный запрос
    if (error.response.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      try {
        // Пытаемся обновить токен
        await authStore.refreshToken();
        // Повторяем оригинальный запрос с новым токеном
        return instance.request(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed or expired", refreshError);
        authStore.logout(); // Если рефреш не удался, вызываем logout
        throw refreshError;
      }
    }

    // Если ошибка другая или уже был повторный запрос, пробрасываем ошибку дальше
    throw error;
  }
);
