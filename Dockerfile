FROM node:17-alpine3.14

WORKDIR /dist/queuejs

COPY package.json .
COPY tsconfig*.json .
COPY prisma/schema.prisma prisma/
COPY apps/ apps/

RUN npm install
RUN npm run build

COPY dist/apps/queuejs/main.js .
RUN rm -rf apps tsconfig*.json

RUN npm run pgenerate:prod

RUN echo -e "#!/bin/sh\nnpm run pushdb:prod && node main.js" > start
RUN chmod a+x start

CMD [ "/bin/sh", "-c", "./start" ]
