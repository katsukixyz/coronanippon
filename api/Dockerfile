# Node
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000

EXPOSE 5000

# CMD [ "nodemon", "-L", "index.js" ]
CMD ["npm", "start"]