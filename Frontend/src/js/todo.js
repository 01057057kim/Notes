document.getElementById('globalAddTodoButton').addEventListener('click', async function () {
    const categoryId = selectedCategoryId || event.target.dataset.categoryId;
    const todoText = 'Add your Todo here...';
    
    const uniqueId = Date.now();
    const uniqueTodoText = todoText + '\u200B'.repeat(uniqueId % 1000);
    
    try {
        const response = await fetch('http://localhost:3000/todo/createtodo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                text: uniqueTodoText,
                categoryId: categoryId,
                position: { x: 10, y: 10, width: 250, height: 200 } 
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('success');
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
        const response = await fetch(`/todo/gettodos?categoryId=${categoryId}`, { credentials: 'include' });
        const data = await response.json();
        const todoPostsContainer = document.getElementById('notePosts');
        
        if (!data.success) {
            console.log('Error', data.message);
            return;
        }
        
        // Clear existing todo sections but keep any other elements
        const todoSections = todoPostsContainer.querySelectorAll('.todo-section');
        todoSections.forEach(section => section.remove());
        
        // Create new todo elements similar to notes
        data.todos.forEach(todo => {
            const todoElement = document.createElement('section');
            const positionStyle = todo.position ?
                `style="width: ${todo.position.width || 250}px; height: ${todo.position.height || 200}px; transform: translate(${todo.position.x || 0}px, ${todo.position.y || 0}px);"` : '';
            const positionData = todo.position ?
                `data-x="${todo.position.x || 0}" data-y="${todo.position.y || 0}"` : '';
            
            todoElement.innerHTML = `
                <section class="todo-container">
                <div class="todo">
                    <input type="checkbox" name="" id=""><input type="text" name="" id=""><button type="button">delete todo</button>
                </div>
                <button type="button">Add new todo</button>
            </section>
            `;
            
            todoPostsContainer.appendChild(todoElement);
            
        });
        
    } catch (err) {
        console.log('Error:', err);
    }
}