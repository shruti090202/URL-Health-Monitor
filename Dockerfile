FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Move frontend files to public directory if not already there
RUN mkdir -p public/css public/js
RUN [ -f "index.html" ] && mv index.html public/ || true
RUN [ -d "css" ] && mv css/* public/css/ || true
RUN [ -d "js" ] && mv js/* public/js/ || true

# Expose port for the server
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]