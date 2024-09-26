import React, { useEffect, useState } from "react";
import type { FC } from 'react';
import { instance } from "../../api_config/api.config"; // axios instance with interceptors
import { authStore } from "../../store/AuthStore";

import ImageUploader from "../../components/ImageUploader/ImageUploader";

const MainPage: FC = () => {
    const [data, setData] = useState<string | null>(null); // Для хранения данных от сервера
    const [loading, setLoading] = useState<boolean>(true); // Для состояния загрузки
    const [error, setError] = useState<string | null>(null); // Для обработки ошибок

    useEffect(() => {
        const fetchData = async () => {
          // if (!authStore.isAuthenticated) {
          //   navigate("/login"); // Редирект, если пользователь не авторизован
          //   return;
          // }
    
          try {
            // Отправляем GET-запрос на защищённый эндпоинт
            const response = await instance.get("/api/check_access", {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`, // Добавляем токен в заголовок
                "Content-Type": "application/json",
              },
            });
    
            console.log(response)
    
            // Если запрос успешен, сохраняем полученные данные
            setData(response.data); // Предполагаем, что в ответе есть поле message
          } catch (err) {
            console.error("Failed to fetch protected data:", err);
            setError("Не удалось загрузить данные.");
          } finally {
            setLoading(false); // Сбрасываем состояние загрузки
          }
        };
    
        fetchData();
      }, [authStore.isAuthenticated, authStore.accessToken]);
    
      if (loading) {
        return <p>Загрузка...</p>;
      }
    
      if (error) {
        return <p>{error}</p>;
      }

    return (
        <ImageUploader/>
    );
};

export default MainPage;