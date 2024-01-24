/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCSRFToken(res) {
  let $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCSRFToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCSRFToken(res);
    res = await agent.post("/users").send({
      firstName: " Test",
      lastName: "User A",
      email: "user.a@test.com",
      password: "123456",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Create a todo ", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "123456");
    const res = await agent.get("/todos");
    const csrfToken = extractCSRFToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "123456");
    let res = await agent.get("/todos");
    let csrfToken = extractCSRFToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    console.log(parsedGroupedResponse, "ll");
    const allTodos = parsedGroupedResponse.allTodos;
    const todoCount = allTodos.length;
    const latestTodo = allTodos[todoCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCSRFToken(res);
    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });
    const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(true);
  });

  test("Marks a todo as incomplete", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "123456");
    let res = await agent.get("/todos");
    let csrfToken = extractCSRFToken(res);
    await agent.post("/todos").send({
      title: "Recharge Mobile",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const allTodos = parsedGroupedResponse.allTodos;
    const todoCount = allTodos.length;
    const latestTodo = allTodos[todoCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCSRFToken(res);
    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({
        completed: false,
        _csrf: csrfToken,
      });
    const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(false);
  });

  test("Deletes a todo ", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "123456");
    let res = await agent.get("/todos");
    let csrfToken = extractCSRFToken(res);
    await agent.post("/todos").send({
      title: "Change bulb ",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const allTodos = parsedGroupedResponse.allTodos;
    const todoCount = allTodos.length;
    const latestTodo = allTodos[todoCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCSRFToken(res);
    const deleteTodoResponse = await agent
      .delete(`/todos/${latestTodo.id}/`)
      .send({
        _csrf: csrfToken,
      });
    const parsedDeletedResponse = JSON.parse(deleteTodoResponse.text);
    expect(parsedDeletedResponse.success).toBe(true);
  });
});
