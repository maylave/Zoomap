import swaggerJsdoc from "swagger-jsdoc";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Zoomap API",
      version: "1.0.0",
      description: "API для приложения Zoomap",
      contact: {
        name: "Zoomap Team",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
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
    },
  },
  apis: ["./src/routes/*.ts"], // Пути к файлам с роутами
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
