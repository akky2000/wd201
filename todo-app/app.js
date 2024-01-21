const express = require("express");
const app = express();
const { Todo } = require("./models");

const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/todos", function (request, response) {
  console.log("Todo List", request.body);
});
app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  try {
 
    const allTodos = await Todo.getTodos();
    const overdueTodos = await Todo.isOverdue();
    const dueTodayTodos = await Todo.isDueToday();
    const dueLaterTodos = await Todo.isDueLater();
   

    if (request.accepts("html")) {
      response.render('index.ejs', 'todos.ejs'{
        allTodos,
         overdue: overdueTodos,
               duetoday:dueTodayTodos,
         duelater: dueLaterTodos,
      
      });
    } else {
      response.json({
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos
      });
    }
  } catch (error) {
    console.error(error);
    response.status(404).json({ error: "rendering Error" });
  }
});


app.use(express.static(path.join(__dirname,'public')));

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE

  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
  try{
    const todo = await Todo.findAll();
    return response.json(todo);

  } catch(error){
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE

  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
  const deleteFlag = await Todo.destroy({ where: { id: request.params.id}})
   response.send(deleteFlag?true:false)
});

module.exports = app;
