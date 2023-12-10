"use strict";


const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      (await this.overdue()).map((item) => {
        console.log(item.displayableString());
      });
      console.log("\n");

      
      console.log("Due Today");
      (await this.dueToday()).map((item) => {
        console.log(item.displayableString());
      });
      console.log("\n");


      
      console.log("Due Later");
      (await this.dueLater()).map((item) => {
        console.log(item.displayableString());
      });
    }


    
    static async overdue() {
      let todos = [];
      const { Op } = require("sequelize");
      try {
        todos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date().toISOString().slice(0, 10),
            },
          },
        });
      } catch (err) {
        console.error(err);
      }
      return todos;
    }


    
    static async dueToday() {
      let todos = [];
      const { Op } = require("sequelize");
      try {
        todos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.eq]: new Date().toISOString().slice(0, 10),
            },
          },
        });
      } catch (err) {
        console.error(err);
      }
      return todos;
    }



    
    static async dueLater() {
      let todos = [];
      const { Op } = require("sequelize");
      try {
        todos = await Todo.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date().toISOString().slice(0, 10),
            },
          },
        });
      } catch (err) {
        console.error(err);
      }
      return todos;
    }



    
    static async markAsComplete(id) {
      try {
        await Todo.update(
          { completed: true },
          {
            where: {
              id: id,
            },
          }
        );
      } catch (err) {
        console.error(err);
      }
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      if (this.dueDate === new Date().toISOString().slice(0, 10))
        return `${this.id}. ${checkbox} ${this.title}`;
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
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
