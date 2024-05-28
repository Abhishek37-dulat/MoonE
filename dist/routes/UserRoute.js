"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const AuthMiddleWare_1 = __importDefault(require("../middleware/AuthMiddleWare"));
const route = express_1.default.Router();
route.post("/signup", UserController_1.default.addUser);
route.post("/login", UserController_1.default.SignInUser);
route.get("/profile", AuthMiddleWare_1.default.auth, UserController_1.default.UserProfile);
route.patch("/verify/:id", UserController_1.default.verifyUser);
route.post("/forgot", UserController_1.default.forgotPasswordEmail);
route.patch("/forgot/:email", UserController_1.default.verifyForgotPassword);
route.patch("/change", AuthMiddleWare_1.default.auth, UserController_1.default.changePassword);
route.get("/income", AuthMiddleWare_1.default.auth, UserController_1.default.GetUserIncome);
route.patch("/income", AuthMiddleWare_1.default.auth, UserController_1.default.UpdateUserIncome);
exports.default = route;
