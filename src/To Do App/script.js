const inputBox = document.getElementById("inputBox");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");

let editToDo = null;

const addToDo = () => {
  const inputText = inputBox.value.trim();
  if (inputText.length <= 0) {
    alert("Please write something....");
    return;
  }

  if (addBtn.value === "Edit") {
    const oldText = editToDo.querySelector("p").innerText;
    editToDo.querySelector("p").innerText = inputText;
    editLocalTodos(oldText);
    addBtn.value = "Add";
    inputBox.value = "";
    editToDo = null;
  } else {
    // Create p tag
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.innerHTML = inputText;
    li.appendChild(p);

    // Create Edit Button
    const editButton = document.createElement("button");
    editButton.innerHTML = `<i class="fa-regular fa-pen-to-square"></i>`;
    editButton.classList.add("btn", "editBtn");
    li.appendChild(editButton);

    // Create Delete Button
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;
    deleteButton.classList.add("btn", "deleteBtn");
    li.appendChild(deleteButton);

    todoList.appendChild(li);

    inputBox.value = "";
    saveLocalToDo(inputText);
  }
};

const updateToDo = (e) => {
  // Add Delete Button Functionality
  const deleteBtn = e.target.closest(".deleteBtn");

  if (deleteBtn) {
    const li = deleteBtn.parentElement;
    deleteLocalTodos(li);
    todoList.removeChild(li);
    return;
  }

  // Add Edit Button Functionality
  const editBtn = e.target.closest(".editBtn");

  if (editBtn) {
    inputBox.value = editBtn.previousElementSibling.innerText;
    inputBox.focus();
    addBtn.value = "Edit";
    editToDo = editBtn.parentElement;
  }
};

const saveLocalToDo = (todo) => {
  let todos;

  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }

  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
};

const getLocalTodos = () => {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
    todos.forEach((todo) => {
      // Create p tag
      const li = document.createElement("li");
      const p = document.createElement("p");
      p.innerHTML = todo;
      li.appendChild(p);

      // Create Edit Button
      const editBtn = document.createElement("button");
      editBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i>`;
      editBtn.classList.add("btn", "editBtn");
      li.appendChild(editBtn);

      // Create Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;
      deleteBtn.classList.add("btn", "deleteBtn");
      li.appendChild(deleteBtn);

      todoList.appendChild(li);
    });
  }
};

const deleteLocalTodos = (todo) => {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }

  let todoText = todo.children[0].innerHTML;
  let todoIndex = todos.indexOf(todoText);
  todos.splice(todoIndex, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
};

const editLocalTodos = (oldTodo) => {
  let todos = JSON.parse(localStorage.getItem("todos"));
  let index = todos.indexOf(oldTodo);
  if (index !== -1) {
    todos[index] = inputBox.value;
    localStorage.setItem("todos", JSON.stringify(todos));
  }
};

addBtn.addEventListener("click", addToDo);
todoList.addEventListener("click", updateToDo);
window.addEventListener("DOMContentLoaded", getLocalTodos);
