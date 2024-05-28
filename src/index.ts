import express, { Express } from "express";
import cors from "cors";
import sequelize from "./utils/db";
import expense from "./routes/ExpenseRoute";
import user from "./routes/UserRoute";
// import payment from "./routes/paymentRoute";
// import leaderBoard from "./routes/leaderBoardRoute";
import dotenv from "dotenv";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import * as fs from "fs";
import path from "path";
class App {
  private app: Express;
  private accessLogStream!: fs.WriteStream;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.syncDatabase();
    this.loadEnv();
    this.setupLogging();
  }

  private config(): void {
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(morgan("combined", { stream: this.accessLogStream }));
  }

  private routes(): void {
    this.app.use("/api/user", user);
    this.app.use("/api/expense", expense);
    // this.app.use("/api/payment", payment);
    // this.app.use("/api/leader", leaderBoard);
  }

  private syncDatabase(): void {
    sequelize
      .sync()
      .then(() => {
        this.startServer();
      })
      .catch((err) => {
        console.error("ERROR: ", err);
      });
  }

  private startServer(): void {
    const port = process.env.PORT || 8001;
    this.app.listen(port, () => {
      console.info("Server started on port: ", port);
    });
  }
  private loadEnv(): void {
    dotenv.config();
    console.log("Environment variables loaded");
    console.warn("Warning: Ensure sensitive info is properly handled");
  }
  private setupLogging(): void {
    this.accessLogStream = fs.createWriteStream(
      path.join(__dirname, "access.log"),
      { flags: "a" }
    );
  }
}

new App();
