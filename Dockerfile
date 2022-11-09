FROM node:18-alpine3.15

WORKDIR /app

ADD src /app
ADD package*.json /app

RUN set -x \
  && npm ci --only=production

CMD [ "node", "/app/index.js"]
