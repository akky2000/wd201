/* eslint-disable no-unused-vars */
const {request, response} = require('express');
const express = require('express');
const app = express();
const csrf = require('tiny-csrf');

const {Todo} = require('./models');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({extended: false}));
const path = require('path');

app.use(bodyParser.json());
app.use(cookieParser('ssh!!!! some secret string'));
app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']));


// seting the ejs is the engine
app.set('view engine', 'ejs');

app.get('/', async (request, response)=>{
  const allTodos = await Todo.getTodos();
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completedItems = await Todo.completedItems();
  if (request.accepts('html')) {
    response.render('index', {
      allTodos, overdue, dueToday, dueLater, completedItems,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({allTodos, overdue, dueToday, dueLater});
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/todos', (request, response)=>{
  console.log('Todo List', request.body);
});

app.post("/todos", async (request, response) => {
   console.log("Creating a todo", request.body);
   try {
      await Todo.addTodo({
         title: request.body.title,
         dueDate: request.body.dueDate,
         completed: false
      });
      return response.redirect("/");
   } catch (error) {
      console.error(error);
      return response.status(422).json(error);
   }
});

app.put('/todos/:id', async (req, res) => {
  console.log("Updating a todo with ID:", req.params.id);

  try {
    const todoId = req.params.id;
    const { completed } = req.body;

    // Find the todo by ID
    const todo = await Todo.findByPk(todoId);

    if (!todo) {
      return response.status(404).json({ error: 'Todo not found' });
    }

    // Update the completion status
    await todo.update({ completed });

    // Fetch the updated todo to get the latest data
    const updatedTodo = await Todo.findByPk(todoId);

    response.status(200).json({ message: 'Todo updated successfully', todo: updatedTodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

 app.delete('/todos/:id', async (req, res) => {
  
   try {
     const todoId = req.params.id;
 
     const todo = await Todo.findByPk(todoId);
 
     if (!todo) {
       return res.status(404).json({ error: 'Todo not found' });
     }
 
     await todo.destroy();
 
     res.status(204).end(); // No content
   } catch (error) {
     console.error(error);
     res.status(500).json({ error: 'Internal Server Error' });
   }
 });
 
 module.exports = app;
