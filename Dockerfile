FROM node:18
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
COPY . /app
RUN yarn
CMD ["yarn", "start"]
EXPOSE 8080