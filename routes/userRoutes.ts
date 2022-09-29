import express from "express";
import { Client } from "pg";
import UserService from "../services/UserService";
import UserController from "../controller/userController";

export const userRoutes = express.Router();
export function initialize(client: Client) {
  const userService = new UserService(client);
  const userController = new UserController(userService);

  userRoutes.get("/", userController.getUsers);
  userRoutes.post("/register", userController.register);
  userRoutes.post("/login", userController.login);
}
