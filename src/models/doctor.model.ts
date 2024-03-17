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
  IDoctorLoginRequest,
  IDoctorSuccessLogin,
} from "../types";
import {
  DoctorDesignation,
  Gender,
  SriLankaHospitals,
  SriLankaUniversities,
} from "../enums";

import APIError from "../errors/api-error";
import config from "../config/env";
import {
  createDoctorAccessToken,
  createDoctorRefreshToken,
} from "../utils/jwt-auth/generateToken";
const doctorSchema = new mongoose.Schema<IDoctor, IDoctorModel, IDoctorMethods>(
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
    slmcNumber: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
      match: /^\d{10}$/,
    },
    designation: {
      type: String,
      enum: Object.values(DoctorDesignation),
    },
    dateOfBirth: {
      type: String,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    imgUrl: {
      type: String,
    },
    nicNumber: {
      type: String,
      unique: true,
    },
    clinic: {
      isClinic: {
        type: Boolean,
        default: false,
      },
      clinicName: {
        type: String,
      },
      clinicAddress: {
        type: String,
      },
    },
    currentUniversity: {
      type: String,
      enum: Object.values(SriLankaUniversities),
      required: false,
    },
    currentHospital: {
      type: String,
      enum: Object.values(SriLankaHospitals),
      required: false,
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

  // Transform the doctor response object
  transform(this: mongoose.Document): Partial<ITransformedDoctor> {
    const transformed: Partial<ITransformedDoctor> = {};
    const fields: Array<keyof ITransformedDoctor> = [
      "_id",
      "firstName",
      "lastName",
      "email",
      "slmcNumber",
      "mobile",
      "designation",
      "dateOfBirth",
      "gender",
      "imgUrl",
      "nicNumber",
      "clinic",
      "currentUniversity",
      "currentHospital",
      "isSlmcVerified",
      "isEmailVerified",
    ];

    fields.forEach((field) => {
      transformed[field] = this.get(field);
    });

    return transformed;
  },
});

// Staitcs
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

  // Doctor login and token generation
  // @returns {Promise<IDoctorSuccessLogin>}
  async findAndGenerateToken(
    options: IDoctorLoginRequest
  ): Promise<IDoctorSuccessLogin> {
    if (!options.email) {
      throw new APIError({
        message: "An email is required to generate a token",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }

    const doctor = await this.findOne({
      $and: [
        {
          email: options.email,
        },
      ],
    }).exec();

    if (options.password) {
      if (doctor) {
        if (await doctor.passwordMatches(options.password, doctor?.password)) {
          const accessToken = createDoctorAccessToken({
            id: doctor.id,
            email: doctor.email,
            isEmailVerified: doctor.isEmailVerified,
            isSlmcVerified: doctor.isSlmcVerified,
            designation: doctor.designation,
            imgUrl: doctor.imgUrl,
          });

          const refreshToken = createDoctorRefreshToken({
            id: doctor.id,
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

    // Check if the slmcNumber already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "slmcNumber"
    ) {
      return new APIError({
        message: "SLMC Validation Error",
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
        message: "Mobile Number Validation Error",
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

    // Check if the NIC is already exists
    if (
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      Object.keys(error.keyValue)[0] === "nicNumber"
    ) {
      return new APIError({
        message: "NIC Number Validation Error",
        errors: [
          {
            field: "nicNumber",
            location: "body",
            messages: ["NIC is already exists"],
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
