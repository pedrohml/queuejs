FROM node:17-alpine3.14

WORKDIR /dist/queuejs

COPY package.json .

RUN npm run build
COPY dist/apps/queuejs/main.js .
COPY prisma/schema.prisma prisma/

RUN npm install

RUN npm run pgenerate:prod

RUN echo -e "#!/bin/sh\nnpm run pushdb:prod && node main.js" > start
RUN chmod a+x start

CMD [ "/bin/sh", "-c", "./start" ]
