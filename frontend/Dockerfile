# Use a Node image for development
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./
# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the port where the Vite dev server runs
EXPOSE 5173

# Command to run the Vite development server
# NOTE: Ensure your vite.config.js is set to host: '0.0.0.0'
CMD ["npm", "run", "dev"]