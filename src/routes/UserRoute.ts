import express from "express";
import UserController from "../controllers/UserController";
import AuthMiddleWare from "../middleware/AuthMiddleWare";
const route = express.Router();

route.post("/signup", UserController.addUser);
route.post("/login", UserController.SignInUser);
route.get("/profile", AuthMiddleWare.auth, UserController.UserProfile);
route.patch("/verify/:id", UserController.verifyUser);
route.post("/forgot", UserController.forgotPasswordEmail);
route.patch("/forgot/:email", UserController.verifyForgotPassword);
route.patch("/change", AuthMiddleWare.auth, UserController.changePassword);
route.get("/income", AuthMiddleWare.auth, UserController.GetUserIncome);
route.patch("/income", AuthMiddleWare.auth, UserController.UpdateUserIncome);

export default route;
