import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME ?? "",
  process.env.SQL_USERNAME ?? "",
  process.env.SQL_PASSWORD ?? "",
  {
    host: process.env.DB_HOST ?? "",
    dialect: "mysql",
  }
);

export default sequelize;
