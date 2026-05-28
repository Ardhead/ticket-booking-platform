FROM node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma/ ./prisma/
RUN npx prisma generate
COPY tsconfig.json nest-cli.json ./
COPY src/ ./src/
RUN npm run build

FROM node:25-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --omit=dev && npm install ts-node
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma/ ./prisma/
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx prisma db seed && node dist/main"]
