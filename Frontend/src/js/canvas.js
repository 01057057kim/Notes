let canvasContainer = document.querySelector('.canvas-container');
let notePostsContainer = document.getElementById('notePosts');
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;
let viewportWidth, viewportHeight;
let centerX, centerY;
let zoomLevel = 1;
let minZoom = 0.5;
let maxZoom = 1;
let zoomStep = 0.1;
let minimap, zoomControls, searchContainer;
let minimapUpdateTimeout = null;
let minimapVisible = true;
let sidebarVisible = true;
let searchVisible = true;
let toolSidebarVisible = true;
const toggleButton = document.getElementById('toggleSidebar');
const sidebar = document.querySelector('.container');
const toolSidebar = document.querySelector('.tool');
const toolToggleBtn = document.getElementById('toolToggleSidebar');

toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebarVisible = !sidebar.classList.contains('collapsed');

    if (sidebarVisible) {
        toggleButton.innerHTML = '←';
    } else {
        toggleButton.innerHTML = '→';
    }

    minimap.style.transition = 'transform 0.3s ease';
    zoomControls.style.transition = 'transform 0.3s ease';

    updateControlPositions();
});
toggleButton.innerHTML = '←';

toolToggleBtn.addEventListener('click', () => {
    const search = document.getElementById('search-container');
    const searchResults = document.getElementById('search-results');
    
    toolSidebar.classList.toggle('hidden');
    toolSidebarVisible = !toolSidebar.classList.contains('hidden');
    
    if (toolSidebarVisible) {
        toolToggleBtn.innerHTML = '→';
        search.style.right = '150px';
        searchResults.style.right = '150px';
    } else {
        toolToggleBtn.innerHTML = '←';
        search.style.right = '20px';
        searchResults.style.right = '20px';
    }
    
    toolSidebar.style.transition = 'transform 0.3s ease';
    updateToolSidebarPosition();
});
toolToggleBtn.innerHTML = '→';

function updateSearchResultsPosition() {
    const search = document.getElementById('search-container');
    const searchResults = document.getElementById('search-results');
    
    if (search && searchResults) {
        searchResults.style.right = search.style.right;
    }
}

function updateControlPositions() {
    if (minimapVisible) {
        minimap.style.transform = sidebarVisible ? 'translateX(0)' : 'translateX(-300px)';
        zoomControls.style.transform = sidebarVisible ? 'translateX(0)' : 'translateX(-300px)';
    } else {
        minimap.style.display = 'none';
        zoomControls.style.transform = sidebarVisible ? 'translateX(-230px)' : 'translateX(-530px)';
    }
}

function initializeCanvas() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;

    centerX = (notePostsContainer.offsetWidth / 2) - (viewportWidth / 2);
    centerY = (notePostsContainer.offsetHeight / 2) - (viewportHeight / 2);

    canvasContainer.scrollLeft = centerX;
    canvasContainer.scrollTop = centerY;

    canvasContainer.style.position = "absolute";
    canvasContainer.style.top = "0";
    canvasContainer.style.left = "0";
    canvasContainer.style.width = "100%";
    canvasContainer.style.height = "100vh";
    canvasContainer.style.overflow = "hidden";
    canvasContainer.style.cursor = "default";
}

function handleMouseDown(e) {
    // right mouse button (button code 2)
    if (e.button === 2) {
        e.preventDefault();
        isPanning = true;
        canvasContainer.style.cursor = "grabbing";
        startX = e.pageX - canvasContainer.offsetLeft;
        startY = e.pageY - canvasContainer.offsetTop;
        scrollLeft = canvasContainer.scrollLeft;
        scrollTop = canvasContainer.scrollTop;
    }
}

function handleMouseMove(e) {
    if (!isPanning) return;
    e.preventDefault();

    const x = e.pageX - canvasContainer.offsetLeft;
    const y = e.pageY - canvasContainer.offsetTop;
    const walkX = (x - startX) * 0.8; // multiply speed factor
    const walkY = (y - startY) * 0.8;

    let newScrollLeft = scrollLeft - walkX;
    let newScrollTop = scrollTop - walkY;

    const canvasWidth = notePostsContainer.offsetWidth * zoomLevel;
    const canvasHeight = notePostsContainer.offsetHeight * zoomLevel;

    const maxScrollLeft = Math.max(0, canvasWidth - viewportWidth);
    const maxScrollTop = Math.max(0, canvasHeight - viewportHeight);

    newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
    newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));

    canvasContainer.scrollLeft = newScrollLeft;
    canvasContainer.scrollTop = newScrollTop;
}

function handleMouseWheelZoom(event) {
    event.preventDefault();

    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const adaptiveZoomStep = zoomStep * (zoomLevel < 1 ? 0.5 : 1);
    const delta = -Math.sign(event.deltaY) * zoomStep;
    const newZoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));

    if (newZoomLevel === zoomLevel) return;

    const containerRect = canvasContainer.getBoundingClientRect();
    const relativeX = mouseX - containerRect.left;
    const relativeY = mouseY - containerRect.top;

    const pointX = relativeX + canvasContainer.scrollLeft;
    const pointY = relativeY + canvasContainer.scrollTop;

    const scaleFactor = newZoomLevel / zoomLevel;

    zoomLevel = newZoomLevel;

    notePostsContainer.style.transform = `scale(${zoomLevel})`;
    notePostsContainer.style.transformOrigin = '0 0';

    let newScrollLeft = pointX * scaleFactor - relativeX;
    let newScrollTop = pointY * scaleFactor - relativeY;

    const canvasWidth = notePostsContainer.offsetWidth * zoomLevel;
    const canvasHeight = notePostsContainer.offsetHeight * zoomLevel;

    const maxScrollLeft = Math.max(0, canvasWidth - viewportWidth);
    const maxScrollTop = Math.max(0, canvasHeight - viewportHeight);

    newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
    newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));

    canvasContainer.scrollLeft = newScrollLeft;
    canvasContainer.scrollTop = newScrollTop;

    updateZoomUI(zoomLevel);
    updateMinimap();
}

function updateZoomUI(level) {
    let zoomIndicator = document.getElementById('zoom-indicator');

    if (!zoomIndicator) {
        zoomIndicator = document.createElement('div');
        zoomIndicator.id = 'zoom-indicator';
        document.body.appendChild(zoomIndicator);
    }

    zoomIndicator.textContent = `Zoom: ${Math.round(level * 100)}%`;
    zoomIndicator.style.opacity = '1';

    clearTimeout(zoomIndicator.fadeTimeout);
    zoomIndicator.fadeTimeout = setTimeout(() => {
        zoomIndicator.style.opacity = '0';
    }, 1500);
}

function setupMouseWheelZoom() {
    canvasContainer.addEventListener('wheel', handleMouseWheelZoom, { passive: false });
}

function initZoom() {
    setupMouseWheelZoom();

    const style = document.createElement('style');
    style.textContent = `
        #notePosts {
            transform: scale(1);
            transform-origin: 0 0;
        }
        
        .notes-container {
            position: relative;
            min-height: 100vh;
        }
    `;
    document.head.appendChild(style);

    zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
        <button id="zoom-in">+</button>
        <button id="reset">⟳</button>
        <button id="zoom-out">-</button>
    `;
    document.body.appendChild(zoomControls);

    document.getElementById('zoom-in').addEventListener('click', () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const delta = zoomStep;

        const fakeEvent = {
            clientX: centerX,
            clientY: centerY,
            deltaY: -1,
            preventDefault: () => { }
        };

        handleMouseWheelZoom(fakeEvent);
        updateMinimap();
    });

    document.getElementById('reset').addEventListener('click', () => {
        zoomLevel = 1;
        notePostsContainer.style.transform = `scale(${zoomLevel})`;
        updateZoomUI(zoomLevel);
        resetCamera();
        updateMinimap();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const fakeEvent = {
            clientX: centerX,
            clientY: centerY,
            deltaY: 1,
            preventDefault: () => { }
        };

        handleMouseWheelZoom(fakeEvent);
        updateMinimap();
    });

}

function addResetButton() {
    const resetButton = document.createElement('button');

    resetButton.addEventListener('click', () => {
        zoomLevel = 1;
        notePostsContainer.style.transform = `scale(${zoomLevel})`;
        updateZoomUI(zoomLevel);
        resetCamera();
        updateMinimap();
    });

    document.body.appendChild(resetButton);
}

function handleMouseUp(e) {
    isPanning = false;
    canvasContainer.style.cursor = "default";
}

function resetCamera() {
    centerX = (notePostsContainer.offsetWidth / 2) - (viewportWidth / 2);
    centerY = (notePostsContainer.offsetHeight / 2) - (viewportHeight / 2);

    const canvasWidth = notePostsContainer.offsetWidth * zoomLevel;
    const canvasHeight = notePostsContainer.offsetHeight * zoomLevel;

    const maxScrollLeft = Math.max(0, canvasWidth - viewportWidth);
    const maxScrollTop = Math.max(0, canvasHeight - viewportHeight);

    const boundedCenterX = Math.max(0, Math.min(centerX * zoomLevel, maxScrollLeft));
    const boundedCenterY = Math.max(0, Math.min(centerY * zoomLevel, maxScrollTop));

    const currentScrollLeft = canvasContainer.scrollLeft;
    const currentScrollTop = canvasContainer.scrollTop;
    const scrollDistanceX = boundedCenterX - currentScrollLeft;
    const scrollDistanceY = boundedCenterY - currentScrollTop;
    const duration = 500;
    const startTime = performance.now();

    function animateScroll(timestamp) {
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        canvasContainer.scrollLeft = currentScrollLeft + scrollDistanceX * easeProgress;
        canvasContainer.scrollTop = currentScrollTop + scrollDistanceY * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

function disableContextMenu(e) {
    e.preventDefault();
    return false;
}

function setupCanvasEventListeners() {
    canvasContainer.addEventListener('mousedown', handleMouseDown);
    canvasContainer.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasContainer.addEventListener('contextmenu', disableContextMenu);
    window.addEventListener('mouseleave', function () {
        isPanning = false;
        canvasContainer.style.cursor = "default";
    });

    window.addEventListener('resize', function () {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;

        centerX = (notePostsContainer.offsetWidth / 2) - (viewportWidth / 2);
        centerY = (notePostsContainer.offsetHeight / 2) - (viewportHeight / 2);
    });

    window.addEventListener('keydown', handleShortcut);
}

function handleShortcut(e) {

    if (e.code === "KeyR" && e.ctrlKey) {
        e.preventDefault();
        resetCamera();
    }

}




const originalUploadImage = window.uploadImage;
window.uploadImage = async function (categoryId) {
    if (originalUploadImage) {
        await originalUploadImage(categoryId);
    }
};

const originalDeleteNotes = window.deleteNotes;
window.deleteNotes = async function (noteId) {
    if (originalDeleteNotes) {
        await originalDeleteNotes(noteId);
    } else {
        try {
            const response = await fetch(`/notes/deletenotes?noteId=${noteId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                const noteElement = document.querySelector(`[data-note-id="${noteId}"]`).closest('.note-section');
                if (noteElement) {
                    noteElement.remove();
                }
            }
        } catch (err) {
            console.error("Error deleting note:", err);
        }
    }
};

function addMinimap() {
    if (document.getElementById('canvas-minimap')) {
        console.log('Minimap already exists');
        return document.getElementById('canvas-minimap');
    }
    minimap = document.createElement('div');
    minimap.id = 'canvas-minimap';
    document.body.appendChild(minimap);

    const minimapContent = document.createElement('div');
    minimapContent.id = 'minimap-content';
    minimap.appendChild(minimapContent);

    const viewportIndicator = document.createElement('div');
    viewportIndicator.id = 'viewport-indicator';
    minimapContent.appendChild(viewportIndicator);
    const toggleButton = document.createElement('button');
    toggleButton.display = 'none';

    minimap.appendChild(toggleButton);

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            minimapVisible = !minimapVisible;
            minimap.style.display = minimapVisible ? 'block' : 'none';
            updateControlPositions();
        }
    });

    minimapContent.addEventListener('click', (e) => {
        if (e.target !== minimapContent) return;

        const rect = minimapContent.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const canvasWidth = notePostsContainer.offsetWidth;
        const canvasHeight = notePostsContainer.offsetHeight;

        const ratioX = canvasWidth / minimapContent.offsetWidth;
        const ratioY = canvasHeight / minimapContent.offsetHeight;

        let targetX = clickX * ratioX * zoomLevel - (viewportWidth / 2);
        let targetY = clickY * ratioY * zoomLevel - (viewportHeight / 2);

        const maxScrollX = Math.max(0, canvasWidth * zoomLevel - viewportWidth);
        const maxScrollY = Math.max(0, canvasHeight * zoomLevel - viewportHeight);

        targetX = Math.max(0, Math.min(targetX, maxScrollX));
        targetY = Math.max(0, Math.min(targetY, maxScrollY));

        animateScrollTo(targetX, targetY);
    });

    return {
        update: updateMinimap,
        element: minimap,
        content: minimapContent,
        indicator: viewportIndicator,
    };
}

function updateMinimap() {
    const minimap = document.getElementById('minimap-content');
    const indicator = document.getElementById('viewport-indicator');
    if (!minimap || !indicator) return;

    /////////////////////////////////////////////////////////////////////////////// 

    const notes = document.querySelectorAll('.note-section');
    const images = document.querySelectorAll('.image-container');
    const todos = document.querySelectorAll('.todo-section');

    ///////////////////////////////////////////////////////////////////////////////
    while (minimap.querySelector('.minimap-note-indicator')) {
        minimap.querySelector('.minimap-note-indicator').remove();
    }

    const canvasWidth = notePostsContainer.offsetWidth;
    const canvasHeight = notePostsContainer.offsetHeight;
    const minimapWidth = minimap.offsetWidth;
    const minimapHeight = minimap.offsetHeight;

    const scaleX = minimapWidth / canvasWidth;
    const scaleY = minimapHeight / canvasHeight;

    const viewportX = (canvasContainer.scrollLeft / zoomLevel) * scaleX;
    const viewportY = (canvasContainer.scrollTop / zoomLevel) * scaleY;
    const viewportW = (viewportWidth / zoomLevel) * scaleX;
    const viewportH = (viewportHeight / zoomLevel) * scaleY;

    indicator.style.transform = `translate(${viewportX}px, ${viewportY}px)`;
    indicator.style.width = viewportW + 'px';
    indicator.style.height = viewportH + 'px';

    const fragment = document.createDocumentFragment();

    notes.forEach(note => {
        const x = (parseFloat(note.getAttribute('data-x')) || 0) * scaleX;
        const y = (parseFloat(note.getAttribute('data-y')) || 0) * scaleY;
        const w = note.offsetWidth * scaleX;
        const h = note.offsetHeight * scaleY;

        const noteIndicator = document.createElement('div');
        noteIndicator.className = 'minimap-note-indicator';
        noteIndicator.style.position = 'absolute';
        noteIndicator.style.transform = `translate(${x}px, ${y}px)`;
        noteIndicator.style.width = w + 'px';
        noteIndicator.style.height = h + 'px';
        noteIndicator.style.backgroundColor = '#5d3fd3';
        noteIndicator.style.opacity = '0.6';
        noteIndicator.style.pointerEvents = 'none';

        fragment.appendChild(noteIndicator);
    });

    todos.forEach(todo => {
        const x = (parseFloat(todo.getAttribute('data-x')) || 0) * scaleX;
        const y = (parseFloat(todo.getAttribute('data-y')) || 0) * scaleY;
        const w = todo.offsetWidth * scaleX;
        const h = todo.offsetHeight * scaleY;

        const todoIndicator = document.createElement('div');
        todoIndicator.className = 'minimap-note-indicator';
        todoIndicator.style.position = 'absolute';
        todoIndicator.style.transform = `translate(${x}px, ${y}px)`;
        todoIndicator.style.width = w + 'px';
        todoIndicator.style.height = h + 'px';
        todoIndicator.style.backgroundColor = '#FF9800';
        todoIndicator.style.opacity = '0.6';
        todoIndicator.style.pointerEvents = 'none';

        fragment.appendChild(todoIndicator);
    });

    images.forEach(img => {
        const x = (parseFloat(img.getAttribute('data-x')) || 0) * scaleX;
        const y = (parseFloat(img.getAttribute('data-y')) || 0) * scaleY;
        const w = img.offsetWidth * scaleX;
        const h = img.offsetHeight * scaleY;

        const imgIndicator = document.createElement('div');
        imgIndicator.className = 'minimap-note-indicator';
        imgIndicator.style.position = 'absolute';
        imgIndicator.style.transform = `translate(${x}px, ${y}px)`;
        imgIndicator.style.width = w + 'px';
        imgIndicator.style.height = h + 'px';
        imgIndicator.style.backgroundColor = '#3f8dd3';
        imgIndicator.style.opacity = '0.6';
        imgIndicator.style.pointerEvents = 'none';

        fragment.appendChild(imgIndicator);
    });

    minimap.appendChild(fragment);
}

function debouncedUpdateMinimap() {
    if (minimapUpdateTimeout) {
        clearTimeout(minimapUpdateTimeout);
    }
    minimapUpdateTimeout = setTimeout(updateMinimap, 50);
}

function animateScrollTo(targetX, targetY) {
    const canvasWidth = notePostsContainer.offsetWidth * zoomLevel;
    const canvasHeight = notePostsContainer.offsetHeight * zoomLevel;

    const maxScrollLeft = Math.max(0, canvasWidth - viewportWidth);
    const maxScrollTop = Math.max(0, canvasHeight - viewportHeight);
    targetX = Math.max(0, Math.min(targetX, maxScrollLeft));
    targetY = Math.max(0, Math.min(targetY, maxScrollTop));

    const currentScrollLeft = canvasContainer.scrollLeft;
    const currentScrollTop = canvasContainer.scrollTop;
    const scrollDistanceX = targetX - currentScrollLeft;
    const scrollDistanceY = targetY - currentScrollTop;
    const duration = 500;
    const startTime = performance.now();

    function animateScroll(timestamp) {
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        canvasContainer.scrollLeft = currentScrollLeft + scrollDistanceX * easeProgress;
        canvasContainer.scrollTop = currentScrollTop + scrollDistanceY * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}


function addSearchFeature() {

    const existingSearch = document.getElementById('search-container');
    if (existingSearch) {
        existingSearch.remove();
    }
    searchContainer = document.createElement('div');
    searchContainer.id = 'search-container';
    document.body.appendChild(searchContainer);

    const searchInput = document.createElement('input');
    searchInput.id = 'search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search notes and todos...';
    searchContainer.appendChild(searchInput);

    const searchButton = document.createElement('button');
    searchButton.id = 'search-button';
    searchButton.textContent = 'Search';
    searchContainer.appendChild(searchButton);

    const searchAllCheckbox = document.createElement('input');
    searchAllCheckbox.type = 'checkbox';
    searchAllCheckbox.id = 'search-all-categories';
    searchAllCheckbox.checked = true;
    searchAllCheckbox.style.position = 'fixed';
    searchAllCheckbox.style.right = '115px';
    searchAllCheckbox.style.display = 'none';
    searchContainer.appendChild(searchAllCheckbox);

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    document.body.appendChild(resultsContainer);

    const toolSidebar = document.getElementById('tool-sidebar');
    if (toolSidebar && !toolSidebar.classList.contains('hidden')) {
        searchContainer.style.right = '20px';
        resultsContainer.style.right = '20px';
    } else {
        searchContainer.style.right = '150px';
        resultsContainer.style.right = '150px';
    }

    function updateSearchResultsPosition() {
        resultsContainer.style.right = searchContainer.style.right;
    }

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style') {
                updateSearchResultsPosition();
            }
        });
    });
    
    observer.observe(searchContainer, { attributes: true, attributeFilter: ['style'] });

    window.addEventListener('resize', updateSearchResultsPosition);

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    searchInput.addEventListener('input', function () {
        if (this.value === '') {
            clearHighlights();
            resultsContainer.style.display = 'none';
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) return;

        const searchAll = searchAllCheckbox.checked;
        const results = [];
        clearHighlights();

        const categoryMap = {};
        document.querySelectorAll('.updateLiveCategoryName').forEach(cat => {
            const categoryId = cat.getAttribute('data-category-id');
            if (categoryId) {
                categoryMap[categoryId] = cat.value;
            }
        });

        const notesContainers = document.querySelectorAll('.notes-container');
        notesContainers.forEach(container => {
            if (!searchAll && container.style.display === 'none') {
                return;
            }

            const categoryId = container.id.replace('notes-', '');
            const categoryName = categoryMap[categoryId] || 'Unknown Category';

            const notes = container.querySelectorAll('.note-section');
            notes.forEach(note => {
                const titleElement = note.querySelector('.updateLiveTitle');
                const contentElement = note.querySelector('.updateLiveContent');

                if (!titleElement || !contentElement) return;

                const title = titleElement.value;
                const content = contentElement.value;
                const noteId = titleElement.getAttribute('data-note-id');

                const titleMatch = title.toLowerCase().includes(searchTerm);
                const contentMatch = content.toLowerCase().includes(searchTerm);

                if (titleMatch || contentMatch) {
                    const originalStyle = window.getComputedStyle(note);
                    const originalBoxShadow = originalStyle.boxShadow;

                    results.push({
                        element: note,
                        id: noteId,
                        categoryId,
                        categoryName,
                        title,
                        content,
                        titleMatch,
                        contentMatch,
                        type: 'note',
                        originalBoxShadow
                    });

                    if (container.style.display !== 'none') {
                        note.style.boxShadow = '0 0 0 3px #5d3fd3';
                    }
                }
            });
        });

        const todosContainers = document.querySelectorAll('[id^="todos-"]');
        todosContainers.forEach(container => {
            if (!searchAll && container.style.display === 'none') {
                return;
            }

            const categoryId = container.id.replace('todos-', '');
            const categoryName = categoryMap[categoryId] || 'Unknown Category';

            const todos = container.querySelectorAll('.todo-section');
            todos.forEach(todo => {
                const titleElement = todo.querySelector('.todo-title');
                if (!titleElement) return;

                const title = titleElement.value;
                const todoId = todo.getAttribute('data-todo-id');

                const subtasks = [];
                todo.querySelectorAll('.subtodo-text').forEach(subtask => {
                    subtasks.push(subtask.value);
                });

                const content = subtasks.join(' ');
                const titleMatch = title.toLowerCase().includes(searchTerm);
                const contentMatch = content.toLowerCase().includes(searchTerm);

                if (titleMatch || contentMatch) {
                    const originalStyle = window.getComputedStyle(todo);
                    const originalBoxShadow = originalStyle.boxShadow;
                    const todoColor = originalStyle.backgroundColor || '#ffffff';

                    results.push({
                        element: todo,
                        id: todoId,
                        categoryId,
                        categoryName,
                        title,
                        content,
                        titleMatch,
                        contentMatch,
                        type: 'todo',
                        originalBoxShadow,
                        todoColor
                    });

                    if (container.style.display !== 'none') {
                        const highlightColor = getHighlightColorForTodo(todo);
                        todo.style.boxShadow = `0 0 0 3px ${highlightColor}`;
                    }
                }
            });
        });

        displayResults(results, searchTerm);
        updateSearchResultsPosition();
    }

    function getHighlightColorForTodo(todoElement) {
        let highlightColor = '#FF9800';
        const computedStyle = window.getComputedStyle(todoElement);
        const backgroundColor = computedStyle.backgroundColor;

        if (backgroundColor && backgroundColor !== 'transparent' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
            const todoHeader = todoElement.querySelector('.todo-header');
            if (todoHeader) {
                const headerStyle = window.getComputedStyle(todoHeader);
                const headerColor = headerStyle.backgroundColor;

                if (headerColor && headerColor !== 'transparent' && headerColor !== 'rgba(0, 0, 0, 0)') {
                    highlightColor = headerColor;
                }
            }
        }

        return highlightColor;
    }

    function displayResults(results, searchTerm) {
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #666;">No results found</p>';
            resultsContainer.style.display = 'block';
            return;
        }

        const resultsByCategory = {};
        results.forEach(result => {
            if (!resultsByCategory[result.categoryId]) {
                resultsByCategory[result.categoryId] = {
                    name: result.categoryName,
                    results: []
                };
            }
            resultsByCategory[result.categoryId].results.push(result);
        });

        const totalCount = document.createElement('div');
        totalCount.id = 'search-total-count';
        totalCount.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
        resultsContainer.appendChild(totalCount);

        Object.keys(resultsByCategory).forEach(categoryId => {
            const categoryResults = resultsByCategory[categoryId];
            const categoryHeader = document.createElement('div');
            categoryHeader.id = 'search-category-header';
            categoryHeader.textContent = `${categoryResults.name} (${categoryResults.results.length})`;

            categoryHeader.style.cursor = 'pointer';
            categoryHeader.addEventListener('click', () => {
                switchToCategory(categoryId);
            });

            resultsContainer.appendChild(categoryHeader);
            categoryResults.results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.id = 'search-result-item';

                let titleDisplay = result.title;
                if (result.titleMatch) {
                    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
                    titleDisplay = titleDisplay.replace(regex, '<span style="background-color: yellow; font-weight: bold;">$1</span>');
                }

                let contentPreview = result.content;
                if (contentPreview.length > 80) {
                    contentPreview = contentPreview.substring(0, 80) + '...';
                }

                if (result.contentMatch) {
                    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
                    contentPreview = contentPreview.replace(regex, '<span style="background-color: yellow; font-weight: bold;">$1</span>');
                }

                const itemTypeIcon = result.type === 'todo' ?
                    `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="Edit / List_Checklist">
                            <path id="Vector"
                                d="M11 17H20M8 15L5.5 18L4 17M11 12H20M8 10L5.5 13L4 12M11 7H20M8 5L5.5 8L4 7"
                                stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </g>
                    </svg>` :
                    `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="File / Note_Edit">
                            <path id="Vector"
                                d="M10.0002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2839 19.7822 18.9076C20 18.4802 20 17.921 20 16.8031V14M16 5L10 11V14H13L19 8M16 5L19 2L22 5L19 8M16 5L19 8"
                                stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </g>
                    </svg>`;

                let colorIndicator = '';


                resultItem.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; justify-content: start;">
                        <span style="display: inline-block; margin-right: 5px; display: flex; align-items: center; justify-content: center;">${itemTypeIcon}</span>
                        ${colorIndicator}
                        ${titleDisplay}
                    </div>
                    <div style="font-size: 0.9em; color: #666;">${contentPreview}</div>
                `;

                resultItem.addEventListener('click', () => {
                    switchToCategory(categoryId);
                    setTimeout(() => {
                        navigateToItem(result);
                    }, 300);
                });

                resultItem.addEventListener('mouseover', () => {
                    resultItem.style.backgroundColor = '#f0f0f0';
                });

                resultItem.addEventListener('mouseout', () => {
                    resultItem.style.backgroundColor = 'transparent';
                });

                resultsContainer.appendChild(resultItem);
            });
        });

        resultsContainer.style.display = 'block';
        updateSearchResultsPosition();
    }

    function switchToCategory(categoryId) {
        const categoryItem = document.querySelector(`.updateLiveCategoryName[data-category-id="${categoryId}"]`).closest('.category-item');
        if (categoryItem) {
            const selectButton = categoryItem.querySelector('.select');
            if (selectButton) {
                selectButton.click();
            } else {
                const allNoteContainers = document.querySelectorAll('.notes-container');
                allNoteContainers.forEach(container => {
                    container.style.display = 'none';
                });

                const allTodoContainers = document.querySelectorAll('[id^="todos-"]');
                allTodoContainers.forEach(container => {
                    container.style.display = 'none';
                });

                const selectedNotesContainer = document.getElementById(`notes-${categoryId}`);
                if (selectedNotesContainer) {
                    selectedNotesContainer.style.display = 'block';
                }

                const selectedTodosContainer = document.getElementById(`todos-${categoryId}`);
                if (selectedTodosContainer) {
                    selectedTodosContainer.style.display = 'block';
                }

                const allCategories = document.querySelectorAll('.category-item');
                allCategories.forEach(item => {
                    item.classList.remove('selected');
                });

                categoryItem.classList.add('selected');
                selectedCategoryId = categoryId;

                hiddenTool();

                updateMinimap();
            }
        }
    }

    function navigateToItem(result) {
        const element = result.element;
        const x = parseFloat(element.getAttribute('data-x')) || 0;
        const y = parseFloat(element.getAttribute('data-y')) || 0;

        const targetX = (x - (viewportWidth / 2) + (element.offsetWidth / 2)) * zoomLevel;
        const targetY = (y - (viewportHeight / 2) + (element.offsetHeight / 2)) * zoomLevel;

        animateScrollTo(targetX, targetY);

        let flashCount = 0;
        const originalShadow = result.originalBoxShadow || '0 4px 15px rgba(93, 63, 211, 0.1)';

        const highlightColor = result.type === 'todo'
            ? getHighlightColorForTodo(element)
            : 'rgba(93, 63, 211, 0.7)';

        const flashInterval = setInterval(() => {
            if (flashCount % 2 === 0) {
                element.style.boxShadow = `0 0 0 5px ${highlightColor}`;
            } else {
                element.style.boxShadow = originalShadow;
            }

            flashCount++;
            if (flashCount >= 6) {
                clearInterval(flashInterval);
            }
        }, 300);
    }

    function clearHighlights() {
        const notes = document.querySelectorAll('.note-section');
        notes.forEach(note => {
            note.style.boxShadow = '0 4px 15px rgba(93, 63, 211, 0.1)';
        });

        const todos = document.querySelectorAll('.todo-section');
        todos.forEach(todo => {
            todo.style.boxShadow = '0 4px 15px rgba(93, 63, 211, 0.1)';
        });
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    document.addEventListener('keydown', function (e) {
        const activeElement = document.activeElement;
        const isTyping = activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA';

        if (e.code === "KeyF" && !isTyping) {
            e.preventDefault();
            e.stopPropagation();
            searchVisible = !searchVisible;
            searchContainer.style.display = searchVisible ? 'flex' : 'none';
            console.log("Search toggled:", searchVisible);
            if (searchVisible) {
                updateSearchResultsPosition();
            }
        }
    }, true)
    return {
        container: searchContainer,
        input: searchInput,
        results: resultsContainer,
        searchAllToggle: searchAllCheckbox,
        search: performSearch
    };
}

function integrateNewFeatures() {
    let minimap = document.getElementById('canvas-minimap');
    if (!minimap) {
        minimap = addMinimap();
    }

    const search = addSearchFeature();

    const originalHandleMouseMove = handleMouseMove;
    window.handleMouseMove = function (e) {
        originalHandleMouseMove(e);
        debouncedUpdateMinimap();
    };

    const originalHandleMouseWheelZoom = handleMouseWheelZoom;
    window.handleMouseWheelZoom = function (event) {
        originalHandleMouseWheelZoom(event);
        debouncedUpdateMinimap();
    };

    const originalGetNotes = window.getNotes;
    window.getNotes = async function (categoryId) {
        await originalGetNotes(categoryId);
        updateMinimap();
    };

    const originalGetTodos = window.getTodos;
    window.getTodos = async function (categoryId) {
        await originalGetTodos(categoryId);
        updateMinimap();
    };

    const originalLoadImageById = window.loadImageById;
    window.loadImageById = async function (imageId, categoryId) {
        await originalLoadImageById(imageId, categoryId);
        updateMinimap();
    };

    const originalDeleteNotes = window.deleteNotes;
    window.deleteNotes = async function (noteId) {
        await originalDeleteNotes(noteId);
        updateMinimap();
    };

    const originalDeleteTodo = window.deleteTodo;
    window.deleteTodo = async function (todoId) {
        await originalDeleteTodo(todoId);
        updateMinimap();
    };

    canvasContainer.addEventListener('scroll', debouncedUpdateMinimap);

    const resizableElements = document.querySelectorAll('.resize-drag');
    resizableElements.forEach(element => {
        const observer = new MutationObserver(debouncedUpdateMinimap);
        observer.observe(element, { attributes: true, attributeFilter: ['style', 'data-x', 'data-y'] });
    });
    setInterval(updateMinimap, 0);
    setTimeout(updateMinimap, 500);
}

function integrateNewFeatures() {
    let minimap = document.getElementById('canvas-minimap');
    if (!minimap) {
        minimap = addMinimap();
    }

    const search = addSearchFeature();

    const originalHandleMouseMove = handleMouseMove;
    window.handleMouseMove = function (e) {
        originalHandleMouseMove(e);
        debouncedUpdateMinimap();
    };

    const originalHandleMouseWheelZoom = handleMouseWheelZoom;
    window.handleMouseWheelZoom = function (event) {
        originalHandleMouseWheelZoom(event);
        debouncedUpdateMinimap();
    };

    const originalGetNotes = window.getNotes;
    window.getNotes = async function (categoryId) {
        await originalGetNotes(categoryId);
        updateMinimap();
    };

    const originalGetTodos = window.getTodos;
    window.getTodos = async function (categoryId) {
        await originalGetTodos(categoryId);
        updateMinimap();
    };

    const originalLoadImageById = window.loadImageById;
    window.loadImageById = async function (imageId, categoryId) {
        await originalLoadImageById(imageId, categoryId);
        updateMinimap();
    };

    const originalDeleteNotes = window.deleteNotes;
    window.deleteNotes = async function (noteId) {
        await originalDeleteNotes(noteId);
        updateMinimap();
    };

    canvasContainer.addEventListener('scroll', debouncedUpdateMinimap);

    const resizableElements = document.querySelectorAll('.resize-drag');
    resizableElements.forEach(element => {
        const observer = new MutationObserver(debouncedUpdateMinimap);
        observer.observe(element, { attributes: true, attributeFilter: ['style', 'data-x', 'data-y'] });
    });
    setInterval(updateMinimap, 0);
    setTimeout(updateMinimap, 500);
}


const originalInitInfinityCanvas = initInfinityCanvas;
window.initInfinityCanvas = function () {
    originalInitInfinityCanvas();
    integrateNewFeatures();
};

if (document.querySelector('.canvas-container')) {
    integrateNewFeatures();
}

function updateNotification() {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.textContent = 'Right-click and drag to pan | Ctrl+R to reset camera | Tab to toggle minimap';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = 'opacity 1s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 1000);
    }, 7000);
}

////////////////////////////////////////////////////////////////////////////////////////
function updateNotePositioning() {
    window.saveNotePosition = async function (noteId, element) {
        try {
            const x = parseFloat(element.getAttribute('data-x')) || 0;
            const y = parseFloat(element.getAttribute('data-y')) || 0;
            const width = parseFloat(element.style.width);
            const height = parseFloat(element.style.height);
            const position = {
                x: x,
                y: y,
                width,
                height,
                canvasX: x,
                canvasY: y
            };

            const response = await fetch('/notes/updatenotesposition', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ noteId, position })
            });

            const data = await response.json();
            if (data.success) {
                console.log('success update notes position');
            } else {
                console.log('failed update notes position:', data.message);
            }
        } catch (err) {
            console.log('update notes failed:', err);
        }
    }

    window.saveImagePosition = async function (imageId, element) {
        try {
            const x = parseFloat(element.getAttribute('data-x')) || 0;
            const y = parseFloat(element.getAttribute('data-y')) || 0;
            const width = parseFloat(element.style.width) || 500;
            const height = parseFloat(element.style.height) || 281;
            const position = {
                x: x,
                y: y,
                width,
                height,
                canvasX: x,
                canvasY: y
            };

            const response = await fetch('/image/updateposition', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ imageId, position })
            });

            const data = await response.json();

            if (data.success) {
                console.log('Successfully updated image position');
            } else {
                console.error('Failed to update image position:', data.message);
                ntf(`Failed to save position: ${data.message}`, 'error');
            }
        } catch (err) {
            console.error('Update image position failed:', err);
        }
    }
}

function adjustNotesAndImagesPositioning() {
    window.originalGetNotes = window.getNotes;
    window.getNotes = async function (categoryId) {
        try {
            const response = await fetch(`/notes/getnotes?categoryId=${categoryId}`, { credentials: 'include' })
            const data = await response.json()
            const notesContainer = document.getElementById(`notes-${categoryId}`)

            if (notesContainer) {
                const imageContainers = notesContainer.querySelectorAll('.image-container');
                const imageElements = Array.from(imageContainers).map(container => container.cloneNode(true));

                const noteSections = notesContainer.querySelectorAll('.note-section');
                noteSections.forEach(section => section.remove());
            }

            if (!data.success) {
                console.log('Error', data.message)
                return
            }

            data.notes.forEach(function (notes) {
                const notesElement = document.createElement('section')
                const isNewNote = !notes.position || (!notes.position.canvasX && !notes.position.x);
                let x, y;

                if (isNewNote) {
                    x = notePostsContainer.offsetWidth / 2 - 125;
                    y = notePostsContainer.offsetHeight / 2 - 125
                    setTimeout(() => {
                        canvasContainer.scrollLeft = (x - viewportWidth / 2 + 125) * zoomLevel;
                        canvasContainer.scrollTop = (y - viewportHeight / 2 + 125) * zoomLevel;
                    }, 100);
                } else {
                    x = notes.position?.canvasX || notes.position?.x || 0;
                    y = notes.position?.canvasY || notes.position?.y || 0;
                }

                const positionStyle = `style="width: ${notes.position?.width || 300}px; height: ${notes.position?.height || 300}px; transform: translate(${x}px, ${y}px);"`;
                const positionData = `data-x="${x}" data-y="${y}"`;

                notesElement.innerHTML = `
                    <section class="note-section resize-drag" ${positionStyle} ${positionData}>
                        <textarea class="updateLiveTitle" maxlength="60" data-note-id="${notes._id}">${notes.title}</textarea> </br>
                        <textarea class="updateLiveContent" maxlength="10000" data-note-id="${notes._id}">${notes.content}</textarea>
                        <div class="delete-speech">
                            <button id="custom"> ⫶ </button>
                            <button id="speech">Speech</button>
                            <button onClick="deleteNotes('${notes._id}')">Delete notes</button> 
                        </div>
                    </section>
                `

                if (notesContainer) {
                    notesContainer.appendChild(notesElement)

                    const titleTextarea = notesElement.querySelector('.updateLiveTitle');
                    const contentTextarea = notesElement.querySelector('.updateLiveContent');
                    const noteSection = notesElement.querySelector('.note-section');

                    if (notes.theme) {
                        noteSection.style.backgroundColor = notes.theme.bgColor || '';

                        titleTextarea.style.color = notes.theme.titleColor || '';
                        titleTextarea.style.backgroundColor = notes.theme.secondaryBgColor || '';
                        titleTextarea.style.fontFamily = notes.theme.titleFont || '';
                        titleTextarea.style.fontSize = notes.theme.titleSize || '';

                        contentTextarea.style.color = notes.theme.contentColor || '';
                        contentTextarea.style.backgroundColor = notes.theme.secondaryBgColor || '';
                        contentTextarea.style.fontFamily = notes.theme.contentFont || '';
                        contentTextarea.style.fontSize = notes.theme.contentSize || '';

                        noteSection.classList.add('theme-applied');
                    }

                    titleTextarea.addEventListener('input', (event) => {
                        const newValue = event.target.value;
                        const noteId = event.target.dataset.noteId;
                        updateNotesTitle(noteId, newValue);
                    });

                    contentTextarea.addEventListener('input', (event) => {
                        const newValue = event.target.value;
                        const noteId = event.target.dataset.noteId;
                        updateNotesContent(noteId, newValue);
                    });
                }
            });

        } catch (err) {
            console.log("Error: ", err)
        }
    }

    window.originalLoadImageById = window.loadImageById;
    window.loadImageById = async function (imageId, categoryId) {
        try {
            const response = await fetch(`/image/getById?imageId=${imageId}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (!data.success || !data.image) {
                console.log('Error loading image:', data.message);
                return;
            }

            const image = data.image;
            const notesContainer = document.getElementById(`notes-${categoryId}`);
            if (!notesContainer) return;

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('resize-drag');
            imgContainer.classList.add('image-container');
            imgContainer.id = `image-container-${image._id}`;
            imgContainer.setAttribute('data-category-id', categoryId);

            const isNewImage = !image.position || (!image.position.canvasX && !image.position.x);
            let x, y;
            const defaultWidth = 500;
            const defaultHeight = 281;

            if (isNewImage) {
                x = notePostsContainer.offsetWidth / 2 - defaultWidth / 2;
                y = notePostsContainer.offsetHeight / 2 - defaultHeight / 2;

                setTimeout(() => {
                    canvasContainer.scrollLeft = (x - viewportWidth / 2 + defaultWidth / 2) * zoomLevel;
                    canvasContainer.scrollTop = (y - viewportHeight / 2 + defaultHeight / 2) * zoomLevel;
                }, 100);
            } else {
                x = image.position?.canvasX || image.position?.x || 0;
                y = image.position?.canvasY || image.position?.y || 0;
            }

            const width = image.position?.width || defaultWidth;
            const height = image.position?.height || defaultHeight;

            imgContainer.setAttribute('data-x', x);
            imgContainer.setAttribute('data-y', y);
            imgContainer.style.position = 'absolute';
            imgContainer.style.width = `${width}px`;
            imgContainer.style.height = `${height}px`;
            imgContainer.style.transform = `translate(${x}px, ${y}px)`;

            const hiddenTextarea = document.createElement('textarea');
            hiddenTextarea.style.display = 'none';
            hiddenTextarea.dataset.imageId = image._id;
            imgContainer.appendChild(hiddenTextarea);

            const img = document.createElement('img');
            img.src = `data:${image.image.contentType};base64,${image.image.data}`;
            img.alt = image.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.pointerEvents = 'none';

            imgContainer.appendChild(img);

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.classList.add('delete-image-button');
            deleteButton.style.position = 'absolute';
            deleteButton.style.bottom = '5px';
            deleteButton.style.right = '5px';
            deleteButton.addEventListener('click', function () {
                deleteImage(image._id);
                imgContainer.remove();
            });

            imgContainer.appendChild(deleteButton);
            notesContainer.appendChild(imgContainer);

            setupImageInteractions(imgContainer, image._id);
            updateMinimap();

        } catch (error) {
            console.error('Error loading image by ID:', error);
        }
    }
}

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



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initInfinityCanvas() {
    initializeCanvas();
    setupCanvasEventListeners();
    updateNotePositioning();
    updateTodoPositioning();
    adjustNotesAndImagesPositioning();
    adjustTodosPositioning();
    addResetButton();
    initZoom();
    console.log('Infinity canvas initialized');

    if (!document.getElementById('canvas-minimap')) {
        integrateNewFeatures();
    }

    updateNotification();
}

document.addEventListener('DOMContentLoaded', function () {
    initInfinityCanvas();
    setupSpeechRecognition();
});
/////////////////////////////////////////////////////////////////////////////////


/////////////////////// NEED FIX search position /////////////////////////