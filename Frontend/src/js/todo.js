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
                text,
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
        console.log("Todos container before adding todos:", todosContainer);
        console.log("Container parent:", todosContainer.parentElement);
        console.log("Container styling:", getComputedStyle(todosContainer));
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
                    <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                    <button class="delete-todo" onClick="deleteTodo('${todo._id}')">Delete</button>
                  </div>
                </div>
              `;

            todosContainer.appendChild(todoElement);
            console.log('Appended todo:', todo.text);
            console.log("Todos container after adding todos:", todosContainer);
            console.log("Number of child elements:", todosContainer.children.length);

            todosContainer.style.display = "block";
            todosContainer.style.visibility = "visible";
            todosContainer.style.opacity = "1";
            todosContainer.style.height = "auto";
            todosContainer.style.minHeight = "200px";
            todosContainer.style.overflow = "visible";
            todosContainer.style.zIndex = "99999";

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

        const style = document.createElement('style');
        style.textContent = `
            .todos-container {
                position: relative;
                min-height: 100px;
            }
            .todo-item-container {
                position: relative;
                margin-bottom: 10px;
            }
            .todo-item {
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 10px;
                position: absolute;
                min-width: 200px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .todo-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .todo-text.completed {
                text-decoration: line-through;
                color: #888;
            }
            .delete-todo {
                margin-left: auto;
                padding: 2px 5px;
                background-color: #ff5555;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            }
        `;
        if (!document.getElementById('todo-styles')) {
            style.id = 'todo-styles';
            document.head.appendChild(style);
        }

        if (data.success) {
            console.log("Success get todo data");
        } else {
            console.log("Error get todo data");
        }
        Array.from(todosContainer.querySelectorAll('.todo-item-container')).forEach(item => {
            item.style.display = "block";
            item.style.visibility = "visible";
            item.style.opacity = "1";
            item.style.position = "relative"; 
        });
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
                    //saveTodoPosition(todoId, event.target);
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
                    //saveTodoPosition(todoId, event.target);
                }
            }
        }
    });