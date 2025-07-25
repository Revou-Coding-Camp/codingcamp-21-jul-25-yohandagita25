// Get DOM elements
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const addButton = document.getElementById('add-button');
const taskTableBody = document.getElementById('task-table-body');
const messageBox = document.getElementById('message-box');
const messageIcon = document.getElementById('message-icon');
const messageText = document.getElementById('message-text');
const totalTasksValue = document.getElementById('total-tasks-value');
const completedTasksValue = document.getElementById('completed-tasks-value');
const pendingTasksValue = document.getElementById('pending-tasks-value');
const progressValue = document.getElementById('progress-value');
const deleteAllButton = document.getElementById('delete-all-button');
const searchInput = document.getElementById('search-input');
const sortButton = document.getElementById('sort-button');

// Array to store tasks
let tasks = [];

// Variable to store current sort criterion and direction
let currentSortCriterion = 'none'; // 'name', 'dueDate', 'status'
let sortDirection = 'asc'; // 'asc' for ascending, 'desc' for descending

// Variable to store the ID of the task being edited
let editingTaskId = null;

// Function to update statistics and button states
function updateStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Selesai').length;
    const pendingTasks = totalTasks - completedTasks;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    totalTasksValue.textContent = totalTasks;
    completedTasksValue.textContent = completedTasks;
    pendingTasksValue.textContent = pendingTasks;
    progressValue.textContent = `${progress}%`;

    // Disable sort button if no tasks
    if (totalTasks === 0) {
        sortButton.disabled = true;
        sortButton.classList.add('disabled-button'); // Add a class for disabled styling
    } else {
        sortButton.disabled = false;
        sortButton.classList.remove('disabled-button'); // Remove disabled styling
    }
}

// Function to show message (success or error)
function showMessage(message, type = 'success') {
    messageText.textContent = message;

    // Reset classes for message box
    messageBox.classList.remove('success-message', 'error-message');
    // Reset classes for icon
    messageIcon.classList.remove('fa-check-circle', 'fa-exclamation-circle', 'success-icon-color', 'error-icon-color');
    // Reset classes for text
    messageText.classList.remove('success-text-color', 'error-text-color');


    if (type === 'success') {
        messageBox.classList.add('success-message');
        messageIcon.classList.add('fa-check-circle', 'success-icon-color');
        messageText.classList.add('success-text-color');
    } else if (type === 'error') {
        messageBox.classList.add('error-message');
        messageIcon.classList.add('fa-exclamation-circle', 'error-icon-color');
        messageText.classList.add('error-text-color');
    }

    messageBox.style.display = 'flex';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

// Function to sort tasks
function sortTasks(tasksToSort) {
    if (currentSortCriterion === 'none') {
        return tasksToSort; // No sorting applied
    }

    // Create a copy to avoid modifying the original array directly
    const sortedTasks = [...tasksToSort];

    sortedTasks.sort((a, b) => {
        let comparison = 0;

        if (currentSortCriterion === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else if (currentSortCriterion === 'dueDate') {
            // Handle "Tidak ada tanggal jatuh tempo" by pushing them to the end
            const dateA = a.dueDate === '' ? '9999-12-31' : a.dueDate; // Far future date for no due date
            const dateB = b.dueDate === '' ? '9999-12-31' : b.dueDate;
            comparison = dateA.localeCompare(dateB);
        } else if (currentSortCriterion === 'status') {
            // Custom order: Menunggu < Selesai
            const statusOrder = { 'Menunggu': 1, 'Selesai': 2 };
            comparison = statusOrder[a.status] - statusOrder[b.status];
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sortedTasks;
}

// Function to render tasks
function renderTasks(tasksToRender = tasks) {
    taskTableBody.innerHTML = ''; // Clear existing tasks

    const displayTasks = sortTasks(tasksToRender); // Sort tasks before rendering

    displayTasks.forEach(task => {
        const row = document.createElement('tr');
        row.classList.add('table-row');
        if (task.status === 'Selesai') {
            row.classList.add('completed-task');
        }

        const dueDateDisplay = task.dueDate ? task.dueDate : 'Tidak ada tanggal jatuh tempo';
        const statusBadgeClass = task.status === 'Menunggu' ? 'yellow-badge' : 'green-badge';
        const statusText = task.status;

        row.innerHTML = `
            <td class="table-data">${task.name}</td>
            <td class="table-data">${dueDateDisplay}</td>
            <td class="table-data">
                <span class="status-badge ${statusBadgeClass}">${statusText}</span>
            </td>
            <td class="table-data center-text">
                <div class="action-buttons">
                    <button class="action-button blue-button" data-id="${task.id}" onclick="toggleTaskStatus(this.dataset.id)">
                        <i class="fas ${task.status === 'Selesai' ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="action-button orange-button" data-id="${task.id}" onclick="editTask(this.dataset.id)">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-button red-button" data-id="${task.id}" onclick="deleteTask(this.dataset.id)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        taskTableBody.appendChild(row);
    });
    updateStatistics(); // Statistics and button states always reflect the main 'tasks' array
}

// Set the minimum date for the date input to today
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    document.getElementById('date-input').setAttribute('min', todayFormatted);
});

// Function to add a new task or update an existing task
addButton.addEventListener('click', () => {
    const taskName = taskInput.value.trim();
    const dueDate = dateInput.value;

    if (taskName === '' || dueDate === '') {
        console.log('Nama tugas dan tanggal harus diisi!');
        showMessage('Nama tugas dan tanggal harus diisi!', 'error');
        return;
    }

    if (editingTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].name = taskName;
            tasks[taskIndex].dueDate = dueDate;
            showMessage('Tugas berhasil diperbarui!', 'success');
        }
        editingTaskId = null; // Reset editing state
        addButton.innerHTML = '<i class="fas fa-plus add-icon"></i> Tambah'; // Change button back to "Tambah"
    } else {
        // Add new task
        const newTask = {
            id: crypto.randomUUID(), // Assign a unique ID to each task
            name: taskName,
            dueDate: dueDate,
            status: 'Menunggu' // Default status
        };
        tasks.push(newTask);
        showMessage('Tugas berhasil ditambahkan!', 'success');
    }

    renderTasks(); // Re-render the table
    // Clear inputs
    taskInput.value = '';
    dateInput.value = '';
});

// Function to toggle task status (Completed/Pending)
function toggleTaskStatus(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        if (tasks[taskIndex].status === 'Menunggu') {
            tasks[taskIndex].status = 'Selesai';
        } else {
            tasks[taskIndex].status = 'Menunggu';
        }
        renderTasks(); // Re-render to update status and button icon
    }
}

// Function to delete a task
function deleteTask(taskId) {
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== taskId); // Filter out the task with the given ID
    if (tasks.length < initialLength) { // Check if a task was actually removed
        renderTasks(); // Re-render the table
        showMessage('Tugas berhasil dihapus!', 'success');
    }
}

// Function to edit a task
function editTask(taskId) {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
        taskInput.value = taskToEdit.name;
        dateInput.value = taskToEdit.dueDate;
        editingTaskId = taskId; // Set the ID of the task being edited
        addButton.innerHTML = '<i class="fas fa-save add-icon"></i> Perbarui'; // Change button text and icon
        showMessage('Mode Edit: Perbarui tugas di atas', 'info'); // Optional: show info message
    }
}

// Function to delete all tasks
deleteAllButton.addEventListener('click', () => {
    if (tasks.length === 0) {
        showMessage('Tidak ada tugas untuk dihapus!', 'error');
        return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
        tasks = []; // Clear all tasks
        renderTasks(); // Re-render the table
        showMessage('Semua tugas berhasil dihapus!', 'success');
    }
});

// Search functionality
searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchTerm) ||
        task.dueDate.toLowerCase().includes(searchTerm) ||
        task.status.toLowerCase().includes(searchTerm)
    );
    renderTasks(filteredTasks); // Render only the filtered tasks
});

// Sort button interaction
sortButton.addEventListener('click', () => {
    // Check if the button is disabled (no tasks)
    if (sortButton.disabled) {
        showMessage('Tidak ada tugas untuk diurutkan!', 'error');
        return;
    }

    // Cycle through sort criteria: none -> name -> dueDate -> status -> none
    if (currentSortCriterion === 'none') {
        currentSortCriterion = 'name';
        sortDirection = 'asc';
        showMessage('Diurutkan berdasarkan Nama (A-Z)', 'success');
    } else if (currentSortCriterion === 'name') {
        currentSortCriterion = 'dueDate';
        sortDirection = 'asc';
        showMessage('Diurutkan berdasarkan Tanggal Jatuh Tempo (Terdekat)', 'success');
    } else if (currentSortCriterion === 'dueDate') {
        currentSortCriterion = 'status';
        sortDirection = 'asc';
        showMessage('Diurutkan berdasarkan Status (Menunggu dulu)', 'success');
    } else {
        currentSortCriterion = 'none';
        showMessage('Urutan direset', 'success');
    }
    renderTasks(); // Re-render with new sort order
    searchInput.value = ''; // Clear search input when sorting
});


// Initial render when the page loads
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
});
