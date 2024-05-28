import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { User } from "../models/User";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

class AuthMiddleWare {
  static async auth(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token: string | undefined = req.header("Authorization");
      if (!token) throw new Error("Token not provided");

      const verifiedToken: JwtPayload | string | object = jwt.verify(
        token,
        process.env.TOKEN_SECRET as Secret
      );

      if (
        !verifiedToken ||
        typeof verifiedToken === "string" ||
        typeof verifiedToken !== "object"
      ) {
        throw new Error("Invalid token");
      }

      const user = verifiedToken as { id: number };
      const userData = await User.findByPk(user.id);
      if (!userData) throw new Error("User not found");

      req.user = userData;
      next();
    } catch (error: any) {
      console.error("Error in authorization:", error);
      res
        .status(500)
        .json({ message: "User not authorized", error: error.message });
    }
  }
}

export default AuthMiddleWare;
