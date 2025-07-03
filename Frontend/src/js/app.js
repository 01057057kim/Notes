
const BASE_URL = location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://notenest-pm5q.onrender.com";

let selectedCategoryId = null;
const signOutElements = document.querySelectorAll('.signOut');
signOutElements.forEach(function (element) {
    element.addEventListener('click', async function () {
        try {
            const response = await fetch(`${BASE_URL}/account/signout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                localStorage.clear();
                window.location.replace('/index.html');
            }
        } catch (error) {
            console.log('Error:', error);
        }
    })
})

async function getUsername() {
    try {
        const response = await fetch('/account/getusername')
        const data = await response.json()

        if (data.success) {
            document.getElementById('usernameLabel').innerHTML = `Welcome <em><b>${data.username}</b></em>`
        } else {
            console.log('Username Invalid', error);
        }

    } catch (error) {
        console.log('Username Invalid', error);
    }
}

document.getElementById('newCategory').addEventListener('click', async function () {
    const categoryName = 'Add your Category here...';
    const uniqueId = Date.now();
    const uniqueCategoryName = categoryName + '\u200B'.repeat(uniqueId % 1000);
    try {
        const response = await fetch(`${BASE_URL}/category/createcategory`, {
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
        if (data.success) {
            console.log('Category created');

            const toolSidebar = document.getElementById('tool-sidebar');
            if (toolSidebar) {
                toolSidebar.classList.remove('hidden');
                toolSidebarVisible = true;

                const search = document.getElementById('search-container');
                const searchResults = document.getElementById('search-results');
                if (search) search.style.right = '150px';
                if (searchResults) searchResults.style.right = '150px';
                
                const toolToggleBtn = document.querySelector('#toolToggleSidebar button');
                if (toolToggleBtn) toolToggleBtn.innerHTML = '→';
            }
  
            const categoriesData = await getCategory();
            
            if (categoriesData && categoriesData.categories && categoriesData.categories.length > 0) {
                const newCategory = categoriesData.categories.find(cat =>
                    cat.categoryName === uniqueCategoryName);
                
                if (newCategory) {
                    selectedCategoryId = newCategory._id;
                    
                    const allContainers = document.querySelectorAll('.notes-container, .todos-container, .link-container');
                    allContainers.forEach(container => {
                        container.style.display = 'none';
                    });

                    const selectedNotesContainer = document.getElementById(`notes-${selectedCategoryId}`);
                    if (selectedNotesContainer) {
                        selectedNotesContainer.style.display = 'block';
                    }
                    
                    const selectedTodosContainer = document.getElementById(`todos-${selectedCategoryId}`);
                    if (selectedTodosContainer) {
                        selectedTodosContainer.style.display = 'block';
                    }

                    const selectedLinkContainer = document.getElementById(`links-${selectedCategoryId}`);
                    if (selectedLinkContainer) {
                        selectedLinkContainer.style.display = 'block';
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
                    hiddenTool();
                }
            }
        } else {
            ntf(data.message, 'error');
        }
    } catch (error) {
        console.log('Error create category', error);
        ntf('Error creating category', 'error');
    }
});

async function getCategory() {
    try {
        const response = await fetch('/category/getcategory', { credentials: 'include' });
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

        data.categories.forEach(function (category) {
            const categoryElement = document.createElement('section');
            categoryElement.className = 'category-item';
            categoryElement.innerHTML = `
                <textarea class="updateLiveCategoryName" data-category-id="${category._id}">${category.categoryName}</textarea>
                <button class="deleteCategory" onClick="deleteCategory('${category._id}')">Delete</button> </br>
                <button class="select" data-category-id="${category._id}">Select</button>
            `;
            postSection.appendChild(categoryElement);

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
            const todosContainer = document.createElement('section');
            todosContainer.id = `todos-${category._id}`;
            todosContainer.className = 'todos-container';
            todosContainer.style.display = category._id === selectedCategoryId ? 'block' : 'none';
            notePostsSection.appendChild(todosContainer);
            getTodos(category._id);

            const linkContainer = document.createElement('section');
            linkContainer.id = `links-${category._id}`;
            linkContainer.className = 'link-container';
            linkContainer.style.display = category._id === selectedCategoryId ? 'block' : 'none';
            notePostsSection.appendChild(linkContainer);
            getLink(category._id);
            
            const notesContainer = document.createElement('section');
            notesContainer.id = `notes-${category._id}`;
            notesContainer.className = 'notes-container';
            notesContainer.style.display = category._id === selectedCategoryId ? 'block' : 'none';
            notePostsSection.appendChild(notesContainer);
            getNotes(category._id);

            

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const textarea = categoryElement.querySelector('.updateLiveCategoryName');
            textarea.addEventListener('input', (event) => {
                const newValue = event.target.value;
                const categoryId = event.target.dataset.categoryId;
                updateCategory(categoryId, newValue);
            });

            const selectButton = categoryElement.querySelector('.select');
            selectButton.addEventListener('click', () => {
                selectedCategoryId = category._id;
                document.querySelectorAll('.category-item').forEach(item => item.classList.remove('selected'));
                categoryElement.classList.add('selected');

                document.querySelectorAll('.notes-container, .todos-container, .link-container').forEach(container => {
                    container.style.display = 'none';
                });

                const selectedNotesContainer = document.getElementById(`notes-${category._id}`);
                if (selectedNotesContainer) {
                    selectedNotesContainer.style.display = 'block';
                }
                
                const selectedTodosContainer = document.getElementById(`todos-${category._id}`);
                if (selectedTodosContainer) {
                    selectedTodosContainer.style.display = 'block';
                }

                const selectedLinkContainer = document.getElementById(`links-${category._id}`);
                if (selectedLinkContainer) {
                    selectedLinkContainer.style.display = 'block';
                }
                
                hiddenTool();

                loadImagesForCategory(category._id);
            });;
        });

        const selectedCategory = document.querySelector(`.updateLiveCategoryName[data-category-id="${selectedCategoryId}"]`);
        if (selectedCategory) {
            selectedCategory.closest('.category-item').classList.add('selected');
        }

        hiddenTool();

        if (selectedCategoryId) {
            loadImagesForCategory(selectedCategoryId);
        }

        return data;
    } catch (err) {
        console.log('Error fetching categories:', err);
        return null;
    }
}

async function deleteCategory(id) {
    try {
        const response = await fetch('/category/deletecategory', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify({ id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await getCategory(); 
            const remainingCategories = document.querySelectorAll('.category-item');
            
            if (remainingCategories.length > 0) {
                if (selectedCategoryId === id) {
                    const firstCategory = remainingCategories[0];
                    const newCategoryId = firstCategory.querySelector('.updateLiveCategoryName').dataset.categoryId;
                    selectedCategoryId = newCategoryId;
                    firstCategory.classList.add('selected');
                    
                    const allContainers = document.querySelectorAll('.notes-container, .todos-container, .link-container');
                    allContainers.forEach(container => {
                        container.style.display = 'none';
                    });
                    
                    const selectedNotesContainer = document.getElementById(`notes-${selectedCategoryId}`);
                    const selectedTodosContainer = document.getElementById(`todos-${selectedCategoryId}`);
                    const selectedLinkContainer = document.getElementById(`links-${selectedCategoryId}`);

                    if (selectedNotesContainer) selectedNotesContainer.style.display = 'block';
                    if (selectedTodosContainer) selectedTodosContainer.style.display = 'block';
                    if (selectedLinkContainer) selectedLinkContainer.style.display = 'block';
                }
            }
            
            hiddenTool();
        } else {
            ntf('Failed to delete', 'error');
            console.log(data.message);
        }
    } catch (err) {
        console.log('Error:', err);
        ntf('Error deleting category', 'error');
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

document.addEventListener('click', function (event) {
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

        const allTodoContainers = document.querySelectorAll('.todos-container');
        allTodoContainers.forEach(container => {
            container.style.display = 'none';
        });

        const allLinkContainers = document.querySelectorAll('.link-container');
        allLinkContainers.forEach(container => {
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

        const selectedLinkContainer = document.getElementById(`links-${categoryId}`);
        if (selectedLinkContainer) {
            selectedLinkContainer.style.display = 'block';
        }

        const allCategoryItems = document.querySelectorAll('.category-item');
        allCategoryItems.forEach(item => {
            item.classList.remove('selected');
        });
        categoryItem.classList.add('selected');

        hiddenTool();

        loadImagesForCategory(categoryId);
    }
});



function hiddenTool() {
    const globaltool = document.getElementById('tool');
    const toggle = document.getElementById('toolToggleSidebar');
    const categoryItems = document.querySelectorAll('.category-item');
    const search = document.getElementById('search-container');
    const searchResults = document.getElementById('search-results');
    const toolSidebar = document.getElementById('tool-sidebar');
    
    if (categoryItems.length > 0) {
        globaltool.style.display = 'block';
        toggle.style.display = 'block';
        search.style.display = 'flex';
        globaltool.dataset.categoryId = selectedCategoryId;
        

        if (toolSidebar) {
            toolSidebar.classList.remove('hidden');
            toolSidebarVisible = true;
            
            const toolToggleBtn = toggle.querySelector('button');
            if (toolToggleBtn) {
                toolToggleBtn.innerHTML = '→';
            }
            
            search.style.right = '150px';
            searchResults.style.right = '150px';
        }
    } else {
        globaltool.style.display = 'none';
        toggle.style.display = 'none';
        search.style.display = 'none';
        searchResults.style.display = 'none';
    }
    
    search.style.transition = 'right 0.3s ease';
    searchResults.style.transition = 'right 0.3s ease';
}


async function getUsernameVerified() {
    try {
        const response = await fetch('/account/getusernameverified');
        const data = await response.json();

        if (data.success) {
            document.getElementById('usernameVerified').innerHTML = `
            <div class="setting-info">
                <div class="info">
                    <label>Username</label><br>
                    <label>Email</label><br>
                    <label>Password</label><br>
                    <label>Verified</label><br>
                </div>
                <div class="data">
                    : <em><b>${data.username}</b></em><br>
                    : <em>${data.email || 'Not available'}</em><br>
                    : <span class="password-field">
                        <span>••••••••</span>
                        <button id="changePassword" class="btn-small">Change</button>
                      </span><br>
                    : <span class="${data.isVerified ? 'verified-badge' : 'unverified-badge'}">
                        ${data.isVerified ? 'Yes' : 'No'}</span>
                </div>
            </div>`; 

            document.getElementById('changePassword').addEventListener('click', openChangePasswordForm);
        } else {
            console.error('Error fetching user data:', data.message);
            document.getElementById('usernameVerified').innerHTML = `Error: ${data.message}`;
        }
    } catch (error) {
        console.error('Username fetch error:', error);
        document.getElementById('usernameVerified').innerHTML = `Error fetching user data`;
    }
}

function openChangePasswordForm() {
    const originalContent = document.getElementById('usernameVerified').innerHTML;
    const dialog = document.getElementById('dialog');

    dialog.querySelector('h2').textContent = 'Change Password';

    document.getElementById('usernameVerified').innerHTML = `
        <form id="changePasswordForm">
            <div class="newpassword-form">
                <div class="form-group-one">
                    <label for="currentPassword">Current Password</label><br>
                    <label for="newPassword">New Password</label><br>
                    <label for="confirmPassword">Confirm New Password</label>
                </div>
                <div class="form-group-two">
                    <input type="password" id="currentPassword" required><br>
                    <input type="password" id="newPassword" required><br>
                    <input type="password" id="confirmPassword" required>
                </div>
            </div>
            <div class="form-buttons">
                <button type="submit" class="btn-primary">Save Changes</button>
                <button type="button" class="btn-secondary" id="cancelPasswordChange">Cancel</button>
            </div>
        </form>
    `;

    document.querySelector('.deleteAccount-btn').style.display = 'none';

    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        try {
            const response = await fetch('/account/changepassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Password changed successfully!');
                restoreDialog();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Change password error:', error);
            alert('Failed to change password. Please try again.');
        }
    });

    document.getElementById('cancelPasswordChange').addEventListener('click', restoreDialog);

    function restoreDialog() {
        dialog.querySelector('h2').textContent = 'Setting';
        document.getElementById('usernameVerified').innerHTML = originalContent;
        document.querySelector('.deleteAccount-btn').style.display = 'block';

        setTimeout(() => {
            const changePasswordBtn = document.getElementById('changePassword');
            if (changePasswordBtn) {
                changePasswordBtn.addEventListener('click', openChangePasswordForm);
            }
        }, 0);
    }
}

document.getElementById('deleteAccount').addEventListener('click', async function () {
    try {
        const confirmation = confirm("Are you sure you want to delete your account? This action cannot be undone."); // need popup

        if (!confirmation) {
            return;
        }

        const response = await fetch('/account/deleteaccount', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            console.log(data.message);
            window.location.href = 'login.html';
        } else {
            ntf(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        ntf('Failed to delete account. Please try again later.', 'error');
    }
}
);


window.onload = function () {
    getUsernameVerified();
    getUsername();
    getCategory();
    hiddenTool();
};


