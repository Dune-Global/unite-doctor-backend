import mongoose from "mongoose";
import httpStatus from "http-status";
import { hash, compare } from "bcrypt";
import { omitBy, isNil } from "lodash";
import {
  IList,
  IPatient,
  IPatientMethods,
  ITransformedPatient,
  IPatientModel,
  IPatientLoginRequest,
  IPatientSuccessLogin,
} from "../types";
import { Gender } from "../enums";

import APIError from "../errors/api-error";
import config from "../config/env";
import {
  createPatientAccessToken,
  createPatientRefreshToken,
} from "../utils/jwt-auth/generateToken";
const patientSchema = new mongoose.Schema<
  IPatient,
  IPatientModel,
  IPatientMethods
>(
  {
    firstName: {
      type: String,
      required: true,
      match: /^[^\s]+$/,
    },
    lastName: {
      type: String,
      required: true,
      match: /^[^\s]+$/,
    },
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    dateOfBirth: {
      required: true,
      type: Date,
    },
    gender: {
      required: true,
      type: String,
      enum: Object.values(Gender),
    },
    imgUrl: {
      type: String,
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
    mobile: {
      type: Number,
      required: false,
      match: /^\d{10}$/,
    },
    height: {
      type: Number,
      required: false,
      match: /^[0-9]*\.?[0-9]*$/,
    },
    weight: {
      type: Number,
      required: false,
      match: /^[0-9]*\.?[0-9]*$/,
    },
    bloodGroup: {
      type: String,
      required: false,
      match: /^(A|B|AB|O)[+-]$/,
    },
    allergies: {
      type: String,
      required: false,
    },
    hereditaryDiseases: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre save hook to hash the password
patientSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    // hash patient password with bcrypt
    const pwhash = await hash(this.password, config.bcryptRounds);
    this.password = pwhash;

    return next();
  } catch (error) {
    return next(error);
  }
});

// Methods
patientSchema.method({
  // check if password hash is a match
  async passwordMatches(password: string, pwhash: string) {
    return await compare(password, pwhash);
  },

  // Transform the patient response object
  transform(this: mongoose.Document): Partial<ITransformedPatient> {
    const transformed: Partial<ITransformedPatient> = {};
    const fields: Array<keyof ITransformedPatient> = [
      "_id",
      "firstName",
      "lastName",
      "email",
      "dateOfBirth",
      "gender",
      "imgUrl",
      "isEmailVerified",
      "mobile",
      "height",
      "weight",
      "bloodGroup",
      "allergies",
      "hereditaryDiseases",
    ];

    fields.forEach((field) => {
      transformed[field] = this.get(field);
    });

    return transformed;
  },
});

// Staitcs
patientSchema.statics = {
  // get user by
  // @returns Promise<User, APIError>
  async get(id) {
    let patient;

    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await this.findById(id).exec();
    }
    if (patient) {
      return patient;
    }

    throw new APIError({
      message: "Patient does not exist",
      status: httpStatus.NOT_FOUND,
      errors: [
        {
          field: "Patient",
          location: "body",
          messages: ["Patient does not exist"],
        },
      ],
      stack: "",
    });
  },

  // Patient login and token generation
  // @returns {Promise<IPatientSuccessLogin>}
  async findAndGenerateToken(
    options: IPatientLoginRequest
  ): Promise<IPatientSuccessLogin> {
    if (!options.email) {
      throw new APIError({
        message: "An email is required to generate a token",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }

    const patient = await this.findOne({
      $and: [
        {
          email: options.email,
        },
      ],
    }).exec();

    if (options.password) {
      if (patient) {
        if (
          await patient.passwordMatches(options.password, patient?.password)
        ) {
          const accessToken = createPatientAccessToken({
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            isEmailVerified: patient.isEmailVerified,
            imgUrl: patient.imgUrl,
          });

          const refreshToken = createPatientRefreshToken({
            id: patient.id,
          });

          return {
            accessToken: accessToken,
            refreshToken: refreshToken,
          };
        } else {
          console.log("password is wrong");
        }
      }

      throw new APIError({
        message: "Invalid Username or password",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }

    return {
      accessToken: "",
      refreshToken: "",
    };
  },

  // get all patients in a list with pagination
  list({ page = 1, perPage = 30, name, email }: IList) {
    const options = omitBy({ name, email }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  // Check if the patient duplicate & unique fields exist
  checkDuplicateFields(error: any) {
    console.log(error.name, error.code);

    // Check if the email already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "email"
    ) {
      return new APIError({
        message: "Email Validation Error",
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

    return error;
  },
};

export default mongoose.model<IPatient, IPatientModel>(
  "Patient",
  patientSchema
);
