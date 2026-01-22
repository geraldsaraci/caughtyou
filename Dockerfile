# Stage 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# Stage 2: Run Express server  
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./.env ./
COPY --from=build /app/build ./client/build

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
