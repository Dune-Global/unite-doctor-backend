import nodemailer from "nodemailer";
import env from "../config/env";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.email",
    secure: false,
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailAppPassword,
    },
  });
};

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: env.emailUser,
    to: to,
    subject: subject,
    html: htmlContent,
  });

  return info.response;
};

export const sendDoctorAccountActivationMail = async (
  to: string,
  subjectParam: string,
  activationLink: string,
  firstName: string,
  lastName: string
) => {
  const templatePath = path.join(
    __dirname,
    "../mail-templates/doctor/activate-account.html"
  );
  const source = fs.readFileSync(templatePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    activationLink: activationLink,
    firstName: firstName,
    lastName: lastName,
  };
  const htmlToSend = template(replacements);
  const info = await sendEmail(to, subjectParam, htmlToSend);

  console.log("Message sent: %s", info);

  return info;
};

export const sendDoctorResetPasswordMail = async (
  to: string,
  subjectParam: string,
  resetPasswordLink: string,
  firstName: string,
  lastName: string
) => {
  const templatePath = path.join(
    __dirname,
    "../mail-templates/doctor/reset-password.html"
  );
  const source = fs.readFileSync(templatePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    resetPasswordLink: resetPasswordLink,
    firstName: firstName,
    lastName: lastName,
  };
  const htmlToSend = template(replacements);
  const info = await sendEmail(to, subjectParam, htmlToSend);

  console.log("Message sent: %s", info);

  return info;
};

export const sendPatientAccountActivationMail = async (
  to: string,
  subjectParam: string,
  activationLink: string,
  firstName: string,
  lastName: string
) => {
  const templatePath = path.join(
    __dirname,
    "../mail-templates/patient/activate-account.html"
  );
  const source = fs.readFileSync(templatePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    activationLink: activationLink,
    firstName: firstName,
    lastName: lastName,
  };
  const htmlToSend = template(replacements);
  const info = await sendEmail(to, subjectParam, htmlToSend);

  console.log("Message sent: %s", info);

  return info;
};

export const sendPatientResetPasswordMail = async (
  to: string,
  subjectParam: string,
  resetPasswordLink: string,
  firstName: string,
  lastName: string
) => {
  const templatePath = path.join(
    __dirname,
    "../mail-templates/patient/reset-password.html"
  );
  const source = fs.readFileSync(templatePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    resetPasswordLink: resetPasswordLink,
    firstName: firstName,
    lastName: lastName,
  };
  const htmlToSend = template(replacements);
  const info = await sendEmail(to, subjectParam, htmlToSend);

  console.log("Message sent: %s", info);

  return info;
};

export const doctorAppointmentCancellationMail = async (
  to: string,
  subjectParam: string,
  firstName: string,
  lastName: string,
  drName: string,
  location: string,
  date: string,
) => {
    const templatePath = path.join(
    __dirname,
    "../mail-templates/patient/appointment-cancelled.html"
  );
  const source = fs.readFileSync(templatePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    firstName: firstName,
    lastName: lastName,
    drName: drName,
    location: location,
    date: date,
  };
  const htmlToSend = template(replacements);
  const info = await sendEmail(to, subjectParam, htmlToSend);

  console.log("Message sent: %s", info);

  return info;
}
