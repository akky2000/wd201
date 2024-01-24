/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");

var csrf = require("tiny-csrf");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const flash = require("connect-flash");
const LocalStrategy = require('passport-local');

const bcrypt = require('bcrypt');

const saltRounds = 10;



//const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(flash());
const { error } = require("console");
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.use(session({
  secret: "my-super-secret-key-23456789234568",
  cookie: {
    maxAge: 24 * 60 * 60* 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());



passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (username, password, done) => {
  User.findOne({ 
    where: { email: username }
  })
   .then(async function (user) {
     const result = await bcrypt.compare(password, user.password);
     if (result) {
       return done(null, user);
     }
     else {
       return done(null, false, { message: "Invalid User Credentials" });
     }
   })
   .catch((error) => {
     return done(null, false, { message: "Invalid User Credentials" });
   });
}));

passport.serializeUser((user, done) => {
  console.log("Serialing user in session", user.id);
  done(null,user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => {
      done( null, user)
    })
    .catch(error => {
      done(error, null)
    })
});

module.exports = {
  "**/*.js": ["eslint --fix", "prettier --write"],
};

app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});


app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const loggedInUser = req.user.id;
  let allTodos = await Todo.getTodo(loggedInUser);
  let overDue = await Todo.overDue(loggedInUser);
  let dueLater = await Todo.dueLater(loggedInUser);
  let dueToday = await Todo.dueToday(loggedInUser);
  let completeditems = await Todo.completeditems(loggedInUser);
  if (req.accepts("html")) {
    res.render("todos", {
      title: "Todo application",
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
})

app.get("/signup", (request, response) => {
  response.render("signup", { title: "Signup" , csrfToken: request.csrfToken()});
  
})

app.post("/users", async (request, response) => {
  // Hash password using bcrypt
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);
  if (request.body.firstName.length == 0) {
    request.flash("error", "First name can't be empty!");
    return response.redirect("/signup");
  } else if (request.body.email.length == 0) {
    request.flash("error", "E-mail can't be empty!");
    return response.redirect("/signup");
  } else if (request.body.password.trim().length == 0) {
    request.flash("error", "Fill the Password!");
    return response.redirect("/signup");
  }
  try { 
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd
    });
    request.login(user, (err) => {
      if(err) {
        console.log(err)
      }
      response.redirect("/todos");
    })
  } catch (error) {
    console.log(error);
    request.flash("error", "E-mail already in use!");
    response.redirect("/signup");
  }
})


app.get("/login", (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken()});
})

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

app.get("/signout",(request,response, next) => {
  request.logout((err)=>{ 
    if (err){ 
      return next(err);
    }
    response.redirect("/");
  })
});

app.get("/todos", async function (request, response) {
  console.log("creating a todo", request.body);
  console.log(request.user);
  if (!request.body.title) {
    request.flash("error", "ADD TITLE TO YOUR TODO!");
    return response.redirect("/todos");
  }
  if (!request.body.dueDate) {
    request.flash("error", "TODO ITEM MUST CONTAIN DATE!");
    return response.redirect("/todos");
  }
  if (request.body.title.length < 5) {
    request.flash("error", "TODO ITEM LENGTH IS LESS THAN 5!");
    return response.redirect("/todos");
  }
  try {
    await Todo.addTodo({
      title: request.body.title,
      duedate: request.body.dueDate,
      completed: request.body.completed,
      userId: request.user.id,
    });
    return response.redirect("/todos");
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

app.post("/todos",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  console.log("Creating a tod", request.body);
  console.log(request.user);
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      userId: request.user.id
    });
    return response.redirect("/todos");
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

app.delete("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("Delete a todo by ID: ", request.params.id);
  try {
    const st = await Todo.remove(request.params.id, request.user.id);
    return response.json(st > 0);
  }
  catch (error) {
    return response.status(422).json(error);
  }
});

module.exports = app;
