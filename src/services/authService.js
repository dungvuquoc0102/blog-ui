import { post } from "@/utils/httpRequest";

const register = async (formData) => {
  const { firstName, lastName, email, password } = formData;
  const response = await post("auth/register", {
    firstName,
    lastName,
    email,
    password,
  });
  return response;
};

export default { register };
