import mongoose from "mongoose";
import httpStatus from "http-status";
import { hash, compare } from "bcrypt";
import { omitBy, isNil } from "lodash";
import {
  IDoctor,
  IDoctorMethods,
  ITransformedDoctor,
  IDoctorModel,
  IList,
} from "../types";

import APIError from "../errors/api-error";
import config from "../config/env";

const doctorSchema = new mongoose.Schema<IDoctor, IDoctorModel, IDoctorMethods>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    slmcNumber: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isSlmcVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre save hook to hash the password
doctorSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    // hash doctor password with bcrypt
    const pwhash = await hash(this.password, config.bcryptRounds);
    this.password = pwhash;

    return next();
  } catch (error) {
    return next(error);
  }
});

// Methods
doctorSchema.method({
  // check if password hash is a match
  async passwordMatches(password: string, pwhash: string) {
    return await compare(password, pwhash);
  },

  transform(this: mongoose.Document): Partial<ITransformedDoctor> {
    const transformed: Partial<ITransformedDoctor> = {};
    const fields: Array<keyof ITransformedDoctor> = [
      "_id",
      "firstName",
      "lastName",
      "email",
      "slmcNumber",
      "mobile",
      "isEmailVerified",
      "isSlmcVerified",
    ];

    fields.forEach((field) => {
      transformed[field] = this.get(field);
    });

    return transformed;
  },
});

doctorSchema.statics = {
  // get user by
  // @returns Promise<User, APIError>
  async get(id) {
    let doctor;

    if (mongoose.Types.ObjectId.isValid(id)) {
      doctor = await this.findById(id).exec();
    }
    if (doctor) {
      return doctor;
    }

    throw new APIError({
      message: "Doctor does not exist",
      status: httpStatus.NOT_FOUND,
      errors: [
        {
          field: "Doctor",
          location: "body",
          messages: ["Doctor does not exist"],
        },
      ],
      stack: "",
    });
  },

  // get all doctor in a list with pagination
  list({ page = 1, perPage = 30, name, email }: IList) {
    const options = omitBy({ name, email }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  // Check if the doctor duplicate & unique fields exist
  checkDuplicateFields(error: any) {
    console.log(error.name, error.code);

    // Check if the email already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "email"
    ) {
      return new APIError({
        message: "Validation Error",
        errors: [
          {
            field: "email",
            location: "body",
            messages: ["email already exists"],
          },
        ],
        stack: error.stack,
        status: httpStatus.CONFLICT,
      });
    }

    // Check if the slmcNumber already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "slmcNumber"
    ) {
      return new APIError({
        message: "Validation Error",
        errors: [
          {
            field: "slmcNumber",
            location: "body",
            messages: ["slmcNumber already exists"],
          },
        ],
        stack: error.stack,
        status: httpStatus.CONFLICT,
      });
    }

    // Check if the mobile already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "mobile"
    ) {
      return new APIError({
        message: "Validation Error",
        errors: [
          {
            field: "mobile",
            location: "body",
            messages: ["mobile already exists"],
          },
        ],
        stack: error.stack,
        status: httpStatus.CONFLICT,
      });
    }

    return error;
  },
};

export default mongoose.model<IDoctor, IDoctorModel>("Doctor", doctorSchema);