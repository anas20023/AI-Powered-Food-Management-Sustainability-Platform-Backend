import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";


// read package.json in a way that works in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));
const version = pkg.version;

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "REST API Docs", version },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "..", "routers", "**", "*.js"), path.join(__dirname, "..", "controllers", "**", "*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app, port) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Docs available at http://localhost:${port}/docs`);
}
