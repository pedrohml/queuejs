FROM node:17-alpine3.14

WORKDIR /dist/queuejs

ADD package.json .
ADD tsconfig*.json .
ADD nest-cli.json .
ADD prisma/schema.prisma prisma/
ADD apps/ apps/

RUN npm install && npm run build

RUN cp dist/apps/queuejs/main.js . && rm -rf apps tsconfig*.json

RUN npm run pgenerate:prod

RUN echo -e "#!/bin/sh\nnpm run pushdb:prod && node main.js" > start
RUN chmod a+x start

CMD [ "/bin/sh", "-c", "./start" ]
