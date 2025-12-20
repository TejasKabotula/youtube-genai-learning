# Build stage
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# If we have any assets or temp folders needed
RUN mkdir -p uploads temp

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.js"]
