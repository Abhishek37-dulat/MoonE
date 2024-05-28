import { DataTypes, Model } from "sequelize";
import sequelize from "../utils/db";

interface ExpenseAttributes {
  id: number;
  product_name: string;
  product_desc: string;
  cost: number;
  product_category: string;
  date: string;
  userId: number;
}

class Expense extends Model<ExpenseAttributes> implements ExpenseAttributes {
  public id!: number;
  public product_name!: string;
  public product_desc!: string;
  public product_category!: string;
  public cost!: number;
  public date!: string;
  public userId!: number;
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Expense",
    tableName: "expenses",
    indexes: [
      {
        fields: ["product_name"],
        unique: false,
      },
    ],
  }
);

export { Expense };
