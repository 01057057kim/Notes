interact('.todo-section.resize-drag')
    .resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
            move: function (event) {
                const currentZoom = zoomLevel || 1;
                const scaledDeltaLeft = event.deltaRect.left / currentZoom;
                const scaledDeltaTop = event.deltaRect.top / currentZoom;
                let { x, y } = event.target.dataset;

                x = (parseFloat(x) || 0) + scaledDeltaLeft;
                y = (parseFloat(y) || 0) + scaledDeltaTop;

                Object.assign(event.target.style, {
                    width: `${event.rect.width / currentZoom}px`,
                    height: `${event.rect.height / currentZoom}px`,
                    transform: `translate(${x}px, ${y}px)`
                });

                Object.assign(event.target.dataset, { x, y });
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
                min: { width: 300, height: 300 }
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

document.getElementById('globalAddTodoButton').addEventListener('click', async function (event) {
    const categoryId = selectedCategoryId || event.target.dataset.categoryId;
    const text = `Add your todo here...`;

    const uniqueId = Date.now();
    const uniqueText = text + '\u200B'.repeat(uniqueId % 1000);

    try {
        const response = await fetch('http://localhost:3000/todo/createtodo', {
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
        const response = await fetch(`/todo/gettodo?categoryId=${categoryId}`, { credentials: 'include' });
        const data = await response.json();
        const todosContainer = document.getElementById(`todos-${categoryId}`);

        if (todosContainer) {
            const existingTodos = todosContainer.querySelectorAll('.todo-section');
            existingTodos.forEach(item => item.remove());
        }

        if (!data.success) {
            console.log('Error', data.message);
            return;
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

async function updateTodoText(todoId, newText) {
    try {
        const response = await fetch('/todo/updatetodotext', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ todoId, text: newText })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Todo text updated successfully');
        } else {
            console.error('Failed to update todo text:', data.message);
        }
    } catch (err) {
        console.error('Error updating todo text:', err);
    }
}

async function updateTodoStatus(todoId, completed) {
    try {
        const response = await fetch('/todo/updatetodostatus', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ todoId, completed })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Todo status updated successfully');
        } else {
            console.error('Failed to update todo status:', data.message);
        }
    } catch (err) {
        console.error('Error updating todo status:', err);
    }
}

async function deleteTodo(todoId) {
    try {
        const response = await fetch(`/todo/deletetodo?todoId=${todoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
            const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
            if (todoElement) {
                const container = todoElement.closest('.todo-section');
                if (container) {
                    container.remove();
                } else {
                    todoElement.remove();
                }
                if (typeof updateMinimap === 'function') {
                    updateMinimap();
                }
            }
            console.log('Todo deleted successfully');
        } else {
            console.error('Failed to delete todo:', data.message);
            ntf('Failed to delete', 'error');
        }
    } catch (err) {
        console.error('Error deleting todo:', err);
    }
}

async function saveTodoPosition(todoId, element) {
    try {
        const x = parseFloat(element.getAttribute('data-x')) || 0;
        const y = parseFloat(element.getAttribute('data-y')) || 0;
        const width = parseFloat(element.style.width);
        const height = parseFloat(element.style.height);

        const position = { x, y, width, height };

        const response = await fetch('/todo/updatetodoposition', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ todoId, position })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Success update todos position');
        } else {
            console.log('Failed update todos position:', data.message);
        }
    } catch (err) {
        console.log('Update todos failed:', err);
    }
}

window.addSubTodo = async function (todoId) {
    try {
        const response = await fetch('/todo/addsubtodo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                todoId,
                text: 'New subtask',
                completed: false
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('SubTodo added successfully:', data);
            
            const todoContainer = document.querySelector(`.todo-section[data-todo-id="${todoId}"]`);
            if (todoContainer) {
                const itemContainer = todoContainer.querySelector('.todo-item-container');
                
                const noSubtodos = itemContainer.querySelector('.no-subtodos');
                if (noSubtodos) {
                    noSubtodos.remove();
                }
                
                const newSubtodoItem = document.createElement('div');
                newSubtodoItem.className = 'todo-item';
                newSubtodoItem.dataset.subtodoId = data.subTodoId || Date.now();
                newSubtodoItem.innerHTML = `
                    <input type="checkbox" class="subtodo-checkbox">
                    <input type="text" class="subtodo-text" maxlength="60" value="New subtask">
                    <button class="delete-subtodo">✕</button>
                `;
                
                itemContainer.appendChild(newSubtodoItem);
                const subtodoIndex = itemContainer.querySelectorAll('.todo-item').length - 1;
                
                const checkbox = newSubtodoItem.querySelector('.subtodo-checkbox');
                checkbox.addEventListener('change', function () {
                    updateSubTodoStatus(todoId, subtodoIndex, this.checked);
                });
                
                const textInput = newSubtodoItem.querySelector('.subtodo-text');
                textInput.addEventListener('input', function () {
                    updateSubTodoText(todoId, subtodoIndex, this.value);
                });
                
                const deleteButton = newSubtodoItem.querySelector('.delete-subtodo');
                deleteButton.addEventListener('click', function () {
                    removeSubTodo(todoId, subtodoIndex);
                    newSubtodoItem.remove();
                });
                
                textInput.focus();
                textInput.select();
            }
        } else {
            console.error('Failed to add subtodo:', data.message);
            ntf('Failed to add subtask', 'error');
        }
    } catch (err) {
        console.error('Error adding subtodo:', err);
        ntf('Error adding subtask', 'error');
    }
};

window.updateSubTodoStatus = async function (todoId, subTodoIndex, completed) {
    try {
        const response = await fetch('/todo/updatesubtodostatus', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ todoId, subTodoIndex, completed })
        });
        
        const data = await response.json();
        if (!data.success) {
            console.error('Failed to update subtodo status:', data.message);
        }
    } catch (err) {
        console.error('Error updating subtodo status:', err);
    }
};

window.updateSubTodoText = async function (todoId, subTodoIndex, text) {
    try {
        const response = await fetch('/todo/updatesubtodotext', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ todoId, subTodoIndex, text })
        });
        
        const data = await response.json();
        if (!data.success) {
            console.error('Failed to update subtodo text:', data.message);
        }
    } catch (err) {
        console.error('Error updating subtodo text:', err);
    }
};

window.removeSubTodo = async function (todoId, subTodoIndex) {
    try {
        const response = await fetch('/todo/removesubtodo', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ todoId, subTodoIndex })
        });
        
        const data = await response.json();
        if (!data.success) {
            console.error('Failed to remove subtodo:', data.message);
        }
    } catch (err) {
        console.error('Error removing subtodo:', err);
    }
};

function updateTodoPositioning() {
    window.saveTodoPosition = async function (todoId, element) {
        try {
            const x = parseFloat(element.getAttribute('data-x')) || 0;
            const y = parseFloat(element.getAttribute('data-y')) || 0;
            const width = parseFloat(element.style.width);
            const height = parseFloat(element.style.height);
            const position = {
                x,
                y,
                width,
                height,
                canvasX: x,
                canvasY: y
            };

            const response = await fetch('/todo/updatetodoposition', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ todoId, position })
            });

            const data = await response.json();
            if (data.success) {
                console.log('Success update todos position');
            } else {
                console.log('Failed update todos position:', data.message);
            }
        } catch (err) {
            console.log('Update todos failed:', err);
        }
    }
}

function adjustTodosPositioning() {
    const originalGetTodos = window.getTodos;

    window.getTodos = async function (categoryId) {
        try {
            const response = await fetch(`/todo/gettodo?categoryId=${categoryId}`, { credentials: 'include' });
            const data = await response.json();
            const todosContainer = document.getElementById(`todos-${categoryId}`);

            if (todosContainer) {
                const existingTodos = todosContainer.querySelectorAll('.todo-section');
                existingTodos.forEach(item => item.remove());
            }

            if (!data.success) {
                console.log('Error', data.message);
                return;
            }

            data.todos.forEach(function (todo) {
                const todoElement = document.createElement('section');
                const isNewTodo = !todo.position || (!todo.position.canvasX && !todo.position.x);
                let x, y;

                if (isNewTodo) {
                    const notePostsContainer = document.getElementById('notePosts');
                    if (notePostsContainer) {
                        x = notePostsContainer.offsetWidth / 2 - 125;
                        y = notePostsContainer.offsetHeight / 2 - 125;

                        if (typeof canvasContainer !== 'undefined' &&
                            typeof viewportWidth !== 'undefined' &&
                            typeof viewportHeight !== 'undefined' &&
                            typeof zoomLevel !== 'undefined') {
                            setTimeout(() => {
                                canvasContainer.scrollLeft = (x - viewportWidth / 2 + 125) * zoomLevel;
                                canvasContainer.scrollTop = (y - viewportHeight / 2 + 125) * zoomLevel;
                            }, 100);
                        }
                    } else {
                        x = 0;
                        y = 0;
                    }
                } else {
                    x = todo.position?.canvasX || todo.position?.x || 0;
                    y = todo.position?.canvasY || todo.position?.y || 0;
                }

                const positionStyle = `style="width: ${todo.position?.width || 300}px; height: ${todo.position?.height || 'auto'}px; transform: translate(${x}px, ${y}px);"`;
                const positionData = `data-x="${x}" data-y="${y}"`;

                todoElement.innerHTML = `
                <section class="todo-section resize-drag" ${positionStyle} ${positionData} data-todo-id="${todo._id}">
                    <div class="todo-header">
                        <input type="text" class="todo-title" maxlength="60" value="${todo.text}" data-todo-id="${todo._id}">
                    </div>
                  <div class="todo-item-container" data-todo-id="${todo._id}">
                    ${todo.subTodos && todo.subTodos.length > 0 ?
                        todo.subTodos.map((subTodo, index) => `
                        <div class="todo-item" data-subtodo-id="${subTodo._id || index}">
                            <input type="checkbox" class="subtodo-checkbox" ${subTodo.completed ? 'checked' : ''}>
                            <input type="text" class="subtodo-text" maxlength="60" value="${subTodo.text || ''}" style="${subTodo.completed ? 'text-decoration: line-through;' : ''}">
                            <button class="delete-subtodo">✕</button>
                        </div>
                      `).join('') :
                        '<div class="no-subtodos">Add tasks below</div>'
                    }
                  </div>
                    <div class="todo-actions">
                        <button class="add-subtodo" onClick="addSubTodo('${todo._id}')">Add Task</button>
                        <button class="delete-todo" onClick="deleteTodo('${todo._id}')">Delete</button>
                    </div>
                </section>
              `;

                if (todosContainer) {
                    todosContainer.appendChild(todoElement);

                    const titleInput = todoElement.querySelector('.todo-title');
                    if (titleInput) {
                        titleInput.addEventListener('input', function () {
                            updateTodoText(todo._id, this.value);
                        });
                    }

                    const subtodoCheckboxes = todoElement.querySelectorAll('.subtodo-checkbox');
                    subtodoCheckboxes.forEach((checkbox, index) => {
                        checkbox.addEventListener('change', function () {
                            updateSubTodoStatus(todo._id, index, this.checked);

                            const textInput = this.closest('.todo-item').querySelector('.subtodo-text');
                            if (textInput) {
                                if (this.checked) {
                                    textInput.style.textDecoration = 'line-through';
                                } else {
                                    textInput.style.textDecoration = 'none';
                                }
                            }
                        });
                    });

                    const subtodoTexts = todoElement.querySelectorAll('.subtodo-text');
                    subtodoTexts.forEach((textInput, index) => {
                        textInput.addEventListener('input', function () {
                            updateSubTodoText(todo._id, index, this.value);
                        });
                    });

                    const deleteSubtodoButtons = todoElement.querySelectorAll('.delete-subtodo');
                    deleteSubtodoButtons.forEach((button, index) => {
                        button.addEventListener('click', function () {
                            removeSubTodo(todo._id, index);
                            this.closest('.todo-item').remove();
                        });
                    });
                }
            });
        } catch (err) {
            console.error("Error fetching todos:", err);
        }
    };
}