// docs/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation for My Project",
      contact: { name: "Your Name", email: "you@example.com" }
    },
    servers: [
      { url: "http://localhost:5000", description: "Local server" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        }
      }
    },
  },
  // Point to the files where you'll add JSDoc comments
  apis: [path.join(process.cwd(), "routes/**/*.js"), path.join(process.cwd(), "controllers/**/*.js")],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
  // serve swagger.json at /swagger.json (optional)
  app.get("/swagger.json", (req, res) => res.json(swaggerSpec));

  // serve swagger ui at /docs
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

}
