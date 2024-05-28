"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleWare_1 = __importDefault(require("../middleware/AuthMiddleWare"));
const ExpenseController_1 = __importDefault(require("../controllers/ExpenseController"));
const route = express_1.default.Router();
route.get("/all_product", AuthMiddleWare_1.default.auth, ExpenseController_1.default.getAllExpense);
route.post("/create_product", AuthMiddleWare_1.default.auth, ExpenseController_1.default.addExpense);
route.put("/update/:id", AuthMiddleWare_1.default.auth, ExpenseController_1.default.updateExpense);
route.delete("/delete/:id", AuthMiddleWare_1.default.auth, ExpenseController_1.default.deleteExpense);
route.get("/single/:id", AuthMiddleWare_1.default.auth, ExpenseController_1.default.getSingleExpense);
route.get("/search", AuthMiddleWare_1.default.auth, ExpenseController_1.default.searchExpenses);
exports.default = route;
