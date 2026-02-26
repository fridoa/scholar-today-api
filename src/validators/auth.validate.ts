import * as Yup from "yup";

export const registerSchema = Yup.object({
  email: Yup.string().required("Email wajib diisi").email("Email wajib diisi"),
  password: Yup.string().required("Password wajib diisi").min(6, "Password minimal 6 karakter"),
});

export const loginSchema = Yup.object({
  email: Yup.string().required("Email wajib diisi"),
  password: Yup.string().required("Password wajib diisi"),
});

export type TRegister = Yup.InferType<typeof registerSchema>;
export type TLogin = Yup.InferType<typeof loginSchema>;