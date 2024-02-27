export interface IAccessToken {
  id: string;
  email: string;
  isEmailVerified: boolean;
  isSlmcVerified: boolean;
}

export interface IRefreshToken {
  id: string;
}
