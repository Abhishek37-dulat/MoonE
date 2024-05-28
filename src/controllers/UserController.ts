import { User } from "../models/User";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const Sib: any = require("sib-api-v3-sdk");

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  isPremium: boolean;
  totalCost: number;
  totalIncome: number;
  isVerified: boolean;
  forgotPasswordCode: string;
}

class UserController {
  static async addUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
      }: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
      } = req.body;
      const existingUser: UserData | null = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      const hashedPassword: string = await bcrypt.hash(password, 10);
      const newUser: UserData = await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        isPremium: false,
        isVerified: false,
      } as UserData);
      const client: any = await Sib.ApiClient.instance;
      const apiKey: any = await client.authentications["api-key"];
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
    } catch (error) {
      console.error("Error while adding user:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async SignInUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password }: { email: string; password: string } = req.body;

      const user: UserData | null = await User.findOne({ where: { email } });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const isPasswordValid: boolean = await bcrypt.compare(
        password,
        user.password
      );
      if (!isPasswordValid) {
        res.status(401).json({ error: "Incrrect password" });
        return;
      }
      const token: string = jwt.sign(
        {
          first_name: user.first_name,
          last_name: user.last_name,
          id: user.id,
          isPremium: user.isPremium,
          isVerified: user.isVerified,
          totalCost: user.totalCost,
          totalIncome: user.totalIncome,
          email: user.email,
        },
        process.env.TOKEN_SECRET as string
      );
      res.status(201).json({ message: "Login Successful", data: token });
    } catch (error) {
      console.error("Error while signing in: ", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async UserProfile(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user: UserData | null = await User.findOne({
        where: { email: req.user.email },
        attributes: { exclude: ["password"] },
      });
      if (!user?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      console.log(user);
      res.status(201).json({ message: "Profile Data Successful", data: user });
    } catch (error) {
      console.error("Error in Profile: ", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async verifyUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("PARAMS::: ", req.params.id);
      const userExist = await User.findByPk(req.params.id);
      if (!userExist) {
        res.status(403).json({ message: "User don't exist" });
        return;
      }
      await userExist.update({
        isVerified: true,
      } as UserData);
      res.status(200).json({ message: "User Verification Sccessful" });
    } catch (error) {
      console.error("Error while verifing User");
      res.status(500).json({ message: "Server Error" });
    }
  }
  static generateSixDigitCode(): string {
    const min = 100000;
    const max = 999999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomCode.toString();
  }
  static async forgotPasswordEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email }: { email: string } = req.body;
      const userExist = await User.findOne({ where: { email: email } });
      if (!userExist) {
        res.status(403).json({ message: "User don't exist" });
        return;
      }
      const client = await Sib.ApiClient.instance;
      const apiKey = await client.authentications["api-key"];
      apiKey.apiKey = process.env.SENDBLUE;
      const tranEmailApi = new Sib.TransactionalEmailsApi();
      const sender = {
        email: "sendmailm6@gmail.com",
        name: "Abhishek",
      };
      const sixDigitCode = UserController.generateSixDigitCode();
      await userExist.update({
        forgotPasswordCode: sixDigitCode,
      } as UserData);
      const receivers = [{ email: email }];
      tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: "Update Password Code",
        htmlContent: `<p>MoonExpense</p><p>OTP: <b>${sixDigitCode}</b></p>`,
      });

      res.status(200).json({ message: "Update Password request" });
    } catch (error) {
      console.error("Error while password req", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
  static async verifyForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        forgotPasswordCode,
        password,
      }: { forgotPasswordCode: string; password: string } = req.body;
      const { email } = req.params;
      if (!forgotPasswordCode || !password || !email) {
        res.status(403).json({ message: "provide all required information!" });
        return;
      }
      const userExist = await User.findOne({ where: { email: email } });
      if (!userExist) {
        res.status(403).json({ message: "User don't exist" });
        return;
      }
      if (userExist.forgotPasswordCode !== forgotPasswordCode) {
        res.status(403).json({ message: "wrong Verification Code!" });
        return;
      }
      const hashedPassword: string = await bcrypt.hash(password, 10);
      await userExist.update({
        password: hashedPassword,
      } as UserData);
      const client = await Sib.ApiClient.instance;
      const apiKey = await client.authentications["api-key"];
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
    } catch (error) {
      console.error("Error while code verification");
      res.status(500).json({ message: "Server Error" });
    }
  }
  static async changePassword(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { password }: { password: string } = req.body;
      const userExist = await User.findByPk(req.user.id);
      if (!userExist) {
        res.status(403).json({ message: "User don't exist" });
        return;
      }
      if (!userExist?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      const hashedPassword: string = await bcrypt.hash(password, 10);
      await userExist.update({
        password: hashedPassword,
      } as UserData);
      res.status(200).json({ message: "Password Changed Successfully" });
    } catch (error) {
      console.error("Error while password change");
      res.status(500).json({ message: "Server Error" });
    }
  }

  static async GetUserIncome(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userExist = await User.findByPk(req.user.id);
      if (!userExist) {
        res.status(403).json({ message: "User don't exist" });
        return;
      }
      if (!userExist?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      res
        .status(200)
        .json({ message: "User Income", data: userExist?.totalIncome });
    } catch (error) {
      console.error("Error while getting user income");
      res.status(500).json({ message: "Server Error" });
    }
  }

  static async UpdateUserIncome(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { totalIncome } = req.body;
      const userExist = await User.findByPk(req.user.id);
      if (!userExist) {
        res.status(403).json({ message: "User don't exist" });
        return;
      }
      if (!userExist?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      await userExist.update({
        totalIncome: totalIncome,
      } as UserData);
      res
        .status(200)
        .json({ message: "User Income", data: userExist?.totalIncome });
    } catch (error) {
      console.error("Error while getting user income");
      res.status(500).json({ message: "Server Error" });
    }
  }
}

export default UserController;
