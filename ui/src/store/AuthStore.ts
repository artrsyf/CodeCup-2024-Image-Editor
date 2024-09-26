import { makeAutoObservable, runInAction } from "mobx";
import { instance } from "../api_config/api.config";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

class AuthStore {
  accessToken: string | null = localStorage.getItem("token");
  isAuthenticated: boolean = !!this.accessToken;

  constructor() {
    makeAutoObservable(this);
  }

  async register(username: string, password: string) {
    try {
      const data = { username, password };

      // Отправляем данные регистрации
      const response = await instance.post("/api/register", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // После успешной регистрации автоматически логиним пользователя
      await this.login(username, password);
    } catch (error) {
      console.error("Registration failed", error);
    }
  }

  // Логин пользователя
  async login(username: string, password: string) {
    try {
      // Создаем объект URLSearchParams, который формирует строку запроса, как в форме
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const loginData = {
        "username": username,
        "password": password,
      }

      // Отправляем данные с правильным Content-Type
      const response = await instance.post("/api/login", loginData, {
        headers: {
          "Content-Type": "application/json", // Указываем тип контента
        },
      });

      // Обрабатываем ответ
      runInAction(() => {
        this.accessToken = response.data.accessToken;
        console.log("*")
        console.log(response)
        localStorage.setItem("token", response.data.accessToken);
        this.isAuthenticated = true;
      });
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  // Логаут пользователя
  logout() {
    runInAction(() => {
      this.accessToken = null;
      this.isAuthenticated = false;
      localStorage.removeItem("token");
    });
    instance.post("/api/logout"); // вызов на бэкенд для завершения сессии
  }

  // Обновление accessToken
  async refreshToken() {
    try {
      if (!getCookie("refresh_token")) {
        window.location.href = "/login";
        return;
      }
      const response = await instance.get("/api/refresh");
      console.log(response)
      runInAction(() => {
        this.accessToken = response.data.accessToken;
        localStorage.setItem("token", response.data.accessToken);
      });
    } catch (error) {
      console.error("Refresh token failed", error);
      this.logout();
    }
  }
}

export const authStore = new AuthStore();
