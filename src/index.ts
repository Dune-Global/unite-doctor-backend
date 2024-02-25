import { app } from "./config/express";
import env from "./utils/validate-env";
import dotenv from "dotenv";

dotenv.config();

const HOST = env.HOST;
const PORT = env.PORT;

app.listen(PORT, HOST, () => {
	console.log(`Unite Doctor Backend is running on http://${HOST}:${PORT} 🚀`);
});
