FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libxshmfence1 \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y netcat-openbsd



ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 4000
CMD ["npm", "run", "dev"]
