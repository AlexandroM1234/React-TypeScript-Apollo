import { UsernamePasswordInput } from "./UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  // checks for a valid email address
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email address",
      },
    ];
  }
  // check the username length
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2",
      },
    ];
  }
  // check if username has an @
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "cannot include @ in a username ",
      },
    ];
  }
  // checks the password length
  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "length must be greater than 2",
      },
    ];
  }

  // if no errors return nothing
  return null;
};
