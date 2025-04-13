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