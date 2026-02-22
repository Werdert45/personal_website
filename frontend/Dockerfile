FROM node:20-slim

WORKDIR /app

# Install pnpm (required by Next.js 16)
RUN npm install -g pnpm

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
