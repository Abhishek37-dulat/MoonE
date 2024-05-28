"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Sib = require("sib-api-v3-sdk");
class UserController {
    static addUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { first_name, last_name, email, password, } = req.body;
                const existingUser = yield User_1.User.findOne({
                    where: { email },
                });
                if (existingUser) {
                    res.status(400).json({ error: "User already exists" });
                    return;
                }
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                const newUser = yield User_1.User.create({
                    first_name,
                    last_name,
                    email,
                    password: hashedPassword,
                    isPremium: false,
                    isVerified: false,
                });
                const client = yield Sib.ApiClient.instance;
                const apiKey = yield client.authentications["api-key"];
                apiKey.apiKey = process.env.SENDBLUE;
                const tranEmailApi = new Sib.TransactionalEmailsApi();
                const sender = {
                    email: "sendmailm6@gmail.com",
                    name: "Abhishek",
                };
                const receivers = [{ email: email }];
                tranEmailApi.sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: "Verify Userself",
                    htmlContent: `<p>Verify yourself: <a href="http://localhost:3000/user/verify/${newUser.id}">Verify yourself</a></p>`,
                });
                // console.log(tranEmailApi);
                res
                    .status(201)
                    .json({ message: "User created successfully", data: newUser });
            }
            catch (error) {
                console.error("Error while adding user:", error);
                res.status(500).json({ error: "Server error" });
            }
        });
    }
    static SignInUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield User_1.User.findOne({ where: { email } });
                if (!user) {
                    res.status(404).json({ error: "User not found" });
                    return;
                }
                const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({ error: "Incrrect password" });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    id: user.id,
                    isPremium: user.isPremium,
                    isVerified: user.isVerified,
                    totalCost: user.totalCost,
                    totalIncome: user.totalIncome,
                    email: user.email,
                }, process.env.TOKEN_SECRET);
                res.status(201).json({ message: "Login Successful", data: token });
            }
            catch (error) {
                console.error("Error while signing in: ", error);
                res.status(500).json({ error: "Server error" });
            }
        });
    }
    static UserProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield User_1.User.findOne({
                    where: { email: req.user.email },
                    attributes: { exclude: ["password"] },
                });
                if (!(user === null || user === void 0 ? void 0 : user.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                console.log(user);
                res.status(201).json({ message: "Profile Data Successful", data: user });
            }
            catch (error) {
                console.error("Error in Profile: ", error);
                res.status(500).json({ error: "Server error" });
            }
        });
    }
    static verifyUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("PARAMS::: ", req.params.id);
                const userExist = yield User_1.User.findByPk(req.params.id);
                if (!userExist) {
                    res.status(403).json({ message: "User don't exist" });
                    return;
                }
                yield userExist.update({
                    isVerified: true,
                });
                res.status(200).json({ message: "User Verification Sccessful" });
            }
            catch (error) {
                console.error("Error while verifing User");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static generateSixDigitCode() {
        const min = 100000;
        const max = 999999;
        const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomCode.toString();
    }
    static forgotPasswordEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const userExist = yield User_1.User.findOne({ where: { email: email } });
                if (!userExist) {
                    res.status(403).json({ message: "User don't exist" });
                    return;
                }
                const client = yield Sib.ApiClient.instance;
                const apiKey = yield client.authentications["api-key"];
                apiKey.apiKey = process.env.SENDBLUE;
                const tranEmailApi = new Sib.TransactionalEmailsApi();
                const sender = {
                    email: "sendmailm6@gmail.com",
                    name: "Abhishek",
                };
                const sixDigitCode = UserController.generateSixDigitCode();
                yield userExist.update({
                    forgotPasswordCode: sixDigitCode,
                });
                const receivers = [{ email: email }];
                tranEmailApi.sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: "Update Password Code",
                    htmlContent: `<p>MoonExpense</p><p>OTP: <b>${sixDigitCode}</b></p>`,
                });
                res.status(200).json({ message: "Update Password request" });
            }
            catch (error) {
                console.error("Error while password req", error);
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static verifyForgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { forgotPasswordCode, password, } = req.body;
                const { email } = req.params;
                if (!forgotPasswordCode || !password || !email) {
                    res.status(403).json({ message: "provide all required information!" });
                    return;
                }
                const userExist = yield User_1.User.findOne({ where: { email: email } });
                if (!userExist) {
                    res.status(403).json({ message: "User don't exist" });
                    return;
                }
                if (userExist.forgotPasswordCode !== forgotPasswordCode) {
                    res.status(403).json({ message: "wrong Verification Code!" });
                    return;
                }
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                yield userExist.update({
                    password: hashedPassword,
                });
                const client = yield Sib.ApiClient.instance;
                const apiKey = yield client.authentications["api-key"];
                apiKey.apiKey = process.env.SENDBLUE;
                const tranEmailApi = new Sib.TransactionalEmailsApi();
                const sender = {
                    email: "sendmailm6@gmail.com",
                    name: "Abhishek",
                };
                const receivers = [{ email: email }];
                tranEmailApi.sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: "MoonExpense",
                    htmlContent: `<p>MoonExpense</p><p><b>Password Updated Successfully!</b></p>`,
                });
                res.status(200).json({ message: "code verification Password" });
            }
            catch (error) {
                console.error("Error while code verification");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password } = req.body;
                const userExist = yield User_1.User.findByPk(req.user.id);
                if (!userExist) {
                    res.status(403).json({ message: "User don't exist" });
                    return;
                }
                if (!(userExist === null || userExist === void 0 ? void 0 : userExist.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                yield userExist.update({
                    password: hashedPassword,
                });
                res.status(200).json({ message: "Password Changed Successfully" });
            }
            catch (error) {
                console.error("Error while password change");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static GetUserIncome(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userExist = yield User_1.User.findByPk(req.user.id);
                if (!userExist) {
                    res.status(403).json({ message: "User don't exist" });
                    return;
                }
                if (!(userExist === null || userExist === void 0 ? void 0 : userExist.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                res
                    .status(200)
                    .json({ message: "User Income", data: userExist === null || userExist === void 0 ? void 0 : userExist.totalIncome });
            }
            catch (error) {
                console.error("Error while getting user income");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static UpdateUserIncome(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { totalIncome } = req.body;
                const userExist = yield User_1.User.findByPk(req.user.id);
                if (!userExist) {
                    res.status(403).json({ message: "User don't exist" });
                    return;
                }
                if (!(userExist === null || userExist === void 0 ? void 0 : userExist.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                yield userExist.update({
                    totalIncome: totalIncome,
                });
                res
                    .status(200)
                    .json({ message: "User Income", data: userExist === null || userExist === void 0 ? void 0 : userExist.totalIncome });
            }
            catch (error) {
                console.error("Error while getting user income");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
}
exports.default = UserController;
