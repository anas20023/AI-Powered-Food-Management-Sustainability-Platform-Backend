import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "Example API docs (ESM)",
    },
    servers: [
      { url: "http://localhost:5000", description: "Local server" }
    ],
  },
  apis: ["../routes/*.js"] 
};

const specs = swaggerJsdoc(options);
export default specs;
