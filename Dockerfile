FROM node:latest
COPY . .
WORKDIR web-data-viz
RUN npm install
EXPOSE 8080
CMD ["npm", "start"]
