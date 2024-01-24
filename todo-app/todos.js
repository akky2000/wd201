const { Todo } = require("./models");

async function addTodos() {
    try {
        await Todo.addTodo({
            title: "ExampleTodo 5",
            dueDate: "2022-01-12",
        });
        await Todo.addTodo({
            title: "ExampleTodo 6",
            dueDate: "2022-01-22",
        });
        await Todo.addTodo({
            title: "ExampleTodo 7",
            dueDate: "2022-01-25",
        });


        // Add more todos as needed...

        console.log("Todos added successfully!");
    } catch (error) {
        console.error("Error adding todos:", error);
    }
}

addTodos();
