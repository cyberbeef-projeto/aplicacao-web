FROM node:latest
WORKDIR /Aplicacao-Web-Monitoramento-De-Hardware-De-Servidores/web-data-viz
RUN npm install
EXPOSE 3333
CMD ["npm", "start"]