# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OFFLINE_MAPS=false

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OFFLINE_MAPS=$NEXT_PUBLIC_OFFLINE_MAPS
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 4000

CMD ["npx", "next", "start", "-p", "4000", "-H", "0.0.0.0"]
