FROM node:20-alpine

WORKDIR /app

ADD src /app
ADD package*.json /app

RUN set -x \
  && npm ci --only=production

CMD [ "node", "/app/index.js"]
