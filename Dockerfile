FROM node:17-alpine3.14

WORKDIR /dist/queuejs

COPY package.json .
COPY .env* .

COPY dist/apps/queuejs/main.js .
COPY prisma/schema.prisma prisma/

RUN npm install

RUN npx prisma db push
RUN npx prisma generate

CMD [ "node", "main.js" ]