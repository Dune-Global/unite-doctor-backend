import dotenv from "dotenv";

dotenv.config();

export default {
  env: process.env.NODE_ENV,
  mongo: {
    uri: process.env.MONGO_CONNECTION_STRING,
  },
  isDev: process.env.NODE_ENV === "dev",
  host: process.env.HOST,
  port: process.env.PORT,
  bcryptRounds: 10,
};
