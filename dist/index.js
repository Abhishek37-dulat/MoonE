"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./utils/db"));
const ExpenseRoute_1 = __importDefault(require("./routes/ExpenseRoute"));
const UserRoute_1 = __importDefault(require("./routes/UserRoute"));
// import payment from "./routes/paymentRoute";
// import leaderBoard from "./routes/leaderBoardRoute";
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
        this.syncDatabase();
        this.loadEnv();
        this.setupLogging();
    }
    config() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(express_1.default.json());
        this.app.use((0, helmet_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use((0, morgan_1.default)("combined", { stream: this.accessLogStream }));
    }
    routes() {
        this.app.use("/api/user", UserRoute_1.default);
        this.app.use("/api/expense", ExpenseRoute_1.default);
        // this.app.use("/api/payment", payment);
        // this.app.use("/api/leader", leaderBoard);
    }
    syncDatabase() {
        db_1.default
            .sync()
            .then(() => {
            this.startServer();
        })
            .catch((err) => {
            console.error("ERROR: ", err);
        });
    }
    startServer() {
        const port = process.env.PORT || 8001;
        this.app.listen(port, () => {
            console.info("Server started on port: ", port);
        });
    }
    loadEnv() {
        dotenv_1.default.config();
        console.log("Environment variables loaded");
        console.warn("Warning: Ensure sensitive info is properly handled");
    }
    setupLogging() {
        this.accessLogStream = fs.createWriteStream(path_1.default.join(__dirname, "access.log"), { flags: "a" });
    }
}
new App();
