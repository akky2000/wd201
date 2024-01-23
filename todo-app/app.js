/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
//const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

const path = require("path");
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  let allTodos = await Todo.getTodo();
  let overDue = await Todo.overDue();
  let dueLater = await Todo.dueLater();
  let dueToday = await Todo.dueToday();
  let completeditems = await Todo.completeditems();
  if (req.accepts("html")) {
    res.render("index", {
      title: "Todo App",
      allTodos,
      overDue,
      dueToday,
      dueLater,
      completeditems,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      overDue,
      dueToday,
      dueLater,
      completeditems,
    });
  }
});

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  try {
    let Todos = await Todo.findAll();
    return response.send(Todos);
  } catch (error) {
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
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);

  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }

});

module.exports = app;
