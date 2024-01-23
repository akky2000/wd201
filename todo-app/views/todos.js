<div class="flex mb-2">
    <h5><%= title %></h5>
    <span id="<%= id %>" class="px-2 py-1 bg-gray-300 text-gray-900 text-sm font-small ml-2 px-2.5 py-0.5 rounded dark:bg-gray-300 justify-center items-center items" ><%= Due.length %></span>
</div>

<ul class="list-none">
    <% for( var i = 0; i < Due.length; i++) { %>
    <li class="Todo-item">
        <div class="flex items-center w-fit my-2 px-2 py-1 hover:bg-purple-50 rounded">
            <input id="todo-checkbox-<%= Due[i].id %>" type="checkbox" <%=Due[i].completed ? "checked" : "" %> onclick="updateTodo(<%= Due[i].id %>)" class="w-4 h-4 test-blue-600 border-gray-300 ml-2">
            <label for="todo-checkbox-<%= Due[i].id %>" class="ml-2 text-sm text-gray-600 cursor-pointer">
                <%= Due[i].title %>
            </label>
            <a href="#" class="hidden trash-icon ml-2" onclick="deleteTodo(<%= Due[i].id %>)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </a>
        </div>
    </li>
    <% } %>
</ul>


