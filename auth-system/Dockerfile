# Node.js version matching your local development environmen
FROM node:20.18.3-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code to container
COPY . .

# Expose port
EXPOSE 5009

# Start command
CMD ["npm", "run", "dev"]