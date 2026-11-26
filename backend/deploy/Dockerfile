# TODO добавить многоступенчатую сборку
FROM node:26-alpine

WORKDIR /opt/ai-true-test

COPY package*.json ./
RUN npm ci

COPY ./ .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:seed && npm start"]