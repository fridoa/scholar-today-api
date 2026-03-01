import dotenv from "dotenv"

dotenv.config()

export const env = {
    DATABASE_URL: process.env.DATABASE_URL || "",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    JSON_PLACEHOLDER_URL: process.env.JSON_PLACEHOLDER_URL || "",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "",
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || "",
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "",
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || "",
}