/* eslint-disable require-jsdoc */
'use strict';
const {
  Model, Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }

    static addTodo({title, dueDate}) {
      return this.create({title: title, dueDate: dueDate, completed: false});
    }

    static async getTodos(){
      return this.findAll();
    }

   static async getOverdueTodos() {
      try {
        const overdueTodos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date(),
            },
          },
        });
        return overdueTodos;
      } catch (error) {
        console.error('Error getting overdue todos:', error);
        throw error;
      }
    }

    static async getDueTodayTodos() {
      try {
        const dueTodayTodos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.between]: [new Date(), new Date(new Date().setHours(23, 59, 59, 999))],
            },
          },
        });
        return dueTodayTodos;
      } catch (error) {
        console.error('Error getting due today todos:', error);
        throw error;
      }
    }

    static async getDueLaterTodos() {
      try {
        const dueLaterTodos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date(),
            },
          },
        });
        return dueLaterTodos;
      } catch (error) {
        console.error('Error getting due later todos:', error);
        throw error;
      }
    }


    static async remove(id) {
      return this.destroy({
        where: {
          id,
        }
      })
    }

    setCompletionStatus(receiver) {
      return this.update({ completed: receiver });
    }
    
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};
