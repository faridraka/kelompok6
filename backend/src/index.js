import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { NODE_ENV, PORT, SERVER_URL } from "./config/env.js";
import routes from "./routes/index.js";
import { AppError } from "./utils/error.js";

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        { message: "Validasi gagal", errors: result.error.issues },
        422,
      );
    }
  },
});

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://metagames.my.id",
      "https://dev.metagames.my.id",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Gunakan token JWT yang valid.",
});

app.route("/api/", routes);

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ message: err.message }, err.status);
  }
  console.error(err);
  return c.json({ message: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ message: "Endpoint tidak ditemukan" }, 404));

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Metagames API",
    version: "1.0.0",
    description:
      "Metagames adalah sebuah platform yang menyediakan layanan coach di berbagai game. Platform ini memungkinkan pengguna untuk mencari dan memesan sesi coaching dengan coach yang berpengalaman di berbagai game populer. Dengan Metagames, pengguna dapat meningkatkan keterampilan mereka dalam bermain game melalui bimbingan langsung dari para ahli.",
    contact: {
      name: "Kelompok 6",
      email: "zutto.development@gmail.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  externalDocs: {
    description: "Resource API",
    url: "https://github.com/faridraka/kelompok6",
  },
  servers: [{ url: `${SERVER_URL}`, description: `${NODE_ENV}` }],
  tags: [
    { name: "System", description: "System related endpoints" },
    { name: "Authentication", description: "Authentication related endpoints" },
    { name: "Sessions", description: "Sessions related endpoints" },
    { name: "Uploads", description: "Uploads related endpoints" },
  ],
});

app.get(
  "/",
  Scalar({
    url: "/openapi.json",
    authentication: {
      preferredSecurityScheme: "Bearer",
    },
    theme: "purple",
    pageTitle: "API Docs — Metagames API",
    metaData: {
      title: "Metagames API Docs",
      description: "Dokumentasi REST API Metagames — platform coaching game.",
    },
    layout: "modern",
    darkMode: true,
    hideDarkModeToggle: false,
    showSidebar: true,
    hideDownloadButton: false,
    hideClientButton: true,
    expandAllResponses: true,
    defaultOpenAllTags: false,
    orderRequiredPropertiesFirst: true,
    searchHotKey: "k",
    customCss: `
      .scalar-app { --scalar-font: 'Inter', system-ui, sans-serif; }
    `,
  }),
);

serve(
  {
    fetch: app.fetch,
    port: PORT || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
