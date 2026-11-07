# ---------- Stage 1: build ----------
  FROM node:22-alpine AS build
  WORKDIR /app
  
  COPY package.json package-lock.json ./
  RUN npm ci
  
  COPY tsconfig.json ./
  COPY src ./src
  RUN npm run build
  
  # ---------- Stage 2: production dependencies ----------
  FROM node:22-alpine AS deps
  WORKDIR /app
  
  COPY package.json package-lock.json ./
  RUN npm ci --omit=dev
  
  # ---------- Stage 3: runtime ----------
  FROM node:22-alpine AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  
  COPY --from=deps  /app/node_modules ./node_modules
  COPY --from=build /app/dist ./dist
  COPY package.json ./
  COPY docs/openapi.yaml ./docs/openapi.yaml
  
  USER node
  EXPOSE 3000
  
  HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1
  
  CMD ["node", "dist/server.js"]