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

function initializeCanvas() {
    notePostsContainer.style.width = "10000px";
    notePostsContainer.style.height = "10000px";
    notePostsContainer.style.position = "relative";

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

    canvasContainer.scrollLeft = scrollLeft - walkX;
    canvasContainer.scrollTop = scrollTop - walkY;
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

    const newScrollLeft = pointX * scaleFactor - relativeX;
    const newScrollTop = pointY * scaleFactor - relativeY;

    canvasContainer.scrollLeft = newScrollLeft;
    canvasContainer.scrollTop = newScrollTop;

    updateZoomUI(zoomLevel);
}

function updateZoomUI(level) {
    let zoomIndicator = document.getElementById('zoom-indicator');

    if (!zoomIndicator) {
        zoomIndicator = document.createElement('div');
        zoomIndicator.id = 'zoom-indicator';
        zoomIndicator.style.position = 'fixed';
        zoomIndicator.style.bottom = '10px';
        zoomIndicator.style.left = '10px';
        zoomIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
        zoomIndicator.style.color = 'white';
        zoomIndicator.style.padding = '5px 10px';
        zoomIndicator.style.borderRadius = '3px';
        zoomIndicator.style.fontSize = '12px';
        zoomIndicator.style.zIndex = '1000';
        zoomIndicator.style.opacity = '0';
        zoomIndicator.style.transition = 'opacity 0.5s ease';
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
        
        .note-section {
            position: absolute;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(93, 63, 211, 0.1);
            padding: 15px;
            width: 250px;
            min-height: 250px;
            touch-action: none;
            user-select: none;
            display: flex;
            flex-direction: column;
            transition: box-shadow 0.3s ease;
            cursor: move;
        }
        
        .zoom-controls {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        }
        
        .zoom-controls button {
            padding: 5px 10px;
            background: rgba(255,255,255,0.8);
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
        <button id="zoom-in">+</button>
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
    });

}

function addResetButton() {
    const resetButton = document.createElement('button');

    resetButton.addEventListener('click', () => {
        zoomLevel = 1;
        notePostsContainer.style.transform = `scale(${zoomLevel})`;
        updateZoomUI(zoomLevel);
        resetCamera();
    });

    document.body.appendChild(resetButton);
}

function handleMouseUp(e) {
    isPanning = false;
    canvasContainer.style.cursor = "default";
}

function resetCamera() {
    const currentScrollLeft = canvasContainer.scrollLeft;
    const currentScrollTop = canvasContainer.scrollTop;
    const scrollDistanceX = centerX - currentScrollLeft;
    const scrollDistanceY = centerY - currentScrollTop;
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
                alert(`Failed to save position: ${data.message}`);
            }
        } catch (err) {
            console.error('Update image position failed:', err);
        }
    }
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
        resetCamera();
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
                    x = (canvasContainer.scrollLeft + viewportWidth / 2) - 125;
                    y = (canvasContainer.scrollTop + viewportHeight / 2) - 125;
                } else {
                    x = notes.position?.canvasX || notes.position?.x || 0;
                    y = notes.position?.canvasY || notes.position?.y || 0;
                }

                const positionStyle = `style="width: ${notes.position?.width || 250}px; height: ${notes.position?.height || 250}px; transform: translate(${x}px, ${y}px);"`;
                const positionData = `data-x="${x}" data-y="${y}"`;

                notesElement.innerHTML = `
                <section class="note-section resize-drag" ${positionStyle} ${positionData}>
                    <textarea class="updateLiveTitle" data-note-id="${notes._id}">${notes.title}</textarea> </br>
                    <textarea class="updateLiveContent" data-note-id="${notes._id}">${notes.content}</textarea>
                    <button onClick="deleteNotes('${notes._id}')">Delete notes</button> 
                </section>
            `

                if (notesContainer) {
                    notesContainer.appendChild(notesElement)

                    const titleTextarea = notesElement.querySelector('.updateLiveTitle');
                    const contentTextarea = notesElement.querySelector('.updateLiveContent');

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
            if (isNewImage) {
                const defaultWidth = 500;
                const defaultHeight = 281
                x = (canvasContainer.scrollLeft + viewportWidth / 2) - (defaultWidth / 2);
                y = (canvasContainer.scrollTop + viewportHeight / 2) - (defaultHeight / 2);
            } else {
                x = image.position?.canvasX || image.position?.x || 0;
                y = image.position?.canvasY || image.position?.y || 0;
            }

            const width = image.position?.width || 500;
            const height = image.position?.height || 281;

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

        } catch (error) {
            console.error('Error loading image by ID:', error);
        }
    }
}

const originalAddNote = window.addNote;
window.addNote = async function (categoryId) {
    if (originalAddNote) {
        await originalAddNote(categoryId);
    } else {
        try {
            const response = await fetch(`/notes/addnotes?categoryId=${categoryId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title: 'New Note', content: 'Add your content here...' })
            });

            const data = await response.json();
            if (data.success) {
                await window.getNotes(categoryId);
            }
        } catch (err) {
            console.error("Error adding note:", err);
        }
    }
};

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
/*
function addMinimap() {
    if (document.getElementById('canvas-minimap')) {
        console.log('Minimap already exists');
        return document.getElementById('canvas-minimap');
    }
    const minimap = document.createElement('div');
    minimap.id = 'canvas-minimap';
    minimap.style.position = 'fixed';
    minimap.style.top = '20px';
    minimap.style.right = '20px';
    minimap.style.width = '200px';
    minimap.style.height = '150px';
    minimap.style.backgroundColor = '#f0f0f0';
    minimap.style.border = '1px solid #ccc';
    minimap.style.borderRadius = '5px';
    minimap.style.overflow = 'hidden';
    minimap.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    minimap.style.zIndex = '1000';
    document.body.appendChild(minimap);

    const minimapContent = document.createElement('div');
    minimapContent.id = 'minimap-content';
    minimapContent.style.position = 'relative';
    minimapContent.style.width = '100%';
    minimapContent.style.height = '100%';
    minimap.appendChild(minimapContent);

    const viewportIndicator = document.createElement('div');
    viewportIndicator.id = 'viewport-indicator';
    viewportIndicator.style.position = 'absolute';
    viewportIndicator.style.border = '2px solid #5d3fd3';
    viewportIndicator.style.backgroundColor = 'rgba(93, 63, 211, 0.1)';
    viewportIndicator.style.pointerEvents = 'none';
    minimapContent.appendChild(viewportIndicator);

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '−';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '5px';
    toggleButton.style.right = '5px';
    toggleButton.style.width = '20px';
    toggleButton.style.height = '20px';
    toggleButton.style.padding = '0';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.backgroundColor = 'rgba(255,255,255,0.7)';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '1001';
    minimap.appendChild(toggleButton);

    let minimized = false;
    
    function toggleMinimapVisibility() {
        if (minimized) {
            minimap.style.height = '150px';
            minimapContent.style.display = 'block';
            toggleButton.textContent = '−';
        } else {
            minimap.style.height = '30px';
            minimapContent.style.display = 'none';
            toggleButton.textContent = '+';
        }
        minimized = !minimized;
    }
    
    toggleButton.addEventListener('click', toggleMinimapVisibility);

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            toggleMinimapVisibility();
        }
    });

    // Make minimap draggable
    let isDragging = false;
    let dragStartX, dragStartY;
    let initialRight, initialTop;

    minimap.addEventListener('mousedown', (e) => {
        if (e.target === minimapContent || e.target === minimap) {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            initialRight = parseInt(minimap.style.right || '20', 10);
            initialTop = parseInt(minimap.style.top || '20', 10);
            minimap.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        minimap.style.right = (initialRight - deltaX) + 'px';
        minimap.style.top = (initialTop + deltaY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        minimap.style.cursor = 'grab';
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
        
        const targetX = clickX * ratioX - (viewportWidth / 2);
        const targetY = clickY * ratioY - (viewportHeight / 2);
        
        animateScrollTo(targetX, targetY);
    });

    return {
        update: updateMinimap,
        element: minimap,
        content: minimapContent,
        indicator: viewportIndicator,
        toggle: toggleMinimapVisibility
    };
}

function updateMinimap() {
    const minimap = document.getElementById('minimap-content');
    const indicator = document.getElementById('viewport-indicator');
    if (!minimap || !indicator) return;

    const noteIndicators = minimap.querySelectorAll('.minimap-note-indicator');
    noteIndicators.forEach(ind => ind.remove());

    const notes = document.querySelectorAll('.note-section');
    const images = document.querySelectorAll('.image-container');

    const canvasWidth = notePostsContainer.offsetWidth;
    const canvasHeight = notePostsContainer.offsetHeight;
    const minimapWidth = minimap.offsetWidth;
    const minimapHeight = minimap.offsetHeight;
    
    const scaleX = minimapWidth / canvasWidth;
    const scaleY = minimapHeight / canvasHeight;

    const viewportX = canvasContainer.scrollLeft * scaleX;
    const viewportY = canvasContainer.scrollTop * scaleY
    const viewportW = viewportWidth * scaleX;
    const viewportH = viewportHeight * scaleY;

    indicator.style.left = viewportX + 'px';
    indicator.style.top = viewportY + 'px';
    indicator.style.width = viewportW + 'px';
    indicator.style.height = viewportH + 'px';
    notes.forEach(note => {
        const x = (parseFloat(note.getAttribute('data-x')) || 0) * scaleX;
        const y = (parseFloat(note.getAttribute('data-y')) || 0) * scaleY;
        const w = note.offsetWidth * scaleX;
        const h = note.offsetHeight * scaleY;

        const noteIndicator = document.createElement('div');
        noteIndicator.className = 'minimap-note-indicator';
        noteIndicator.style.position = 'absolute';
        noteIndicator.style.left = x + 'px';
        noteIndicator.style.top = y + 'px';
        noteIndicator.style.width = w + 'px';
        noteIndicator.style.height = h + 'px';
        noteIndicator.style.backgroundColor = '#5d3fd3';
        noteIndicator.style.opacity = '0.6';
        noteIndicator.style.pointerEvents = 'none';
        
        minimap.appendChild(noteIndicator);
    });

    images.forEach(img => {
        const x = (parseFloat(img.getAttribute('data-x')) || 0) * scaleX;
        const y = (parseFloat(img.getAttribute('data-y')) || 0) * scaleY;
        const w = img.offsetWidth * scaleX;
        const h = img.offsetHeight * scaleY;

        const imgIndicator = document.createElement('div');
        imgIndicator.className = 'minimap-note-indicator';
        imgIndicator.style.position = 'absolute';
        imgIndicator.style.left = x + 'px';
        imgIndicator.style.top = y + 'px';
        imgIndicator.style.width = w + 'px';
        imgIndicator.style.height = h + 'px';
        imgIndicator.style.backgroundColor = '#3f8dd3';
        imgIndicator.style.opacity = '0.6';
        imgIndicator.style.pointerEvents = 'none';
        
        minimap.appendChild(imgIndicator);
    });
}

function animateScrollTo(targetX, targetY) {
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
    const searchContainer = document.createElement('div');
    searchContainer.id = 'search-container';
    searchContainer.style.position = 'fixed';
    searchContainer.style.top = '20px';
    searchContainer.style.left = '20px';
    searchContainer.style.zIndex = '1000';
    searchContainer.style.display = 'flex';
    searchContainer.style.alignItems = 'center';
    searchContainer.style.gap = '10px';
    document.body.appendChild(searchContainer);

    const searchInput = document.createElement('input');
    searchInput.id = 'search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search notes...';
    searchInput.style.padding = '8px 12px';
    searchInput.style.borderRadius = '20px';
    searchInput.style.border = '1px solid #ccc';
    searchInput.style.width = '200px';
    searchInput.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    searchContainer.appendChild(searchInput);

    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.style.padding = '8px 15px';
    searchButton.style.borderRadius = '20px';
    searchButton.style.border = 'none';
    searchButton.style.backgroundColor = '#5d3fd3';
    searchButton.style.color = 'white';
    searchButton.style.cursor = 'pointer';
    searchContainer.appendChild(searchButton);

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.style.position = 'fixed';
    resultsContainer.style.top = '60px';
    resultsContainer.style.left = '20px';
    resultsContainer.style.width = '250px';
    resultsContainer.style.maxHeight = '300px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.backgroundColor = 'white';
    resultsContainer.style.borderRadius = '5px';
    resultsContainer.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    resultsContainer.style.padding = '10px';
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.display = 'none';
    document.body.appendChild(resultsContainer);

    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            clearHighlights();
            resultsContainer.style.display = 'none';
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) return;
        
        const notes = document.querySelectorAll('.note-section');
        const results = [];
        
        clearHighlights();
        
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
                results.push({
                    element: note,
                    noteId,
                    title,
                    content,
                    titleMatch,
                    contentMatch
                });
                
                note.style.boxShadow = '0 0 0 3px #5d3fd3';
            }
        });
        
        displayResults(results, searchTerm);
    }

    function displayResults(results, searchTerm) {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #666;">No results found</p>';
            resultsContainer.style.display = 'block';
            return;
        }
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.style.padding = '8px';
            resultItem.style.borderBottom = '1px solid #eee';
            resultItem.style.cursor = 'pointer';
            
            let titleDisplay = result.title;
            if (result.titleMatch) {
                const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
                titleDisplay = titleDisplay.replace(regex, '<span style="background-color: yellow; font-weight: bold;">$1</span>');
            }
            let contentPreview = result.content;
            if (contentPreview.length > 100) {
                contentPreview = contentPreview.substring(0, 100) + '...';
            }
            
            if (result.contentMatch) {
                const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
                contentPreview = contentPreview.replace(regex, '<span style="background-color: yellow; font-weight: bold;">$1</span>');
            }
            
            resultItem.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">${titleDisplay}</div>
                <div style="font-size: 0.9em; color: #666;">${contentPreview}</div>
            `;
            
            resultItem.addEventListener('click', () => {
                navigateToNote(result.element);
            });
            
            resultItem.addEventListener('mouseover', () => {
                resultItem.style.backgroundColor = '#f0f0f0';
            });
            
            resultItem.addEventListener('mouseout', () => {
                resultItem.style.backgroundColor = 'transparent';
            });
            
            resultsContainer.appendChild(resultItem);
        });
        
        resultsContainer.style.display = 'block';
    }

    function navigateToNote(noteElement) {
        const x = parseFloat(noteElement.getAttribute('data-x')) || 0;
        const y = parseFloat(noteElement.getAttribute('data-y')) || 0;
        
        const targetX = x - (viewportWidth / 2) + (noteElement.offsetWidth / 2);
        const targetY = y - (viewportHeight / 2) + (noteElement.offsetHeight / 2);
    
        animateScrollTo(targetX, targetY);
        
        let flashCount = 0;
        const originalShadow = noteElement.style.boxShadow;
        const flashInterval = setInterval(() => {
            if (flashCount % 2 === 0) {
                noteElement.style.boxShadow = '0 0 0 5px rgba(93, 63, 211, 0.7)';
            } else {
                noteElement.style.boxShadow = originalShadow;
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
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return {
        container: searchContainer,
        input: searchInput,
        results: resultsContainer,
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
    window.handleMouseMove = function(e) {
        originalHandleMouseMove(e);
        updateMinimap();
    };
    
    const originalHandleMouseWheelZoom = handleMouseWheelZoom;
    window.handleMouseWheelZoom = function(event) {
        originalHandleMouseWheelZoom(event);
        updateMinimap();
    };
    const originalGetNotes = window.getNotes;
    window.getNotes = async function(categoryId) {
        await originalGetNotes(categoryId);
        updateMinimap();
    };
    
    const originalLoadImageById = window.loadImageById;
    window.loadImageById = async function(imageId, categoryId) {
        await originalLoadImageById(imageId, categoryId);
        updateMinimap();
    };
    
    const originalDeleteNotes = window.deleteNotes;
    window.deleteNotes = async function(noteId) {
        await originalDeleteNotes(noteId);
        updateMinimap();
    };
    
    setInterval(updateMinimap, 2000);

    setTimeout(updateMinimap, 500);
    
    console.log('Minimap and Search features integrated');
}

const originalInitInfinityCanvas = initInfinityCanvas;
window.initInfinityCanvas = function() {
    originalInitInfinityCanvas();
    integrateNewFeatures();
};

if (document.querySelector('.canvas-container')) {
    integrateNewFeatures();
}
 */
function initInfinityCanvas() {
    initializeCanvas();
    setupCanvasEventListeners();
    updateNotePositioning();
    adjustNotesAndImagesPositioning();
    addResetButton();
    initZoom();

    console.log('Infinity canvas initialized');

    if (!document.getElementById('canvas-minimap')) {
        integrateNewFeatures();
    }

    const notification = document.createElement('div');
    notification.textContent = 'Right-click and drag to pan | Ctrl+R to reset camera | Tab to toggle minimap';
    notification.style.position = 'fixed';
    notification.style.bottom = '10px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '5px 15px';
    notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
    notification.style.color = 'white';
    notification.style.borderRadius = '20px';
    notification.style.fontSize = '14px';
    notification.style.zIndex = '1000';
    notification.style.opacity = '1';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = 'opacity 1s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 1000);
    }, 7000);
}

document.addEventListener('DOMContentLoaded', function () {
    initInfinityCanvas();
});


// fix reset camera only works on the first category only