document.getElementById('globalAddTodoButton').addEventListener('click', async function (event) {
    const categoryId = selectedCategoryId || event.target.dataset.categoryId;
    const text = `Add your todo here...`;

    const uniqueId = Date.now();
    const uniqueText = text + '\u200B'.repeat(uniqueId % 1000);

    try {
        const response = await fetch('http://localhost:3000/todo/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                text: uniqueText,
                completed: false,
                categoryId
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('todo success');
            getTodos(categoryId);
        } else {
            ntf('Failed to add todo: ' + data.message, 'error');
        }
    } catch (err) {
        console.error('Error:', err);
    }
});

async function getTodos(categoryId) {
    try {
        const response = await fetch(`/todo/get?categoryId=${categoryId}`, { credentials: 'include' });
        const data = await response.json();
        const todosContainer = document.getElementById(`todos-${categoryId}`);
        if (!todosContainer) {
            console.error(`todosContainer with ID todos-${categoryId} not found`);
            return;
        }

        todosContainer.innerHTML = '';

        if (!data.success) {
            console.log('Error', data.message);
            return;
        }

        if (data.todos && data.todos.length > 0) {
            console.log(`Found ${data.todos.length} todos for category ${categoryId}`);
        } else {
            console.log(`No todos found for category ${categoryId}`);
        }

        data.todos.forEach(function (todo) {
            const todoElement = document.createElement('div');
            todoElement.className = 'todo-item-container';
            const positionStyle = todo.position ?
                `style="width: ${todo.position.width || 250}px; height: ${todo.position.height || 100}px; transform: translate(${todo.position.x || 0}px, ${todo.position.y || 0}px);"` : '';
            const positionData = todo.position ?
                `data-x="${todo.position.x || 0}" data-y="${todo.position.y || 0}"` : 'data-x="0" data-y="0"';

            todoElement.innerHTML = `
                <div class="todo-item resize-drag" ${positionStyle} ${positionData} data-todo-id="${todo._id}">
                  <div class="todo-content">
                    <input type="checkbox" class="todo-checkbox" data-todo-id="${todo._id}" ${todo.completed ? 'checked' : ''}>
                    <input type="text" class="todo-text" value="${todo.text}" data-todo-id="${todo._id}" >
                    <button class="add-todo" onClick="addTodo('${todo._id}')">Add</button>
                    <button class="delete-todo" onClick="deleteTodo('${todo._id}')">Delete</button>
                  </div>
                </div>
              `;

            todosContainer.appendChild(todoElement);


            const checkbox = todoElement.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', (event) => {
                const isChecked = event.target.checked;
                const todoId = event.target.dataset.todoId;
                updateTodoStatus(todoId, isChecked);

                const todoText = event.target.nextElementSibling;
                if (isChecked) {
                    todoText.classList.add('completed');
                } else {
                    todoText.classList.remove('completed');
                }
            });
        });


        if (!document.getElementById('todo-styles')) {
            style.id = 'todo-styles';
            document.head.appendChild(style);
        }

        if (data.success) {
            console.log("Success get todo data");
        } else {
            console.log("Error get todo data");
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}
interact('.todo-item.resize-drag')
    .resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
            move: function (event) {
                const currentZoom = zoomLevel || 1;
                const scaledDeltaLeft = event.deltaRect.left / currentZoom;
                const scaledDeltaTop = event.deltaRect.top / currentZoom;
                let x = parseFloat(event.target.getAttribute('data-x')) || 0;
                let y = parseFloat(event.target.getAttribute('data-y')) || 0;

                x += scaledDeltaLeft;
                y += scaledDeltaTop;

                Object.assign(event.target.style, {
                    width: `${event.rect.width / currentZoom}px`,
                    height: `${event.rect.height / currentZoom}px`,
                    transform: `translate(${x}px, ${y}px)`
                });

                event.target.setAttribute('data-x', x);
                event.target.setAttribute('data-y', y);
            },
            end: function (event) {
                const todoId = event.target.getAttribute('data-todo-id');
                if (todoId) {
                    saveTodoPosition(todoId, event.target);
                }
            }
        },
        modifiers: [
            interact.modifiers.restrictSize({
                min: { width: 200, height: 50 }
            })
        ],
        inertia: true
    })
    .draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: '#notePosts',
                endOnly: true
            })
        ],
        autoScroll: true,
        listeners: {
            move(event) {
                const target = event.target;
                const currentZoom = zoomLevel || 1;
                const scaledDx = event.dx / currentZoom;
                const scaledDy = event.dy / currentZoom;

                const x = (parseFloat(target.getAttribute('data-x')) || 0) + scaledDx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + scaledDy;

                target.style.transform = `translate(${x}px, ${y}px)`;

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);

                target.style.zIndex = '1000';
            },
            end(event) {
                event.target.style.zIndex = '1';

                const todoId = event.target.getAttribute('data-todo-id');
                if (todoId) {
                    saveTodoPosition(todoId, event.target);
                }
            }
        }
    });

function updateTodoPositioning() {
    window.saveTodoPosition = async function (todoId, element) {
        try {
            const x = parseFloat(element.getAttribute('data-x')) || 0;
            const y = parseFloat(element.getAttribute('data-y')) || 0;
            const width = parseFloat(element.style.width) || 250;
            const height = parseFloat(element.style.height) || 100;
            const position = {
                x: x,
                y: y,
                width,
                height,
                canvasX: x,
                canvasY: y
            };

            const response = await fetch('/todo/updateposition', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ todoId, position })
            });

            const data = await response.json();
            if (data.success) {
                console.log('Successfully updated todo position');
            } else {
                console.error('Failed to update todo position:', data.message);
                if (typeof ntf === 'function') {
                    ntf(`Failed to save position: ${data.message}`, 'error');
                }
            }
        } catch (err) {
            console.error('Update todo position failed:', err);
        }
    }
}
function adjustTodosPositioning() {
    window.originalGetTodos = window.getTodos;
    window.getTodos = async function (categoryId) {
        try {
            const response = await fetch(`/todo/get?categoryId=${categoryId}`, { credentials: 'include' });
            const data = await response.json();
            const todosContainer = document.getElementById(`todos-${categoryId}`);

            if (!todosContainer) {
                console.error(`todosContainer with ID todos-${categoryId} not found`);
                return;
            }

            const existingTodos = todosContainer.querySelectorAll('.todo-item-container');
            existingTodos.forEach(item => item.remove());

            if (!data.success) {
                console.log('Error', data.message);
                return;
            }

            if (data.todos && data.todos.length > 0) {
                console.log(`Found ${data.todos.length} todos for category ${categoryId}`);
            } else {
                console.log(`No todos found for category ${categoryId}`);
            }

            data.todos.forEach(function (todo) {
                const todoElement = document.createElement('div');
                todoElement.className = 'todo-item-container';

                const isNewTodo = !todo.position || (!todo.position.canvasX && !todo.position.x);
                let x, y;

                if (isNewTodo) {
                    x = notePostsContainer.offsetWidth / 2 - 125;
                    y = notePostsContainer.offsetHeight / 2 - 50;

                    setTimeout(() => {
                        canvasContainer.scrollLeft = (x - viewportWidth / 2 + 125) * zoomLevel;
                        canvasContainer.scrollTop = (y - viewportHeight / 2 + 50) * zoomLevel;
                    }, 100);
                } else {
                    x = todo.position?.canvasX || todo.position?.x || 0;
                    y = todo.position?.canvasY || todo.position?.y || 0;
                }

                const width = todo.position?.width || 250;
                const height = todo.position?.height || 100;

                const todoSection = document.createElement('div');
                todoSection.className = 'note-section resize-drag';
                todoSection.setAttribute('data-todo-id', todo._id);
                todoSection.setAttribute('data-x', x);
                todoSection.setAttribute('data-y', y);
                todoSection.style.width = `${width}px`;
                todoSection.style.height = `${height}px`;
                todoSection.style.transform = `translate(${x}px, ${y}px)`;
                todoSection.style.position = 'absolute';
                todoSection.style.backgroundColor = '#f9f9f9';
                todoSection.style.border = '1px solid #ddd';
                todoSection.style.borderRadius = '5px';
                todoSection.style.padding = '10px';
                todoSection.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                todoSection.style.overflow = 'auto';

                const todoContent = document.createElement('div');
                todoContent.className = 'todo-content';
                todoContent.style.display = 'flex';
                todoContent.style.alignItems = 'center';
                todoContent.style.justifyContent = 'space-between';
                todoContent.style.marginBottom = '8px';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'todo-checkbox';
                checkbox.dataset.todoId = todo._id;
                checkbox.checked = todo.completed;
                checkbox.style.marginRight = '8px';

                const todoText = document.createElement('span');
                todoText.className = `todo-text ${todo.completed ? 'completed' : ''}`;
                todoText.textContent = todo.text;
                todoText.style.flexGrow = '1';
                todoText.style.marginRight = '8px';
                todoText.style.wordBreak = 'break-word';
                if (todo.completed) {
                    todoText.style.textDecoration = 'line-through';
                    todoText.style.color = '#888';
                }

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-todo';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteTodo(todo._id));

                todoContent.appendChild(checkbox);
                todoContent.appendChild(todoText);
                todoContent.appendChild(deleteButton);
                todoSection.appendChild(todoContent);

                const todoHeader = document.createElement('div');
                todoHeader.className = 'todo-header';
                todoHeader.textContent = 'Todo Item';
                todoHeader.style.fontWeight = 'bold';
                todoHeader.style.marginBottom = '10px';
                todoHeader.style.borderBottom = '1px solid #eee';
                todoHeader.style.paddingBottom = '5px';

                todoSection.insertBefore(todoHeader, todoContent);

                todoElement.appendChild(todoSection);
                todosContainer.appendChild(todoElement);

                checkbox.addEventListener('change', (event) => {
                    const isChecked = event.target.checked;
                    const todoId = event.target.dataset.todoId;
                    updateTodoStatus(todoId, isChecked);

                    if (isChecked) {
                        todoText.classList.add('completed');
                        todoText.style.textDecoration = 'line-through';
                        todoText.style.color = '#888';
                    } else {
                        todoText.classList.remove('completed');
                        todoText.style.textDecoration = 'none';
                        todoText.style.color = '';
                    }
                });


            });

            if (typeof updateMinimap === 'function') {
                updateMinimap();
            }

        } catch (err) {
            console.error("Error fetching todos:", err);
        }
    };

    if (!window.updateTodoStatus) {
        window.updateTodoStatus = async function (todoId, completed) {
            try {
                const response = await fetch('/todo/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ todoId, completed })
                });

                const data = await response.json();
                if (!data.success) {
                    console.error('Failed to update todo status:', data.message);
                }
            } catch (err) {
                console.error('Error updating todo status:', err);
            }
        };
    }
    if (!window.deleteTodo) {
        window.deleteTodo = async function (todoId) {
            try {
                const response = await fetch(`/todo/delete?todoId=${todoId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                const data = await response.json();
                if (data.success) {
                    const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
                    if (todoElement) {
                        const container = todoElement.closest('.todo-item-container');
                        if (container) {
                            container.remove();
                        } else {
                            todoElement.remove();
                        }
                        updateMinimap();
                    }
                } else {
                    console.error('Failed to delete todo:', data.message);
                }
            } catch (err) {
                console.error('Error deleting todo:', err);
            }
        };
    }
}

window.saveTodoPosition = async function (todoId, element) {
    try {
        const x = parseFloat(element.getAttribute('data-x')) || 0;
        const y = parseFloat(element.getAttribute('data-y')) || 0;
        const width = parseFloat(element.style.width) || 250;
        const height = parseFloat(element.style.height) || 100;

        const position = {
            x: x,
            y: y,
            width,
            height,
            canvasX: x,
            canvasY: y
        };

        const response = await fetch('/todo/updateposition', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ todoId, position })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Successfully updated todo position');
        } else {
            console.error('Failed to update todo position:', data.message);
            if (typeof ntf === 'function') {
                ntf(`Failed to save position: ${data.message}`, 'error');
            }
        }
    } catch (err) {
        console.error('Update todo position failed:', err);
    }
};
