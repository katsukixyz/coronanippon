# Node
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000

ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

EXPOSE 5000

CMD ["npm", "start"]