import path from "path";

// Import .env variables
require("dotenv-safe").config({
  path: path.join(__dirname, "../../.env.example"),
});

export default {
  mongo: {
    uri: process.env.MONGO_CONNECTION_STRING,
  },
  isDev: process.env.NODE_ENV === "dev",
  host: process.env.HOST,
  port: process.env.PORT,
  bcryptRounds: 10,
};
