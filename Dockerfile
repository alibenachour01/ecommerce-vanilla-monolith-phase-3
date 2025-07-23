FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./
COPY pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

COPY . .

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:3000/health || exit 1

EXPOSE 3000
