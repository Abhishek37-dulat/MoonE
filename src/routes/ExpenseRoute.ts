import express from "express";
import AuthMiddleWare from "../middleware/AuthMiddleWare";
import ExpenseController from "../controllers/ExpenseController";

const route = express.Router();

route.get("/all_product", AuthMiddleWare.auth, ExpenseController.getAllExpense);
route.post(
  "/create_product",
  AuthMiddleWare.auth,
  ExpenseController.addExpense
);
route.put("/update/:id", AuthMiddleWare.auth, ExpenseController.updateExpense);
route.delete(
  "/delete/:id",
  AuthMiddleWare.auth,
  ExpenseController.deleteExpense
);
route.get(
  "/single/:id",
  AuthMiddleWare.auth,
  ExpenseController.getSingleExpense
);
route.get("/search", AuthMiddleWare.auth, ExpenseController.searchExpenses);
export default route;
