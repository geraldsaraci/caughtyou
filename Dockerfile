FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js .env ./
COPY client/public/ ./client/build/

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
