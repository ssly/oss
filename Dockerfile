#FORM node:lts-alpine3.14
FROM nas.lius.me:3002/node-base:1.0.0

# set env
ENV ROOT_PATH=/usr/src/app

# copy files
ADD src $ROOT_PATH/src
ADD package.json $ROOT_PATH
ADD ecosystem.config.js $ROOT_PATH

WORKDIR $ROOT_PATH
RUN npm install --production

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:docker"]
