# MCELI UI

Базовый проект на стеке:
- TypeScript
- React
- TanStack Table
- MobX
- TanStack Router
- RSBuild
- SCSS Modules
- React Hook Form
- Material UI 5

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно на http://localhost:8000

## Структура проекта

```
src/
  simple-components/  # Простые компоненты без состояния
  features/           # Фичи приложения
    generations/      # Фича генераций
      stores/         # MobX stores для фичи
  stores/             # Общие MobX stores
  routes.tsx          # Конфигурация роутинга
  index.tsx           # Точка входа
```

## Роуты

- `/` - Главная страница
- `/generations` - Список генераций
- `/generations/create` - Создание новой генерации
- `/generations/{uuid}` - Редактирование генерации

## Сборка

```bash
npm run build
```

## Просмотр сборки

```bash
npm run preview
```

