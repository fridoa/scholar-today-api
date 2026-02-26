import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

// Function untuk setup docs supaya dinamis membaca swagger-output.json
export default (app: Express) => {
  const options = {
    explorer: true,
    customSiteTitle: "Scholar Today API Docs",
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { background: #fff; box-shadow: none; }
    `,
    swaggerOptions: {
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      docExpansion: "list",
      filter: true,
      showRequestHeaders: true,
    },
  };

  const getSwaggerDocs = () => {
    try {
      const swaggerPath = path.resolve(__dirname, "./swagger-output.json");
      const file = fs.readFileSync(swaggerPath, "utf8");
      return JSON.parse(file);
    } catch (err) {
      // Return empty/placeholder object if not generated yet
      return { info: { title: "Not Generated Yet" }, paths: {} };
    }
  };

  app.use("/api-docs", swaggerUi.serve);
  
  // Custom middleware to serve dynamic swagger doc
  app.get("/api-docs", (req, res, next) => {
    const swaggerDoc = getSwaggerDocs();
    swaggerUi.setup(swaggerDoc, options)(req, res, next);
  });

  // JSON endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(getSwaggerDocs());
  });
};
