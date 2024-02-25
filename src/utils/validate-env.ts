import { cleanEnv, host, port, str } from "envalid";

export default cleanEnv(process.env, {
	NODE_ENV: str(),
	HOST: host(),
	PORT: port(),
});
