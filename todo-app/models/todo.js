
"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    static async getOverdueTodos() {
      try {
        const allTodos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date(),
            },
          },
        });
        if (allTodos.length >= 1) {
          return allTodos;
        } else {
          await this.addTodo({
            title: "Buy milk",
            dueDate: new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toISOString(),
            completed: false,
          });
          await this.addTodo({
            title: "Buy pen",
            dueDate: new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toISOString(),
            completed: false,
          });
          return this.getOverdueTodos();
        }
      } catch (error) {
        console.error("Error getting overdue todos:", error);
        throw error;
      }
    }

    static async getDueTodayTodos() {
      try {
        const allTodos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.between]: [
                new Date(),
                new Date(new Date().setHours(23, 59, 59, 999)),
              ],
            },
          },
        });
        if (allTodos.length >= 1) {
          return allTodos;
        } else {
          await this.addTodo({
            title: "Buy milk",
            dueDate: new Date().toISOString(),
            completed: false,
          });
          await this.addTodo({
            title: "Buy pen",
            dueDate: new Date().toISOString(),
            completed: false,
          });
          return this.getDueTodayTodos();
        }
      } catch (error) {
        console.error("Error getting due today todos:", error);
        throw error;
      }
    }

    static async getDueLaterTodos() {
      try {
        const allTodos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date(),
            },
          },
        });
        if (allTodos.length >= 1) {
          return allTodos;
        } else {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          await this.addTodo({
            title: "Buy milk",
            dueDate: tomorrow.toISOString(),
            completed: false,
          });
          await this.addTodo({
            title: "Buy pen",
            dueDate: tomorrow.toISOString(),
            completed: false,
          });
          return this.getDueLaterTodos();
        }
      } catch (error) {
        console.error("Error getting due later todos:", error);
        throw error;
      }
    }

    static async getTodos() {
      const allTodos = await this.findAll();
      if (allTodos.length >= 1) {
        return allTodos;
      } else {
        await this.addTodo({
          title: "Buy milk",
          dueDate: new Date().toISOString(),
          completed: false,
        });
        await this.addTodo({
          title: "Buy pen",
          dueDate: new Date().toISOString(),
          completed: false,
        });
        const alTodos = await this.findAll();
        return alTodos;
      }
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
