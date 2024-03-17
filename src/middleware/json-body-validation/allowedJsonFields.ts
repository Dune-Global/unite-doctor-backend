export const allowedUpdateDoctorFields: string[] = [
  "firstName",
  "lastName",
  "email",
  "slmcNumber",
  "mobile",
  "designation",
  "dateOfBirth",
  "gender",
  "nicNumber",
  "imgUrl",
  "clinic",
  "currentUniversity",
  "currentHospital",
];

export const allowedDoctorLoginFields: string[] = ["email", "password"];

export const allowedUpdatePatientFields: string[] = [
  "firstName",
  "lastName",
  "email",
  "dateOfBirth",
  "gender",
  "imgUrl",
  "mobile",
  "height",
  "weight",
  "bloodGroup",
  "allergies",
  "hereditaryDiseases",
];

export const allowedPatientLoginFields: string[] = ["email", "password"];
