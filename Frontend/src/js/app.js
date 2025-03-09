interact('.resize-drag:not(.image-container)')
    .resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
        move: function (event) {
            let { x, y } = event.target.dataset

            x = (parseFloat(x) || 0) + event.deltaRect.left
            y = (parseFloat(y) || 0) + event.deltaRect.top

            Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x}px, ${y}px)`
            })

            Object.assign(event.target.dataset, { x, y })
        },
        end: function(event) {
            const noteId = event.target.querySelector('textarea').dataset.noteId;
            if (noteId) {
                saveNotePosition(noteId, event.target);
            }
        }
    },
    modifiers: [
        // minimum size
        interact.modifiers.restrictSize({
            min: { width: 250, height: 250 }
        })
        ],

        inertia: true
    })
.draggable({
    inertia: true,
    modifiers: [
    interact.modifiers.restrictRect({
        restriction: 'body',
        endOnly: true
    })
    ],
    autoScroll: true,
    listeners: {
    move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        
        target.style.zIndex = '1000';
    },
        end(event) {
            event.target.style.zIndex = '1';
            
            const noteId = event.target.querySelector('textarea').dataset.noteId;
            if (noteId) {
                saveNotePosition(noteId, event.target);
            }
        }
    }
})




let selectedCategoryId = null;
const signOutElements = document.querySelectorAll('.signOut');
signOutElements.forEach(function(element) {
    element.addEventListener('click', async function() {
        try{
            const response = await fetch('http://localhost:3000/account/signout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if(data.success){
                localStorage.clear();
                window.location.replace('/index.html');
            }
        } catch (error) {
            console.log('Error:', error);
        }
    })
})

async function getUsername(){
    try{
        const response = await fetch('/account/getusername')
        const data = await response.json()
        
        if(data.success){
            document.getElementById('usernameLabel').innerHTML = `Welcome <em><b>${data.username}</b></em>`
        }else{
        console.log('Username Invalid', error);
        }
        
    }catch(error){
        console.log('Username Invalid', error);
    }
}

document.getElementById('newCategory').addEventListener('click', async function(){
    const categoryName = 'Add your Category here...';
    const uniqueId = Date.now();
    const uniqueCategoryName = categoryName + '\u200B'.repeat(uniqueId % 1000);
    try{
        const response = await fetch('http://localhost:3000/category/createcategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                categoryName: uniqueCategoryName,
            })
        });

        const data = await response.json();
        
        if(data.success){
            console.log('Category created');
            
            const categoriesData = await getCategory();
            
            if (categoriesData && categoriesData.categories && categoriesData.categories.length > 0) {
                const newCategory = categoriesData.categories.find(cat => 
                    cat.categoryName === uniqueCategoryName);
                
                if (newCategory) {
                    selectedCategoryId = newCategory._id;
                    
                    const allNoteContainers = document.querySelectorAll('.notes-container');
                    allNoteContainers.forEach(container => {
                        container.style.display = 'none';
                    });
                    

                    const selectedNotesContainer = document.getElementById(`notes-${selectedCategoryId}`);
                    if (selectedNotesContainer) {
                        selectedNotesContainer.style.display = 'block';
                    }
                    
                    const allCategories = document.querySelectorAll('.category-item');
                    allCategories.forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    const newCategoryItem = document.querySelector(`.updateLiveCategoryName[data-category-id="${selectedCategoryId}"]`).closest('.category-item');
                    if (newCategoryItem) {
                        newCategoryItem.classList.add('selected');
                        
                        const textarea = newCategoryItem.querySelector('.updateLiveCategoryName');
                        if (textarea) {
                            textarea.focus();
                            textarea.select();
                        }
                    }
                    
                    updateAddNotesButton();
                    updateAddImageButton();
                }
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.log('Error create category', error);
    }
});

async function getCategory() {
    try {
        const response = await fetch('/category/getcategory', {credentials: 'include'});
        const data = await response.json();
        const postSection = document.getElementById('posts');
        const notePostsSection = document.getElementById('notePosts');
        postSection.innerHTML = '';
        notePostsSection.innerHTML = '';
        
        if (!data.success) {
            console.log('Error', data.message);
            return null;
        }

        if (!selectedCategoryId && data.categories.length > 0) {
            selectedCategoryId = data.categories[0]._id;
        }

        data.categories.forEach(function(category) {
            const categoryElement = document.createElement('section');
            categoryElement.className = 'category-item';
            categoryElement.innerHTML = `
                <textarea class="updateLiveCategoryName" data-category-id="${category._id}">${category.categoryName}</textarea>
                <button class="deleteCategory" onClick="deleteCategory('${category._id}')">Delete</button> </br>
                <button class="select">Select</button>
            `;
            postSection.appendChild(categoryElement);
            const textarea = categoryElement.querySelector('.updateLiveCategoryName');
            textarea.addEventListener('input', (event) => {
                const newValue = event.target.value;
                const categoryId = event.target.dataset.categoryId;
                updateCategory(categoryId, newValue);
            });

            const notesContainer = document.createElement('section');
            notesContainer.id = `notes-${category._id}`;
            notesContainer.className = 'notes-container';
            notesContainer.style.display = category._id === selectedCategoryId ? 'block' : 'none';
            notePostsSection.appendChild(notesContainer);

            getNotes(category._id);
        });

        const selectedCategory = document.querySelector(`.updateLiveCategoryName[data-category-id="${selectedCategoryId}"]`);
        if (selectedCategory) {
            selectedCategory.closest('.category-item').classList.add('selected');
        }
        
        updateAddNotesButton();
        updateAddImageButton();
        
        if (selectedCategoryId) {
            loadImagesForCategory(selectedCategoryId);
        }

        return data;

    } catch(err) {
        console.log(err);
        return null;
    }
}

async function deleteCategory(id) {
    try{
        const response = await fetch('/category/deletecategory',{
            method: 'DELETE',
            headers: {'Content-Type':'application/json'},
            credentials: "include",
            body: JSON.stringify({id})
        })
        const data = await response.json()
        if(data.success){
            getCategory(); 
            updateAddNotesButton();
            updateAddImageButton();
        }else{
            alert('Failed to delete')
            console.log(err)
        }
    }catch(err){
        console.log('Error:', err)
    }
}

document.getElementById('globalAddNotesButton').addEventListener('click', async function () {
    const categoryId = selectedCategoryId || event.target.dataset.categoryId;
    const times = new Date().toLocaleString();
    const title = `Add your Title here...`
    const content = `Add your Content here...`;

    const uniqueId = Date.now();
    const uniqueTitle = title + '\u200B'.repeat(uniqueId % 1000);
    const uniqueContent = content + '\u200B'.repeat(uniqueId % 1000);
    try {
        const response = await fetch('http://localhost:3000/notes/createnotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
                title: uniqueTitle, 
                content: uniqueContent,
                times, 
                categoryId })
        })

        const data = await response.json();
        if (data.success) {
            getNotes(categoryId)
            
        } else {
            alert('Failed to add note: ' + data.message);
        }
    } catch (err) {
        console.error('Error:', err);
    }
});

async function getNotes(categoryId) {
    try {
        const response = await fetch(`/notes/getnotes?categoryId=${categoryId}`, { credentials: 'include' })
        const data = await response.json()
        const notesContainer = document.getElementById(`notes-${categoryId}`)
        
        if(notesContainer){
        const imageContainers = notesContainer.querySelectorAll('.image-container');
        const imageElements = Array.from(imageContainers).map(container => container.cloneNode(true));
        
        const noteSections = notesContainer.querySelectorAll('.note-section');
        noteSections.forEach(section => section.remove());
        }

        if (!data.success) {
            console.log('Error', data.message)
            return
        }
        
        data.notes.forEach(function(notes) {
            const notesElement = document.createElement('section')
            const positionStyle = notes.position ? 
                `style="width: ${notes.position.width || 250}px; height: ${notes.position.height || 250}px; transform: translate(${notes.position.x || 0}px, ${notes.position.y || 0}px);"` : '';
            const positionData = notes.position ? 
                `data-x="${notes.position.x || 0}" data-y="${notes.position.y || 0}"` : '';
                
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
        
        if (data.success) {
            console.log("Success get note data")
        } else {
            console.log("Error get notes data")
        }
    } catch(err) {
        console.log("Error: ", err)
    }
}

async function deleteNotes(noteId) {
    try{
        const response = await fetch('/notes/deletenotes',{
            method: 'DELETE',
            headers: {'Content-Type':'application/json'},
            credentials: "include",
            body: JSON.stringify({noteId})
        })
        const data = await response.json()
        if(data.success){
            getCategory();
        }else{
            alert('Failed to delete')
            console.log(err)
        }
    }catch(err){
        console.log('Error:', err)
    }
}

async function updateCategory(categoryId, newValue) {
    try {
        const response = await fetch('/category/updatecategory', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId, newValue })
        });
        const data = await response.json();
        if (data.success) {
            console.log('Category updated successfully');
        } else {
            console.log('Failed to update category:', data.message);
        }
    } catch (err) {
        console.log('Update category failed:', err);
    }
}

async function updateNotesTitle(noteId, newValue) {
    try {
        const response = await fetch('/notes/updatenotes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ noteId, newTitle: newValue })
        })
        const data = await response.json();
        if (data.success) {
            console.log('Note title updated successfully');
        } else {
            console.log('Failed to update note title:', data.message)
        }
    } catch (err) {
        console.log('Update note title failed:', err);
    }
}

async function updateNotesContent(noteId, newValue) {
    try {
        const response = await fetch('/notes/updatenotes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ noteId, newContent: newValue })
        });
        const data = await response.json();
        if (data.success) {
            console.log('Note content updated successfully');
        } else {
            console.log('Failed to update note content:', data.message);
        }
    } catch (err) {
        console.log('Update note content failed:', err);
    }
}

async function saveNotePosition(noteId, element) {
    try {
        const x = parseFloat(element.getAttribute('data-x')) || 0;
        const y = parseFloat(element.getAttribute('data-y')) || 0;
        const width = parseFloat(element.style.width);
        const height = parseFloat(element.style.height);
        
        const position = { x, y, width, height };
        
        const response = await fetch('/notes/updatenotesposition', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ noteId, position })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('sucess update notes position');
        } else {
            console.log('failed update notes position:', data.message);
        }
    } catch (err) {
        console.log('update notes failed:', err);
    }
}

document.addEventListener('click', function(event) {
    const categoryItem = event.target.closest('.category-item');
    if (categoryItem && 
        !event.target.classList.contains('updateLiveCategoryName') && 
        !event.target.classList.contains('deleteCategory') &&
        !event.target.classList.contains('addNotesButton')) {
        
        const categoryId = categoryItem.querySelector('[data-category-id]').dataset.categoryId;
        selectedCategoryId = categoryId;
        
        const allNoteContainers = document.querySelectorAll('.notes-container');
        allNoteContainers.forEach(container => {
            container.style.display = 'none';
        });
        
        const selectedNotesContainer = document.getElementById(`notes-${categoryId}`);
        if (selectedNotesContainer) {
            selectedNotesContainer.style.display = 'block';
        }
        
        const allCategoryItems = document.querySelectorAll('.category-item');
        allCategoryItems.forEach(item => {
            item.classList.remove('selected');
        });
        categoryItem.classList.add('selected');
        
        updateAddNotesButton();
        updateAddImageButton();

        loadImagesForCategory(categoryId);
    }
});

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
            alert('Please select a category first');
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
        alert('Failed to upload image: ' + error.message);
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
        
        const x = image.position?.x || 0;
        const y = image.position?.y || 0;
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
        deleteButton.addEventListener('click', function() {
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

function setupImageInteractions(imgContainer, imageId) {
    interact(`#${imgContainer.id}`)
        .resizable({
            edges: { top: true, left: true, bottom: true, right: true },
            listeners: {
                move: function (event) {
                    let { x, y } = event.target.dataset;

                    x = (parseFloat(x) || 0) + event.deltaRect.left;
                    y = (parseFloat(y) || 0) + event.deltaRect.top;

                    Object.assign(event.target.style, {
                        width: `${event.rect.width}px`,
                        height: `${event.rect.height}px`,
                        transform: `translate(${x}px, ${y}px)`
                    });

                    Object.assign(event.target.dataset, { x, y });
                },
                end: function(event) {
                    const imageId = event.target.querySelector('textarea').dataset.imageId;
                    if (imageId) {
                        saveImagePosition(imageId, event.target);
                    }
                }
            },
            modifiers: [
                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 100, height: 100 }
                })
            ],
            inertia: true
        })
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'body',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                    
                    target.style.zIndex = '1000';
                },
                end(event) {
                    event.target.style.zIndex = '1';

                    const imageId = event.target.querySelector('textarea').dataset.imageId;
                    if (imageId) {
                        saveImagePosition(imageId, event.target);
                    }
                }
            }
        }
    );
}

async function saveImagePosition(imageId, element) {
    try {
        const x = parseFloat(element.getAttribute('data-x')) || 0;
        const y = parseFloat(element.getAttribute('data-y')) || 0;
        const width = parseFloat(element.style.width) || 500;
        const height = parseFloat(element.style.height) || 281;
        
        const position = { x, y, width, height };
        
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


async function deleteImage(imageId) {
    try {
        const response = await fetch('/image/delete', {
            method: 'DELETE',
            headers: {'Content-Type':'application/json'},
            credentials: "include",
            body: JSON.stringify({imageId})
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
            
            const x = image.position?.x || 0;
            const y = image.position?.y || 0;
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
            deleteButton.addEventListener('click', function() {
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

function updateAddNotesButton() {
    const globalAddNotesButton = document.getElementById('globalAddNotesButton');
    const categoryItems = document.querySelectorAll('.category-item')

    if (categoryItems.length > 0) {
        globalAddNotesButton.style.display = 'block'; 
        globalAddNotesButton.dataset.categoryId = selectedCategoryId;
    } else {
        globalAddNotesButton.style.display = 'none';  
    }
}

function updateAddImageButton() {
    const globalAddImageButton = document.getElementById('globalAddImageButton');
    const categoryItems = document.querySelectorAll('.category-item');

    if (categoryItems.length > 0) {
        globalAddImageButton.style.display = 'block'; 
        globalAddImageButton.dataset.categoryId = selectedCategoryId;
    } else {
        globalAddImageButton.style.display = 'none';  
    }
}

window.onload = function() {
    getUsername();
    getCategory();
    updateAddNotesButton();
    updateAddImageButton();
};


