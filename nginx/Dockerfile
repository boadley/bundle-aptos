# ---- Stage 1: Build the React Frontend ----
# This stage uses Node.js to build the static files.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json from the frontend directory and install dependencies.
COPY ../frontend/package*.json ./
RUN npm install

# Declare the build arguments that will be passed from docker-compose.
ARG VITE_TREASURY_ADDRESS
ARG VITE_API_URL
ARG VITE_APP_URL

# Set them as environment variables so the build process can use them.
ENV VITE_TREASURY_ADDRESS=${VITE_TREASURY_ADDRESS}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_URL=${VITE_APP_URL}

# Copy the rest of the frontend source code and run the build.
COPY ../frontend/ .
RUN npm run build

# ---- Stage 2: Build the final Nginx image ----
# This stage uses a clean Nginx image.
FROM nginx:alpine

# Copy the universal nginx.conf file into the image.
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the 'builder' stage into the Nginx public directory.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 and start Nginx.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]