import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongo_url = process.env.MONGO_CONNECTION_STRING!;

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
