document.getElementById('globalAddImageButton').addEventListener('click', async function () {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async function () {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            await uploadImage(file);
        }
    });

    fileInput.click();
});

async function uploadImage(file) {
    try {
        if (!selectedCategoryId) {
            ntf('Please select a category first', 'warning');
            return;
        }

        const formData = new FormData();
        const uniqueId = Date.now();
        const uniqueName = file.name + '\u200B'.repeat(uniqueId % 1000);

        formData.append('image', file);
        formData.append('name', uniqueName);
        formData.append('categoryId', selectedCategoryId);

        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'Uploading...';
        loadingDiv.style.position = 'fixed';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%'
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.padding = '10px';
        loadingDiv.style.background = '#fff';
        loadingDiv.style.border = '1px solid #ccc';
        loadingDiv.style.zIndex = '1001';
        document.body.appendChild(loadingDiv);

        const response = await fetch('/image/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        document.body.removeChild(loadingDiv);

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to upload image');
        }

        await loadImageById(result.imageId, selectedCategoryId);

    } catch (error) {
        console.error('Error uploading image:', error);
        ntf('File too large Max 5 MB', 'error');
    }
}

async function loadImageById(imageId, categoryId) {
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

        // Check if this is a new image (no position data)
        const isNewImage = !image.position || (!image.position.canvasX && !image.position.x);
        let x, y;
        const defaultWidth = 500;
        const defaultHeight = 281;

        if (isNewImage) {
            // Center the image on the canvas
            x = Math.max(0, (notePostsContainer.offsetWidth / 2) - (defaultWidth / 2));
            y = Math.max(0, (notePostsContainer.offsetHeight / 2) - (defaultHeight / 2));
            
            // Scroll to center the new image in the viewport
            setTimeout(() => {
                if (canvasContainer && viewportWidth && viewportHeight) {
                    canvasContainer.scrollLeft = (x - viewportWidth / 2 + defaultWidth / 2) * zoomLevel;
                    canvasContainer.scrollTop = (y - viewportHeight / 2 + defaultHeight / 2) * zoomLevel;
                }
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
        
        // Update minimap if it exists
        if (typeof updateMinimap === 'function') {
            updateMinimap();
        }
    } catch (error) {
        console.error('Error loading image by ID:', error);
    }
}



async function loadImagesForCategory(categoryId) {
    try {
        if (!categoryId) return;

        const response = await fetch(`/image/get?categoryId=${categoryId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            console.log('Error loading images:', data.message);
            return;
        }

        const notesContainer = document.getElementById(`notes-${categoryId}`);
        if (!notesContainer) return;

        const existingImageIds = Array.from(document.querySelectorAll(`.image-container[data-category-id="${categoryId}"]`))
            .map(container => {
                const textarea = container.querySelector('textarea');
                return textarea ? textarea.dataset.imageId : null;
            })
            .filter(id => id);

        const newImageIds = data.images.map(img => img._id);

        existingImageIds.forEach(id => {
            if (!newImageIds.includes(id)) {
                const container = document.getElementById(`image-container-${id}`);
                if (container) container.remove();
            }
        });

        data.images.forEach(image => {

            if (document.getElementById(`image-container-${image._id}`)) return;

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('resize-drag');
            imgContainer.classList.add('image-container');
            imgContainer.id = `image-container-${image._id}`;
            imgContainer.setAttribute('data-category-id', categoryId);

            // Check if this image has proper position data
            const isNewImage = !image.position || (!image.position.canvasX && !image.position.x);
            let x, y;
            const defaultWidth = 500;
            const defaultHeight = 281;

            if (isNewImage) {
                // Center the image on the canvas
                x = Math.max(0, (notePostsContainer.offsetWidth / 2) - (defaultWidth / 2));
                y = Math.max(0, (notePostsContainer.offsetHeight / 2) - (defaultHeight / 2));
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
        });

    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function setupImageInteractions(imgContainer, imageId) {
    interact(`#${imgContainer.id}`)
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
                    const imageId = event.target.querySelector('textarea')?.dataset.imageId;
                    if (imageId) {
                        saveImagePosition(imageId, event.target);
                    }
                }
            },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 200, height: 150 }
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

                    const imageId = event.target.querySelector('textarea')?.dataset.imageId;
                    if (imageId) {
                        saveImagePosition(imageId, event.target);
                    }
                }
            }
        });

    async function saveImagePosition(imageId, element) {
        try {
            const x = parseFloat(element.getAttribute('data-x')) || 0;
            const y = parseFloat(element.getAttribute('data-y')) || 0;
            const width = parseFloat(element.style.width) || 500;
            const height = parseFloat(element.style.height) || 281;

            const position = { 
                x, 
                y, 
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

async function deleteImage(imageId) {
    try {
        const response = await fetch('/image/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify({ imageId })
        });
        const data = await response.json();
        if (data.success) {
            console.log('Image deleted successfully');
        } else {
            console.log('Failed to delete image:', data.message);
        }
    } catch (err) {
        console.log('Error deleting image:', err)
    }
}
