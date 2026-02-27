import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

export default (app: Express) => {
  const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css";
  const JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js";
  const JS_PRESET_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js";

  const options = {
    explorer: true,
    customSiteTitle: "Scholar Today API Docs",
    customCssUrl: CSS_URL,
    customJs: [JS_URL, JS_PRESET_URL],
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
      return { info: { title: "Not Generated Yet" }, paths: {} };
    }
  };

  app.use("/api-docs", swaggerUi.serve);

  app.get("/api-docs", (req, res, next) => {
    const swaggerDoc = getSwaggerDocs();
    swaggerUi.setup(swaggerDoc, options)(req, res, next);
  });

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(getSwaggerDocs());
  });
};
