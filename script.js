const todoInput = document.querySelector("#todo-input");
const todosContainer = document.querySelector("#todos-container");
const completedCountElement = document.querySelector("#completed-count");

let elem = null;
let todos = [];

// Task class to encapsulate task creation and management
class Task {
  constructor(value, checked = false) {
    this.value = value;
    this.checked = checked;
  }
}

// Helper function to check if an element is before another in DOM
const isBefore = (el1, el2) => {
  for (
    let cur = el1.previousSibling;
    cur && cur.nodeType !== 9;
    cur = cur.previousSibling
  ) {
    if (cur === el2) return true;
  }
  return false;
};

// Event listener for 'Enter' key press to add new todo
todoInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter" || e.keyCode === 13) {
    const todoValue = e.target.value.trim();
    if (todoValue) {
      todos.push(new Task(todoValue));
      newTodo(todoValue);
      todoInput.value = "";
      updateCount();
    }
  }
});

// Function to create and render a new todo item
const newTodo = (value) => {
  const todo = document.createElement("div");
  const todoText = document.createElement("p");
  const todoCheckBox = document.createElement("input");
  const todoCheckBoxLabel = document.createElement("label");
  const todoCross = document.createElement("span");

  const { checked } = todos.find((t) => t.value === value);

  const uniqueId = `checkbox-${Date.now()}`;
  todoText.textContent = value;
  todoCheckBox.type = "checkbox";
  todoCheckBox.id = uniqueId;
  todoCheckBox.style.cursor = "pointer";
  todoCheckBoxLabel.htmlFor = uniqueId;

  todoCheckBox.checked = checked;
  todoText.style.textDecoration = checked ? "line-through" : "none";
  todoCheckBoxLabel.classList.toggle("active", checked);

  // Checkbox change listener to update task status
  todoCheckBox.addEventListener("change", () => {
    const task = todos.find((t) => t.value === value);
    task.checked = todoCheckBox.checked;
    todoText.style.textDecoration = task.checked ? "line-through" : "none";
    todoCheckBoxLabel.classList.toggle("active", task.checked);
    updateCount();
  });

  todoCross.textContent = "✖";
  todoCross.style.cursor = "pointer";

  // Cross icon click listener to remove task
  todoCross.addEventListener("click", (e) => {
    todos = todos.filter((t) => t.value !== value);
    e.target.parentElement.remove();
    updateCount();
  });

  todo.classList.add("todo");
  todoCheckBoxLabel.classList.add("circle");
  todoCross.classList.add("cross");

  todo.appendChild(todoCheckBox);
  todo.appendChild(todoCheckBoxLabel);
  todo.appendChild(todoText);
  todo.appendChild(todoCross);

  // Drag-and-drop functionality
  todo.draggable = true;
  todo.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", null);
    elem = e.target;
  });

  todo.addEventListener("dragover", (e) => {
    e.preventDefault();
    const el1 = e.target.closest(".todo");
    if (el1 && el1 !== elem) {
      if (isBefore(elem, el1)) {
        el1.parentNode.insertBefore(elem, el1);
      } else {
        el1.parentNode.insertBefore(elem, el1.nextSibling);
      }
    }
  });

  todo.addEventListener("dragend", () => {
    elem = null;

    // Update todos array after drag-and-drop reorder
    todos = Array.from(document.querySelectorAll(".todo")).map(
      (todoElement) => {
        const text = todoElement.querySelector("p").textContent;
        const isChecked = todoElement.querySelector("input").checked;
        return new Task(text, isChecked);
      }
    );
    updateCount();
  });

  todosContainer.appendChild(todo);
};

// Function to update and display the count of remaining tasks
const updateCount = () => {
  const activeCount = todos.filter(({ checked }) => !checked).length;
  completedCountElement.textContent = `${activeCount} items left`;
};

// Show all tasks
const showAll = () => {
  document.querySelectorAll(".filters div").forEach((d, i) => {
    d.classList.toggle("filterActive", i === 0);
  });
  document.querySelectorAll(".todo").forEach((todo) => {
    todo.style.display = "grid";
  });
};

// Filter and show only completed tasks
const filterCompleted = () => {
  document.querySelectorAll(".filters div").forEach((d, i) => {
    d.classList.toggle("filterActive", i === 2);
  });
  document.querySelectorAll(".todo").forEach((todo) => {
    todo.style.display = todo.querySelector("input").checked ? "grid" : "none";
  });
};

// Filter and show only active (incomplete) tasks
const filterActive = () => {
  document.querySelectorAll(".filters div").forEach((d, i) => {
    d.classList.toggle("filterActive", i === 1);
  });
  document.querySelectorAll(".todo").forEach((todo) => {
    todo.style.display = !todo.querySelector("input").checked ? "grid" : "none";
  });
};

// Clear all completed tasks
const clearCompleted = () => {
  document.querySelectorAll(".todo").forEach((todo) => {
    if (todo.querySelector("input").checked) {
      todo.remove();
    }
  });
  todos = todos.filter(({ checked }) => !checked);
  updateCount();
};

// Change theme (light/dark mode)
const changeTheme = () => {
  document.body.classList.toggle("light");
};

function updateTaskCounter() {
  const taskCounter = document.getElementById('taskCounter');
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
  const taskCount = todos.filter(todo => !todo.completed).length;

  taskCounter.textContent = `You have ${taskCount} task${taskCount === 1 ? '' : 's'} pending`;

  // Add or remove the 'many-tasks' class based on task count
  if (taskCount > 3) {
    taskCounter.classList.add('many-tasks');
  } else {
    taskCounter.classList.remove('many-tasks');
  }
}

// Initialize everything when the page loads
window.onload = function () {
  updateGreeting();
  updateTaskCounter();
  setupButton();

  // Update greeting every minute
  setInterval(updateGreeting, 60000);
  // Update task counter every 5 seconds (for demo)
  setInterval(updateTaskCounter, 5000);
};