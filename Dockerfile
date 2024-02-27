FROM node:18
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn
COPY . /app
ENV NODE_ENV=prod
ENV HOST=0.0.0.0
ENV PORT=8080
ENV MONGO_CONNECTION_STRING=mongodb+srv://admin:UGopEkmZwuXd8ioE@recipes.vncmofq.mongodb.net/?retryWrites=true&w=majority&appName=recipes
CMD ["yarn", "start"]
EXPOSE 8088