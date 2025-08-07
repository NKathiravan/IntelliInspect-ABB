# Step 1: Build Angular App
FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --configuration=production

# Step 2: Serve Angular with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
