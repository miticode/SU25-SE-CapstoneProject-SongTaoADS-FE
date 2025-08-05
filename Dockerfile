# Stage 1: Build ứng dụng ReactJS + Vite
FROM node:alpine3.18 AS build
WORKDIR /app

# Declare build arguments
ARG VITE_API_URL
ARG VITE_AUTH_URI
ARG VITE_CLIENT_ID
ARG VITE_REDIRECT_URI
ARG NODE_ENV

# Set environment variables from build args
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URI=$VITE_AUTH_URI
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI
ENV NODE_ENV=$NODE_ENV

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (production + dev)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Chạy ứng dụng với Nginx
FROM nginx:1.23-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]