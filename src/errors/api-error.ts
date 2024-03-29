import { IAPIError } from "../types";
import { ExtendableError } from "./extendable-error";

class APIError extends ExtendableError {
	constructor({ status, message, errors, stack }: IAPIError) {
		super(status, message, stack, errors);
	}
}

export default APIError;