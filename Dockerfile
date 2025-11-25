FROM node:latest
COPY . .
WORKDIR web-data-viz
RUN npm install
RUN npm install axios
RUN npm install groq-sdk
EXPOSE 8080
CMD ["npm", "start"]
