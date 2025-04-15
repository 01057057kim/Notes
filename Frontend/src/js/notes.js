interact('.note-section.resize-drag')
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
                const noteId = event.target.querySelector('textarea')?.dataset.noteId;
                if (noteId) {
                    saveNotePosition(noteId, event.target);
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

                const noteId = event.target.querySelector('textarea')?.dataset.noteId;
                if (noteId) {
                    saveNotePosition(noteId, event.target);
                }
            }
        }
    });

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
                categoryId
            })
        })

        const data = await response.json();
        if (data.success) {
            getNotes(categoryId)
        } else {
            ntf('Failed to add note: ' + data.message, 'error');
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
        if (data.success) {
            console.log("Success get note data")
        } else {
            console.log("Error get notes data")
        }
    } catch (err) {
        console.log("Error: ", err)
    }
}

async function deleteNotes(noteId) {
    try {
        const response = await fetch('/notes/deletenotes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify({ noteId })
        })
        const data = await response.json()
        if (data.success) {
            getCategory();
        } else {
            ntf('Failed to delete', 'error')
            console.log(err)
        }
    } catch (err) {
        console.log('Error:', err)
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

function setupSpeechRecognition() {
    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'speech') {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                ntf('Speech recognition is not supported in your browser.', 'error');
                return;
            }

            const noteSection = event.target.closest('.note-section');
            if (noteSection) {
                const contentTextarea = noteSection.querySelector('.updateLiveContent');
                if (contentTextarea) {
                    toggleSpeechRecognition(contentTextarea, event.target);
                }
            }
        }
    });
}

const recognitionInstances = {};

function toggleSpeechRecognition(contentTextarea, button) {
    const noteId = contentTextarea.getAttribute('data-note-id');

    if (recognitionInstances[noteId]) {
        recognitionInstances[noteId].stop();
        recognitionInstances[noteId] = null;
        button.textContent = 'Speech';
        button.classList.remove('recording');
        return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        ntf('Speech recognition is not supported in your browser.', 'error');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = contentTextarea.value || '';
    let cursorPosition = contentTextarea.selectionStart;

    button.textContent = 'Stop';
    button.classList.add('recording');

    recognitionInstances[noteId] = recognition;

    recognition.onresult = function (event) {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += ' ' + transcript;
                updateNotesContent(noteId, finalTranscript);
            } else {
                interimTranscript += transcript;
            }
        }

        const content = finalTranscript + interimTranscript;
        contentTextarea.value = content;

        contentTextarea.selectionStart = content.length;
        contentTextarea.selectionEnd = content.length;
    };

    recognition.onerror = function (event) {
        if (event.error === 'no-speech') {
            ntf('No speech was detected. Please try again.', 'info');
        } else {
            ntf('Speech recognition error: ' + event.error, 'error');
            console.error('Speech recognition error:', event.error);
        }
        button.textContent = 'Speech';
        button.classList.remove('recording');
        recognitionInstances[noteId] = null;
    };

    recognition.onend = function () {
        button.textContent = 'Speech';
        button.classList.remove('recording');
        recognitionInstances[noteId] = null;
    };

    try {
        recognition.start();
    } catch (error) {
        ntf('Error starting speech recognition: ' + error.message, 'error');
        console.error('Error starting speech recognition:', error);
        button.textContent = 'Speech';
        button.classList.remove('recording');
    }
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