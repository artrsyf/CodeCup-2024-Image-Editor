FROM node:22.2.0-alpine AS builder

WORKDIR /app/react

COPY ./package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/react/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]