console.log("Hello, World!");

// This is a simple JavaScript file for a To do List application
let tasks = [];

function addTask() {
    // Function to add a task
    const taskInput = document.getElementById("todo-input");
    const dateInput = document.getElementById("date-input");

    // Check if the inputs are empty
    if (taskInput.value === "" || dateInput.value === "") {
        // Alert the user to enter both task and date
        alert("Please enter a task and a date.");
    } else {
        // Add the task to the tasks array
        tasks.push({
            title: taskInput.value,
            date: dateInput.value,
            completed: false,
        });

        console.log("Task added:", taskInput.value, "on", dateInput.value);
        console.log(tasks);

        renderTasks();
    }

}

function removeAllTask() {
    // Function to remove a task
    tasks = [];

    renderTasks();
}

function toggleFilter() {
    // Function to toggle the filter
}

function completeTask(index) {
    // Function to mark a task as completed
    tasks[index].completed = true;
}

function renderTasks() {
    // Function to render tasks on the page
    const taskList = document.getElementById("todo-list");
    taskList.innerHTML = ""; // Clear the current list

    tasks.forEach((task, index) => {
        taskList.innerHTML += `
        <li class="todo-item flex justify-between items-center bg-white p-4 mb-2">
                    <span>${task.title}</span>
                    <div>
                        <button type="button" class="px-[10px] py-[2px] bg-green-500 text-white rounded-md" onclick="completeTask(${index});">Complete</button>
                        <button class="px-[10px] py-[2px] bg-red-500 text-white rounded-md">Delete</button>
                    </div>
                </li>
        `;
    });
}
