# Stage 1: Build ứng dụng ReactJS + Vite
FROM node:alpine3.18 AS build
WORKDIR /app

# Declare build arguments
ARG VITE_API_URL
ARG NODE_ENV

# Set environment variables from build args
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Chạy ứng dụng với Nginx
FROM nginx:1.23-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]