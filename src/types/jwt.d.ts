export interface IDoctorAccessToken {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  isSlmcVerified: boolean;
  designation: string;
  imgUrl: string;
}

export interface IPatientAccessToken {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  imgUrl: string;
}

export interface IRefreshToken {
  id: string;
}
