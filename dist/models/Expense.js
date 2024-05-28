"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class Expense extends sequelize_1.Model {
}
exports.Expense = Expense;
Expense.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    product_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    product_desc: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    product_category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cost: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "Expense",
    tableName: "expenses",
    indexes: [
        {
            fields: ["product_name"],
            unique: false,
        },
    ],
});
