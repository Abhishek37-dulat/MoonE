import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import sequelize from "../utils/db";
import { Expense } from "../models/Expense";
import { Op } from "sequelize";

interface ExpenseData {
  id: number;
  product_name: string;
  product_desc: string;
  cost: number;
  product_category: string;
  date: string;
  userId: number;
}

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

class ExpenseController {
  static async getAllExpense(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const Expenses = await Expense.findAll({
        where: { userId: req.user.id },
      });
      if (!req.user?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      res.status(200).json({ message: "User Expensives!", data: Expenses });
    } catch (error) {
      console.error("Error while fetching All Expense");
      res.status(500).json({ message: "Server Error" });
    }
  }
  static async getSingleExpense(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const SingleExpense = await Expense.findByPk(req.params.id);
      if (!SingleExpense) {
        res.status(404).json({ message: "Expense no longer Exist" });
        return;
      }
      if (!req.user?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      res.status(200).json({ message: "Single Expense", data: SingleExpense });
    } catch (error) {
      console.error("Error while fetching single expense");
      res.status(500).json({ message: "Server Error" });
    }
  }
  static async addExpense(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const {
        product_name,
        product_desc,
        cost,
        date,
        product_category,
      }: {
        product_name: string;
        product_desc: string;
        cost: number;
        date: string;
        product_category: string;
      } = req.body;
      console.log(req.body);
      if (!req.user?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      if (!product_name || !product_desc || !cost || !product_category) {
        res.status(403).json({ message: "All fields are required" });
        return;
      }
      const expenseItem: ExpenseData = await Expense.create(
        {
          product_name,
          product_desc,
          cost,
          product_category,
          date: date ? date : new Date(),
          userId: req.user.id,
        } as ExpenseData,
        { transaction: t }
      );
      const user = await User.findByPk(req.user.id);
      await user?.update(
        {
          totalCost: user.totalCost === 0 ? +cost : +user.totalCost + +cost,
        } as UserData,
        { transaction: t }
      );
      await t.commit();
      res.status(201).json({ message: "Expense Created", data: expenseItem });
    } catch (error) {
      await t.rollback();
      console.error("Error while adding Expense", error);
      res.status(500).json({ message: "Server Error" });
    }
  }

  static async updateExpense(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const {
        product_name,
        product_desc,
        cost,
        date,
        product_category,
      }: {
        product_name: string;
        product_desc: string;
        cost: number;
        date: string;
        product_category: string;
      } = req.body;

      if (!req.user?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      if (
        !product_name ||
        !product_desc ||
        !cost ||
        !product_category ||
        !date
      ) {
        res.status(403).json({ message: "All fields are required" });
        return;
      }
      const expenseExist = await Expense.findByPk(req.params.id, {
        transaction: t,
      });
      if (!expenseExist) {
        res.status(403).json({ message: "Expense not Exist" });
        return;
      }
      const user = await User.findByPk(req.user.id);
      await user?.update(
        {
          totalCost: user.totalCost - expenseExist.cost,
        } as UserData,
        { transaction: t }
      );

      const expenseDetail: ExpenseData = await expenseExist?.update(
        {
          product_name,
          product_desc,
          cost,
          date,
          product_category,
          userId: req.user.id,
        } as ExpenseData,
        { transaction: t }
      );
      await t.commit();
      res.status(202).json({ message: "Updated Expense", data: expenseDetail });
    } catch (error) {
      await t.rollback();
      console.error("SERVER ERROR :: Error while updating expense");
      res.status(500).json({ message: "Server Error" });
    }
  }

  static async deleteExpense(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const expenseExist = await Expense.findByPk(req.params.id, {
        transaction: t,
      });
      if (!expenseExist) {
        res.status(403).json({ message: "Cann't find expense" });
        return;
      }
      if (!req.user?.isVerified) {
        res.status(404).json({ error: "Please Verify User!" });
        return;
      }
      const userExist = await User.findByPk(req.user.id);
      if (!userExist) {
        res.status(403).json({ message: "Cann't find User" });
        return;
      }
      await userExist?.update(
        {
          totalCost: userExist.totalCost - expenseExist?.cost,
        } as UserData,
        { transaction: t }
      );
      const data = await expenseExist?.destroy();
      await t.commit();
      res.status(200).json({ message: "Expense Deleted", data: data });
    } catch (error) {
      await t.rollback();
      console.error("Error while deleting Expense");
      res.status(500).json({ message: "Server Error" });
    }
  }

  static async searchExpenses(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { searchTerm } = req.query;
      if (!searchTerm) {
        res.status(400).json({ message: "Search term is required" });
        return;
      }

      const searchResults = await Expense.findAll({
        where: {
          userId: req.user.id,
          product_name: {
            [Op.like]: `%${searchTerm}%`,
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
    } catch (error) {
      console.error("Error while searching expenses", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
}

export default ExpenseController;
