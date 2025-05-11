# Node.js version matching
FROM node:20.18.3-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Vite development server, allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]