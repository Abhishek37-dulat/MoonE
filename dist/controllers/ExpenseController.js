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
const db_1 = __importDefault(require("../utils/db"));
const Expense_1 = require("../models/Expense");
const sequelize_1 = require("sequelize");
class ExpenseController {
    static getAllExpense(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const Expenses = yield Expense_1.Expense.findAll({
                    where: { userId: req.user.id },
                });
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                res.status(200).json({ message: "User Expensives!", data: Expenses });
            }
            catch (error) {
                console.error("Error while fetching All Expense");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static getSingleExpense(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const SingleExpense = yield Expense_1.Expense.findByPk(req.params.id);
                if (!SingleExpense) {
                    res.status(404).json({ message: "Expense no longer Exist" });
                    return;
                }
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                res.status(200).json({ message: "Single Expense", data: SingleExpense });
            }
            catch (error) {
                console.error("Error while fetching single expense");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static addExpense(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = yield db_1.default.transaction();
            try {
                const { product_name, product_desc, cost, date, product_category, } = req.body;
                console.log(req.body);
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                if (!product_name || !product_desc || !cost || !product_category) {
                    res.status(403).json({ message: "All fields are required" });
                    return;
                }
                const expenseItem = yield Expense_1.Expense.create({
                    product_name,
                    product_desc,
                    cost,
                    product_category,
                    date: date ? date : new Date(),
                    userId: req.user.id,
                }, { transaction: t });
                const user = yield User_1.User.findByPk(req.user.id);
                yield (user === null || user === void 0 ? void 0 : user.update({
                    totalCost: user.totalCost === 0 ? +cost : +user.totalCost + +cost,
                }, { transaction: t }));
                yield t.commit();
                res.status(201).json({ message: "Expense Created", data: expenseItem });
            }
            catch (error) {
                yield t.rollback();
                console.error("Error while adding Expense", error);
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static updateExpense(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = yield db_1.default.transaction();
            try {
                const { product_name, product_desc, cost, date, product_category, } = req.body;
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                if (!product_name ||
                    !product_desc ||
                    !cost ||
                    !product_category ||
                    !date) {
                    res.status(403).json({ message: "All fields are required" });
                    return;
                }
                const expenseExist = yield Expense_1.Expense.findByPk(req.params.id, {
                    transaction: t,
                });
                if (!expenseExist) {
                    res.status(403).json({ message: "Expense not Exist" });
                    return;
                }
                const user = yield User_1.User.findByPk(req.user.id);
                yield (user === null || user === void 0 ? void 0 : user.update({
                    totalCost: user.totalCost - expenseExist.cost,
                }, { transaction: t }));
                const expenseDetail = yield (expenseExist === null || expenseExist === void 0 ? void 0 : expenseExist.update({
                    product_name,
                    product_desc,
                    cost,
                    date,
                    product_category,
                    userId: req.user.id,
                }, { transaction: t }));
                yield t.commit();
                res.status(202).json({ message: "Updated Expense", data: expenseDetail });
            }
            catch (error) {
                yield t.rollback();
                console.error("SERVER ERROR :: Error while updating expense");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static deleteExpense(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = yield db_1.default.transaction();
            try {
                const expenseExist = yield Expense_1.Expense.findByPk(req.params.id, {
                    transaction: t,
                });
                if (!expenseExist) {
                    res.status(403).json({ message: "Cann't find expense" });
                    return;
                }
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.isVerified)) {
                    res.status(404).json({ error: "Please Verify User!" });
                    return;
                }
                const userExist = yield User_1.User.findByPk(req.user.id);
                if (!userExist) {
                    res.status(403).json({ message: "Cann't find User" });
                    return;
                }
                yield (userExist === null || userExist === void 0 ? void 0 : userExist.update({
                    totalCost: userExist.totalCost - (expenseExist === null || expenseExist === void 0 ? void 0 : expenseExist.cost),
                }, { transaction: t }));
                const data = yield (expenseExist === null || expenseExist === void 0 ? void 0 : expenseExist.destroy());
                yield t.commit();
                res.status(200).json({ message: "Expense Deleted", data: data });
            }
            catch (error) {
                yield t.rollback();
                console.error("Error while deleting Expense");
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static searchExpenses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { searchTerm } = req.query;
                if (!searchTerm) {
                    res.status(400).json({ message: "Search term is required" });
                    return;
                }
                const searchResults = yield Expense_1.Expense.findAll({
                    where: {
                        userId: req.user.id,
                        product_name: {
                            [sequelize_1.Op.like]: `%${searchTerm}%`,
                        },
                    },
                });
                if (searchResults.length === 0) {
                    res
                        .status(404)
                        .json({ message: "No expenses found matching the search term" });
                    return;
                }
                res.status(200).json({ message: "Search results", data: searchResults });
            }
            catch (error) {
                console.error("Error while searching expenses", error);
                res.status(500).json({ message: "Server Error" });
            }
        });
    }
}
exports.default = ExpenseController;
