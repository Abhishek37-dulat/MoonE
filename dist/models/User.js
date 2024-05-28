"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    forgotPasswordCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isPremium: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    totalCost: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    totalIncome: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    isVerified: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize: db_1.default,
    modelName: "User",
    tableName: "users",
});
