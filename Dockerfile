FROM node:18-alpine3.18

# set env
ENV ROOT_PATH=/usr/src/app
ENV TZ=Asia/Shanghai

# copy files
ADD src $ROOT_PATH/src
ADD package.json $ROOT_PATH
ADD ecosystem.config.js $ROOT_PATH

WORKDIR $ROOT_PATH
RUN npm install --production

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:docker"]
