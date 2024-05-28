"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize((_a = process.env.DB_NAME) !== null && _a !== void 0 ? _a : "", (_b = process.env.SQL_USERNAME) !== null && _b !== void 0 ? _b : "", (_c = process.env.SQL_PASSWORD) !== null && _c !== void 0 ? _c : "", {
    host: (_d = process.env.DB_HOST) !== null && _d !== void 0 ? _d : "",
    dialect: "mysql",
});
exports.default = sequelize;
