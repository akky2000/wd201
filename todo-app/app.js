/* eslint-disable no-undef */
const express = require("express");
const csrf = require("tiny-csrf");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;
app.use(flash());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((err) => {
          console.log(err);
          return done(null, false, { message: "Invalid account credentials" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("serializing user in session ", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      console.log("deserializing user from session ", user.id);
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
const ensureNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated, redirect to "/todos" or any other appropriate page
    return res.redirect("/todos");
  }
  // User is not authenticated, continue to the next middleware
  return next();
};

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

// set ejs as view engine
app.set("view engine", "ejs");

// eslint-disable-next-line no-unused-vars
app.get("/", ensureNotAuthenticated, async (request, response) => {
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

// eslint-disable-next-line no-unused-vars
app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log(request.user);
    const loggedInUserFirstName = request.user.firstName;
    const loggedInUser = request.user.id;
    const allTodos = await Todo.getTodos(loggedInUser);
    const overdueTodos = await Todo.getOverdueTodos(loggedInUser);
    const dueTodayTodos = await Todo.getDueTodayTodos(loggedInUser);
    const dueLaterTodos = await Todo.getDueLaterTodos(loggedInUser);
    const completedTodos = await Todo.getCompletedTodos(loggedInUser);
    if (request.accepts("html")) {
      response.render("todos", {
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
        loggedInUserFirstName,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
      });
    }
  }
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/signup", ensureNotAuthenticated, (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  // Hash the password
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  // Have to create the user here
  console.log(hashedPwd);

  if (request.body.firstName.trim() === "") {
    request.flash("error", "First name cannot be empty");
    return response.redirect("/signup");
  }
  if (request.body.email.trim() === "") {
    request.flash("error", "Email cannot be empty");
    return response.redirect("/signup");
  }
  if (request.body.password.trim() === "") {
    request.flash("error", "Password cannot be empty");
    return response.redirect("/signup");
  }
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
        request.flash("error", "User account already exists");
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
    request.flash("error", "User account already exists");
  }
});

app.get("/login", ensureNotAuthenticated, (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

// eslint-disable-next-line no-unused-vars
app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("Processing list of all Todos ...");
    // FILL IN YOUR CODE HERE
    try {
      const todos = await Todo.findAll();
      return response.json(todos);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
    // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
    // Then, we have to respond with all Todos, like:
    // response.send(todos)
  }
);

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log(request.user);
    if (request.body.title.trim() === "") {
      request.flash("error", "Title cannot be empty");
      return response.redirect("/todos");
    }
    if (request.body.title.trim().length < 5) {
      request.flash("error", "Title length should be greater than 5 ");
      return response.redirect("/todos");
    }
    if (request.body.dueDate.trim() === "") {
      request.flash("error", "Due date cannot be empty");
      return response.redirect("/todos");
    }
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

// eslint-disable-next-line no-unused-vars
app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    try {
      await Todo.remove(request.params.id, request.user.id);
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

module.exports = app;
