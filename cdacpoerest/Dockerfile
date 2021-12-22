FROM node:8.11.3
#FROM node:latest

# Create app directory
WORKDIR /usr/src/cdacpoerest

# Install app dependencies
COPY package*.json ./

RUN npm install

# Copy app source code
COPY . .

#Expose port and start application
EXPOSE 5000

CMD node server.js
