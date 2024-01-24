"use strict";
const { Model,Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      Todo.belongsTo(models.User,{
        foreignKey:'userId'
      });
      // define association here
    }

    static addTodo({ title, dueDate ,userId}) {
      return this.create({ title: title, dueDate: dueDate, completed: false, userId });
    }

    static getTodos() {
      return this.findAll();
    }

    static async remove(id,userId){
      return this.destroy({
        where:{
          id,
          userId
        },
      });
    }

    static async OverdueTodos(userId) {
      const date = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: date,
          },
          userId,
          completed: false,
        },
      });
    }

    static async dueTodayTodos(userId) {
      const date = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: date,
          },
          userId,
          completed: false,
        },
      });
    }

    static async dueLaterTodos(userId) {
      const date = new Date();
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: date,
          },
          userId,
          completed: false,
        },
      });
    }

    static async CompletedTodos(userId) {
      return this.findAll({
        where: {
          completed:true,
          userId
        },
      });
    }

    setCompletionStatus(completed) {
      const status = !completed;
      return this.update({ completed: status });
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
    },
  );
  return Todo;
};
