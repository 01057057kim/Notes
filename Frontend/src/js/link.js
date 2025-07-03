const BASE_URL = location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://notenest-pm5q.onrender.com";

interact('.link-section.resize-drag')
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
                const linkId = event.target.getAttribute('data-link-id');
                if (linkId) {
                    saveLinkPosition(linkId, event.target);
                }
            }
        },
        modifiers: [
            interact.modifiers.restrictSize({
                min: { width: 400, height: 100 },
                max: { width: 600, height: 100 }
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

                const linkId = event.target.getAttribute('data-link-id');
                if (linkId) {
                    saveLinkPosition(linkId, event.target);
                }
            }
        }
    });

document.getElementById('globalAddLinkButton').addEventListener('click', async function (event) {
    const categoryId = selectedCategoryId || event.target.dataset.categoryId;
    const link = `Add your Link here...`;

    const uniqueId = Date.now();
    const uniqueLink = link + '\u200B'.repeat(uniqueId % 1000);

    try {
        const response = await fetch(window.BASE_URL + '/link/createlink', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                content: uniqueLink,
                completed: false,
                categoryId
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('link success');
            getLink(categoryId);
        } else {
            ntf('Failed to add link: ' + data.message, 'error');
        }
    } catch (err) {
        console.error('Error:', err);
    }
});

async function getLink(categoryId) {
    try {
        const response = await fetch(window.BASE_URL + '/link/getlink?categoryId=' + categoryId, { credentials: 'include' });
        const data = await response.json();
        const linkContainer = document.getElementById(`link-${categoryId}`);

        if (linkContainer) {
            const existingLink = linkContainer.querySelectorAll('.link-section');
            existingLink.forEach(item => item.remove());
        }

        if (!data.success) {
            console.log('Error', data.message);
            return;
        }

        if (data.success) {
            console.log("Success get link data");
        } else {
            console.log("Error get link data");
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

window.getLink = getLink;

async function updateLinkText(linkId, newContent) {
    try {
        const response = await fetch(window.BASE_URL + '/link/updatelinktext', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ linkId, content: newContent })
        });

        const data = await response.json();
        if (data.success) {
            console.log('link text updated successfully');
        } else {
            console.error('Failed to update link text:', data.message);
        }
    } catch (err) {
        console.error('Error updating link text:', err);
    }
}

async function deleteLink(linkId) {
    try {
        const response = await fetch(window.BASE_URL + '/link/deletelink?linkId=' + linkId, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
            const linkElement = document.querySelector(`[data-link-id="${linkId}"]`);
            if (linkElement) {
                const container = linkElement.closest('.link-section');
                if (container) {
                    container.remove();
                } else {
                    linkElement.remove();
                }
                if (typeof updateMinimap === 'function') {
                    updateMinimap();
                }
            }
            console.log('Link deleted successfully');
        } else {
            console.error('Failed to delete link:', data.message);
            ntf('Failed to delete', 'error');
        }
    } catch (err) {
        console.error('Error deleting link:', err);
    }
}

async function saveLinkPosition(linkId, element) {
    try {
        const x = parseFloat(element.getAttribute('data-x')) || 0;
        const y = parseFloat(element.getAttribute('data-y')) || 0;
        const width = parseFloat(element.style.width);
        const height = parseFloat(element.style.height);

        const position = { x, y, width, height };

        const response = await fetch(window.BASE_URL + '/link/updatelinkposition', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ linkId, position })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Success update links position');
        } else {
            console.log('Failed update links position:', data.message);
        }
    } catch (err) {
        console.log('Update links failed:', err);
    }
}

function updateLinkPositioning() {
    window.saveLinkPosition = async function (linkId, element) {
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

            const response = await fetch(window.BASE_URL + '/link/updatelinkposition', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ linkId, position })
            });

            const data = await response.json();
            if (data.success) {
                console.log('success update link position');
            } else {
                console.log('failed update link position:', data.message);
            }
        } catch (err) {
            console.log('update link failed:', err);
        }
    }

    window.updateLinkPositioning = updateLinkPositioning;
}

function adjustLinkPositioning() {
    window.originalGetLink = window.getLink;
    window.getLink = async function (categoryId) {
        try {
            const response = await fetch(window.BASE_URL + '/link/getlink?categoryId=' + categoryId, { credentials: 'include' });
            const data = await response.json();
            const linkContainer = document.getElementById(`links-${categoryId}`);

            if (linkContainer) {
                const linkSections = linkContainer.querySelectorAll('.link-section');
                linkSections.forEach(section => section.remove());
            }

            if (!data.success) {
                console.log('Error', data.message);
                return;
            }

            data.link.forEach(function (links) {
                const linkElement = document.createElement('section');
                const isNewLink = !links.position || (!links.position.canvasX && !links.position.x);
                let x, y;

                if (isNewLink) {
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
                    x = links.position?.canvasX || links.position?.x || 0;
                    y = links.position?.canvasY || links.position?.y || 0;
                }

                const positionStyle = `style="width: ${links.position?.width || 400}px; height: ${links.position?.height || 100}px; transform: translate(${x}px, ${y}px);"`;
                const positionData = `data-x="${x}" data-y="${y}"`;

                linkElement.innerHTML = `
                     <section class="link-section resize-drag" ${positionStyle} ${positionData} data-link-id="${links._id}">
                        <a href="${links.content}" class="editable-link" contenteditable="true" id="editableLink-${links._id}" data-link-id="${links._id}">${links.content}</a>
                        <button class="delete-link-button" onClick="deleteLink('${links._id}')">Delete Link</button>
                    </section>
                `;

                linkContainer.appendChild(linkElement);

                const editableLink = linkElement.querySelector(`#editableLink-${links._id}`);
                if (editableLink) {
                    editableLink.addEventListener('click', function(event) {
                        event.preventDefault();
                        this.contentEditable = "true";
                        this.focus();
                    });
                    
                    editableLink.addEventListener('contextmenu', function(event) {
                        event.preventDefault(); 
                        const url = this.getAttribute('data-href');
                        if (url) {
                            window.open(url, '_blank');
                        }
                    });
                    
                    editableLink.addEventListener('blur', function() {
                        this.contentEditable = "false";
                        const newContent = this.textContent;
                        this.setAttribute('data-href', newContent);
                        updateLinkText(links._id, newContent);
                    });
                    
                    editableLink.addEventListener('keydown', function(event) {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            this.contentEditable = "false";
                            const newContent = this.textContent;
                            this.setAttribute('data-href', newContent);
                            updateLinkText(links._id, newContent);
                            this.blur();
                        }
                    });
                }
            });
        } catch (err) {
            console.log("Error: ", err);
        }
    };
}

