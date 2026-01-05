FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY .next ./.next
COPY public ./public

COPY next.config.* ./ 2>/dev/null || true

EXPOSE 3000 3030

CMD ["npm", "run", "start:all:host"]

