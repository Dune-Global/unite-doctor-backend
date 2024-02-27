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
ENV ACCESS_TOKEN_EXPIRES_IN="120s"
ENV REFRESH_TOKEN_EXPIRES_IN="1d"
ENV ACCESS_TOKEN_SECRET=kasdjflskdfru9e4092389dfj348nnjjhJJJioeuIOUILLL
ENV REFRESH_TOKEN_SECRET=kasdjflskdfru9e4092389dfj348nnjjhJJJioeuIOUILL
CMD ["yarn", "start"]
EXPOSE 8088