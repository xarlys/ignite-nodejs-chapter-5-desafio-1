// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from "dotenv";

dotenv.config();

export default {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: "1d",
  },
};
