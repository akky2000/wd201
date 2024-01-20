const express = require('express')

const app = express()
const { Todo } = require('./models')
const bodyParser = require('body-parser')

const path = require('path')
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))


app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.get('/', async function (request, response) {
  const allTodos = await Todo.getTodos()
  const duetoday = await Todo.dueToday()
  const overdue = await Todo.overDue()
  const duelater = await Todo.dueLater()
 
  if (request.accepts('html')) {
    response.render('index', {
      allTodos,
      duetoday,
      overdue,
      duelater,
      
      csrfToken: request.csrfToken()
    })
  } else {
    response.json({ allTodos, duetoday, overdue, duelater })
  }
})
app.get('/todos', async function (_request, response) {
  try {
    console.log('Processing list of all Todos ...')
    // FILL IN YOUR CODE HERE

    // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
    // Then, we have to respond with all Todos, like:
    // response.send(todos)
    const todos = await Todo.findAll()
    response.json(todos)
  } catch (error) {
    console.log(error)
    return response.status(500).json(error)
  }
})

app.get('/todos/:id', async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id)
    return response.json(todo)
  } catch (error) {
    console.log(error)
    return response.status(500).json(error)
  }
})

app.post('/todos', async function (request, response) {
  console.log('Creating a todo', request.body)
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate
    })
    return response.redirect('/')
  } catch (error) {
    // Handle unexpected errors
    console.error(error)
    return response.status(422).json({ error: 'Internal Server Error' })
  }
})
app.put('/todos/:id', async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id)
    const { completed } = request.body
    const updatedTodo = await todo.setCompletionStatus(completed)
    return response.json(updatedTodo)
  } catch (error) {
    console.log(error)
    return response.status(500).json(error)
  }
})

app.delete('/todos/:id', async function (request, response) {
  // FILL IN YOUR CODE HERE

  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
  try {
    console.log('We have to delete a Todo with ID: ', request.params.id)
    const Itemdeleted = await Todo.destroy({
      where: {
        id: request.params.id
      }
    })
    // eslint-disable-next-line no-unneeded-ternary
    response.send(Itemdeleted ? true : false)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

module.exports = app
