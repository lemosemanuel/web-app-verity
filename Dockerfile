# Stage 1: Build
FROM node:20 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve static build
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Opcional: custom nginx.conf
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
