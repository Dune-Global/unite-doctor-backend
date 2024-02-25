import dotenv from "dotenv";
import { app } from "./config/express";
import { connect } from "./config/db";

dotenv.config();

const HOST = process.env.HOST!;
const PORT = parseInt(process.env.PORT!);

connect();
app.listen(PORT, HOST, () => {
	console.log(`Unite Doctor Backend is running on http://${HOST}:${PORT} 🚀`);
});
