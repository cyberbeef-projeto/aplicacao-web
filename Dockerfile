FROM node:latest
COPY . .
WORKDIR web-data-viz
RUN npm install
EXPOSE 3333
CMD ["npm", "start"]
