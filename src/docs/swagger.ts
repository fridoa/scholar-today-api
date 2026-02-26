import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv";

dotenv.config();

const doc = {
  info: {
    title: "Scholar Today API",
    description: "API documentation for Scholar Today System. Ini mencakup endpoint Autentikasi dan proxy untuk JSONPlaceholder.",
    version: "1.0.0",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 8000}/api/v1`,
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Register: {
        email: "Sincere@april.biz",
        password: "password123",
      },
      Login: {
        email: "Sincere@april.biz",
        password: "password123",
      },
      Profile: {
        id: 1,
        name: "Leanne Graham",
        username: "Bret",
        email: "Sincere@april.biz",
        address: {
          street: "Kulas Light",
          suite: "Apt. 556",
          city: "Gwenborough",
          zipcode: "92998-3874",
          geo: {
            lat: "-37.3159",
            lng: "81.1496"
          }
        },
        phone: "1-770-736-8031 x56442",
        website: "hildegard.org",
        company: {
          name: "Romaguera-Crona",
          catchPhrase: "Multi-layered client-server neural-net",
          bs: "harness real-time e-markets"
        }
      }
    }
  },
  // Default security ter-apply ke seluruh endpoint, kecuali yang dideklarasikan overwrite `security: []` di controller
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "./swagger-output.json"; // Output di root dirname /src/docs
const endpointsFiles = ["../routes/api.ts"]; // Target file router utama

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc).then(() => {
    console.log("Swagger documentation generated successfully!");
    process.exit(0);
});
