import mongoose, { Connection } from "mongoose";
import config from "./env";

const mongo_url = config.mongo.uri!;

mongoose.connection.on("error", (err) => {
	console.error(`MongoDB connection failed ${err}`);
	process.exit(-1);
});

const connect = (): Connection => {
	mongoose.connect(mongo_url, {} as mongoose.ConnectOptions).then(() => {
		console.log("Database connected successfully 🙌");
	});
	return mongoose.connection;
};

export { connect };
