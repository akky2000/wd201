/* eslint-disable no-const-assign */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
const passport = require("passport");

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
    let res = await agent.get("/login");
    let csrfToken = extractCsrfToken(res);
    res = await agent.post("/session").send({
        email: username,
        password: password,
        _csrf: csrfToken,
    });
};

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
        firstname: "Test",
        lastName: "user",
        email: "user@qqq.www",
        password: "133322",
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
  })

  test("create a new todo", async () => {
    const agent = request.agent(server);
    await login(agent, "user@qqq.www", "133322");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    response = await agent.post("/todos").send({
        title: "Buy Milk",
        dueDate: new Date().toISOString(),
        completed: false,
        _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  })

  

  

  test("Marking a sample overdue item as completed", async () => {
    const agent = request.agent(server);
    await login(agent, "user@qqq.www", "133322");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
        title: "Buy Milk",
        dueDate: new Date().toISOString(),
        completed: false,
        _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent 
        .get("/todos")
        .set("Accept", "application/json");

    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompletedResponse = await agent
        .put(`/todos/${latestTodo.id}`)
        .send({
            _csrf:csrfToken,
            completed: true,
        });
    
    const parsedUpdateResponse = JSON.parse(markCompletedResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  

  test("Deletes a todo with the given ID", async () => {
    const agent = request.agent(server);
    await login(agent, "user@qqq.www", "133322");
    var res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");

    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const DeletedResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    expect(Boolean(DeletedResponse.text)).toBe(true);
  });
});

