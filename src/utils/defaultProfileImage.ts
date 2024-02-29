export const defaultProfileImage = (
  firstName: string,
  lastName: string
): string => {
  const imgUrl = `https://eu.ui-avatars.com/api/?name=${firstName}+${lastName}&size=250`;
  return imgUrl;
};
