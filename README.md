# Отборочный тур Codemasters Code Cup 2024
Данное приложение сделано в соответствии с треком “Разработка бизнес-приложений”.
Приложение написано на TypeScript React.

## Запуск приложения
Для запуска приложения следует использовать Docker:
```
    docker build -t <name:tag> .
    docker run --rm -p 80:80 <name:tag>
```

## Доступ к приложению
Приложение доступно по ссылке: https://rfadeyev.codecup.online/

## Описание функционала
Редактирование начинается с выбора изображения.
Выбор нужного инструмента происходит посредством левого меню.
Настройки текущего инструмента задаются через правое меню.
Кнопка "Cancel" закрывает редактор, отменяя все примененные изменения.
Кнопка "Save" сохраняет изображение с текущими изменениями.
Кнопка "Apply" применяет несохраненные изменения (перед сохранением ее нужно обязательно нажать).
Кнопки "Redo" "Undo" позволяют отменять или возвращать изменения, примененные кнопкой "Apply".
Кнопка "Revert original" возвращает изображение к исходному варианту.

## Что можно улучшить
- Иногда при повороте при разном соотношении сторон на изображении появляются черные рамки;
- Иногда не рендериться стиль для превьюшек при выборе фильтра;
- При редактировании текст может сохраняться на изображении с рамкой (если перед сохранением его не двигали или не растягивали);
- Сделать декомпозицию основного компонента приложения, добавить хранилище состояния типа Redux для уменьшения связности кода.

## Результаты
- Стартовая страница:

![alt text](/ui/result-images/1.png)
- Страница с выбранной фотографией:

![alt text](/ui/result-images/2.png)
- Редактор изображения:

![alt text](/ui/result-images/3.png)
- Инструмент обрезки фотографии:

![alt text](/ui/result-images/4.png)
- Инструмент редактирования размеров:

![alt text](/ui/result-images/5.png)
- Поворот и отражение ихображения:

![alt text](/ui/result-images/6.png)
- Коррекция изображения:

![alt text](/ui/result-images/7.png)
- Выбор фильтра:

![alt text](/ui/result-images/8.png)
- Добавление текста на изображение:

![alt text](/ui/result-images/9.png)
- Добавление фигуры на изображение:

![alt text](/ui/result-images/10.png)
- Результат после всех внесенных изменений:

![alt text](/ui/result-images/11.png)
- Предупреждение о несохраненных изменениях:

![alt text](/ui/result-images/12.png)
- Полученнное изображение:

![alt text](/ui/result-images/13.png)

## После финального этапа:
- Пофикшены некоторые ошибки на фронтенде;
- Добавлен API для авторизации и отправки изображений;
- Добавлены некоторые отмеченные требования из ТЗ (которые для финала);
- После дедлайна загружен не совсем правильный коммит на ftp-сервер (из-за чего фильтры могут не срабатывать):

Вместо этого:
```TypeScript
return (
    <div className={styles.canvasContainer} style={isPreview ? { width: '74px', height: '74px' } : {}}>
        {imageLoaded ? (
            <Stage width={width} height={height} ref={stageRef}>
                <Layer>
                    {image && (
                        <KonvaImage
                            image={image}
                            ref={imageRef}
                            width={width}
                            height={height}
                            filters={
                                isPreview && selectedFilter
                                    ? (selectedFilter === 'grayscale'
                                        ? [Konva.Filters.Grayscale]
                                        : selectedFilter === 'sepia'
                                        ? [Konva.Filters.Sepia]
                                        : selectedFilter === 'vintage'
                                        ? [Konva.Filters.Sepia, Konva.Filters.Contrast, Konva.Filters.HSL]
                                        : [])
                                    : [] // Если нет превью или фильтра, не применяем фильтры
                            }
                            {...(selectedFilter === 'vintage' && isPreview
                                ? {
                                    contrast: -0.1,
                                    saturation: -0.3,
                                    hue: 20,
                                }
                                : {}
                            )}
                            cache
                        />
                    )}
                </Layer>
            </Stage>
        ) : (
            <div className={styles.loader}>Загрузка...</div>
        )}
    </div>
);
```
Должно быть это:
```TypeScript
return (
    <div className={styles.canvasContainer} style={isPreview ? { width: '74px', height: '74px' } : {}}>
        {imageLoaded ? (
            <Stage width={width} height={height} ref={stageRef}>
                <Layer>
                    {image && (
                        <KonvaImage
                            image={image}
                            ref={imageRef}
                            width={width}
                            height={height}
                        />
                    )}
                </Layer>
            </Stage>
        ) : (
            <div className={styles.loader}>Загрузка...</div>
        )}
    </div>
);
```