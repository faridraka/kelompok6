import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authController } from "../controllers/auth.controller.js";
import { jsonRes } from "../utils/helper.js";
import { ErrorSchema, UserSchema } from '../schemas/common.schema.js'
import { LoginBody, RefreshBody, RefreshResponse, RegisterBody, TokenResponse } from "../schemas/auth.schema.js";

const router = new OpenAPIHono();

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Authentication"],
  summary: "Register Account",
  description: "Endpoint untuk register sebagai player atau coach",
  request: {
    body: { required: true, content: { 'application/json': { schema: RegisterBody } } },
  },
  responses: {
    201: jsonRes(UserSchema, 'User berhasil dibuat'),
    400: jsonRes(ErrorSchema('Gagal membuat user'), 'Gagal membuat user'),
  },
});

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Authentication'],
  summary: 'Login Account',
  description: 'Endpoint untuk login dan mendapatkan token akses',
  request: {
    body: { required: true, content: { 'application/json': { schema: LoginBody } } },
  },
  responses: {
    200: jsonRes(TokenResponse, 'Login berhasil'),
    401: jsonRes(ErrorSchema('Email atau password salah'), 'Email atau password salah'),
  },
})

const refreshRoute = createRoute({
  method: 'post',
  path: '/refresh',
  tags: ['Authentication'],
  summary: 'Refresh Access Token',
  description: 'Endpoint untuk memperbarui access token menggunakan refresh token',
  request: {
    body: { required: true, content: { 'application/json': { schema: RefreshBody } } },
  },
  responses: {
    200: jsonRes(RefreshResponse, 'Token baru'),
    401: jsonRes(ErrorSchema('Refresh token tidak valid'), 'Refresh token tidak valid'),
  },
})

router.openapi(registerRoute, authController.register)
router.openapi(loginRoute, authController.login)
router.openapi(refreshRoute, authController.refresh)

export default router
