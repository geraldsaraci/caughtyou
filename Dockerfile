# Build React app
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package.json client/package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# Run Express server with built React app
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY server.js ./
COPY --from=build /app/build ./client/build

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
