function setupCustomThemes() {
    const themes = [
        { name: 'Default', bgColor: '#ffffff', secondaryBgColor: '#ffffff', titleColor: '#333333', contentColor: '#555555', titleFont: 'Arial', contentFont: 'Arial', titleSize: '18px', contentSize: '15px' },
        { name: 'Ocean', bgColor: '#80CBC4', secondaryBgColor: '#B4EBE6', titleColor: '#0066cc', contentColor: '#333333', titleFont: 'Trebuchet MS', contentFont: 'Verdana', titleSize: '18px', contentSize: '15px' },
        { name: 'Sunset', bgColor: '#FFB4A2', secondaryBgColor: '#FFCDB2', titleColor: '#cc6600', contentColor: '#663300', titleFont: 'Georgia', contentFont: 'Palatino', titleSize: '18px', contentSize: '15px' },
        { name: 'Forest', bgColor: '#89AC46', secondaryBgColor: '#D3E671', titleColor: '#006600', contentColor: '#333333', titleFont: 'Cambria', contentFont: 'Calibri', titleSize: '18px', contentSize: '15px' },
        { name: 'Lavender', bgColor: '#D17D98', secondaryBgColor: '#F4CCE9', titleColor: '#660099', contentColor: '#333333', titleFont: 'Segoe UI', contentFont: 'Tahoma', titleSize: '18px', contentSize: '15px' },
        { name: 'Minimal', bgColor: '#ADB2D4', secondaryBgColor: '#C7D9DD', titleColor: '#222222', contentColor: '#444444', titleFont: 'Helvetica', contentFont: 'Helvetica', titleSize: '18px', contentSize: '15px' },
        { name: 'Vibrant', bgColor: '#FFD18E', secondaryBgColor: '#E9FF97', titleColor: '#ff6600', contentColor: '#333333', titleFont: 'Comic Sans MS', contentFont: 'Arial', titleSize: '18px', contentSize: '15px' },
        { name: 'Sleek', bgColor: '#FDB7EA', secondaryBgColor: '#FFDCCC', titleColor: '#222222', contentColor: '#444444', titleFont: 'Century Gothic', contentFont: 'Century Gothic', titleSize: '18px', contentSize: '15px' }
    ];


    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'custom') {
            const noteSection = event.target.closest('.note-section');
            
            const openSelectors = document.querySelectorAll('.theme-selector');
            openSelectors.forEach(selector => {
                if (selector.parentNode !== noteSection) {
                    selector.remove();
                }
            });
            
            const existingSelector = noteSection.querySelector('.theme-selector');
            if (existingSelector) {
                existingSelector.remove();
                return;
            }
            
            createThemeSelector(noteSection);
        } else if (!event.target.closest('.theme-selector') && !event.target.closest('#custom')) {
            const selectors = document.querySelectorAll('.theme-selector');
            selectors.forEach(selector => selector.remove());
        }
    });

    function createThemeSelector(noteSection) {
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        
        const titleTextarea = noteSection.querySelector('.updateLiveTitle');
        const contentTextarea = noteSection.querySelector('.updateLiveContent');
        
        const noteId = titleTextarea.dataset.noteId;
        const currentTheme = getNoteTheme(noteId) || themes[0];
        
        themes.forEach(theme => {
            const option = document.createElement('div');
            option.className = 'theme-option';
            
            const colorPreview = document.createElement('div');
            colorPreview.className = 'theme-color-preview';
            colorPreview.style.backgroundColor = theme.bgColor;
            colorPreview.style.border = `1px solid ${theme.secondaryBgColor}`;
            
            const themeName = document.createElement('span');
            themeName.textContent = theme.name;
            
            option.appendChild(colorPreview);
            option.appendChild(themeName);
            
            option.addEventListener('click', () => {
                applyTheme(noteSection, theme);
                saveNoteTheme(titleTextarea.dataset.noteId, theme);
            });
            
            themeSelector.appendChild(option);
        });
        
        const titleSizeControl = document.createElement('div');
        titleSizeControl.className = 'font-size-control';
        
        const titleLabel = document.createElement('span');
        titleLabel.textContent = 'Title Size:';
        
        const decreaseTitleBtn = document.createElement('button');
        decreaseTitleBtn.textContent = '-';
        decreaseTitleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeFontSize(titleTextarea, -1);
        });
        
        const increaseTitleBtn = document.createElement('button');
        increaseTitleBtn.textContent = '+';
        increaseTitleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeFontSize(titleTextarea, 1);
        });
        
        titleSizeControl.appendChild(titleLabel);
        titleSizeControl.appendChild(decreaseTitleBtn);
        titleSizeControl.appendChild(increaseTitleBtn);
        
        const contentSizeControl = document.createElement('div');
        contentSizeControl.className = 'font-size-control';
        
        const contentLabel = document.createElement('span');
        contentLabel.textContent = 'Content Size:';
        
        const decreaseContentBtn = document.createElement('button');
        decreaseContentBtn.textContent = '-';
        decreaseContentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeFontSize(contentTextarea, -1);
        });
        
        const increaseContentBtn = document.createElement('button');
        increaseContentBtn.textContent = '+';
        increaseContentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeFontSize(contentTextarea, 1);
        });
        
        contentSizeControl.appendChild(contentLabel);
        contentSizeControl.appendChild(decreaseContentBtn);
        contentSizeControl.appendChild(increaseContentBtn);
        
        const titleColorControl = document.createElement('div');
        titleColorControl.className = 'color-control';
        
        const titleColorLabel = document.createElement('span');
        titleColorLabel.textContent = 'Title Color:';
        
        const titleColorInput = document.createElement('input');
        titleColorInput.type = 'color';
        titleColorInput.className = 'color-input';
        titleColorInput.value = currentTheme.titleColor || '#333333';
        
        titleColorInput.addEventListener('input', (e) => {
            titleTextarea.style.color = e.target.value;
            
            const noteId = titleTextarea.dataset.noteId;
            const currentTheme = getNoteTheme(noteId) || themes[0];
            currentTheme.titleColor = e.target.value;
            saveNoteTheme(noteId, currentTheme);
        });
        
        titleColorControl.appendChild(titleColorLabel);
        titleColorControl.appendChild(titleColorInput);
        
        const contentColorControl = document.createElement('div');
        contentColorControl.className = 'color-control';
        
        const contentColorLabel = document.createElement('span');
        contentColorLabel.textContent = 'Content Color:';
        
        const contentColorInput = document.createElement('input');
        contentColorInput.type = 'color';
        contentColorInput.className = 'color-input';
        contentColorInput.value = currentTheme.contentColor || '#555555';
        
        contentColorInput.addEventListener('input', (e) => {
            contentTextarea.style.color = e.target.value;
            
            const noteId = titleTextarea.dataset.noteId;
            const currentTheme = getNoteTheme(noteId) || themes[0];
            currentTheme.contentColor = e.target.value;
            saveNoteTheme(noteId, currentTheme);
        });
        
        contentColorControl.appendChild(contentColorLabel);
        contentColorControl.appendChild(contentColorInput);
        
        const bgColorControl = document.createElement('div');
        bgColorControl.className = 'color-control';
        
        const bgColorLabel = document.createElement('span');
        bgColorLabel.textContent = 'Background:';
        
        const bgColorInput = document.createElement('input');
        bgColorInput.type = 'color';
        bgColorInput.className = 'color-input';
        bgColorInput.value = currentTheme.bgColor || '#ffffff';
        
        bgColorInput.addEventListener('input', (e) => {
            noteSection.style.backgroundColor = e.target.value;
            
            const noteId = titleTextarea.dataset.noteId;
            const currentTheme = getNoteTheme(noteId) || themes[0];
            currentTheme.bgColor = e.target.value;
            
            const secondaryColor = lightenColor(e.target.value, 15);
            currentTheme.secondaryBgColor = secondaryColor;
            
            titleTextarea.style.backgroundColor = secondaryColor;
            contentTextarea.style.backgroundColor = secondaryColor;
            
            saveNoteTheme(noteId, currentTheme);
        });
        
        bgColorControl.appendChild(bgColorLabel);
        bgColorControl.appendChild(bgColorInput);
        
        const fontSelector = document.createElement('select');
        fontSelector.className = 'custom-font-selector';
        
        const fonts = [
            'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New', 
            'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Tahoma', 
            'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS'
        ];
        
        const fontOptGroup = document.createElement('optgroup');
        fontOptGroup.label = 'Select Font';
        
        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            option.style.fontFamily = font;
            fontOptGroup.appendChild(option);
        });
        
        fontSelector.appendChild(fontOptGroup);
        fontSelector.value = currentTheme.contentFont || 'Arial';
        
        fontSelector.addEventListener('change', (e) => {
            const selectedFont = e.target.value;
            titleTextarea.style.fontFamily = selectedFont;
            contentTextarea.style.fontFamily = selectedFont;
            
            const noteId = titleTextarea.dataset.noteId;
            const currentTheme = getNoteTheme(noteId) || themes[0];
            currentTheme.titleFont = selectedFont;
            currentTheme.contentFont = selectedFont;
            saveNoteTheme(noteId, currentTheme);
        });
        
        themeSelector.appendChild(titleSizeControl);
        themeSelector.appendChild(contentSizeControl);
        themeSelector.appendChild(titleColorControl);
        themeSelector.appendChild(contentColorControl);
        themeSelector.appendChild(bgColorControl);
        themeSelector.appendChild(fontSelector);
        
        noteSection.appendChild(themeSelector);
        
        setTimeout(() => {
            themeSelector.style.display = 'block';
        }, 10);
    }
     // Darken
    function darkenColor(color, percent) {
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        
        r = Math.max(0, Math.floor(r * (100 - percent) / 100));
        g = Math.max(0, Math.floor(g * (100 - percent) / 100));
        b = Math.max(0, Math.floor(b * (100 - percent) / 100));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    // Lighten
    function lightenColor(color, percent) {
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
        g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
        b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function applyTheme(noteSection, theme) {
        const titleTextarea = noteSection.querySelector('.updateLiveTitle');
        const contentTextarea = noteSection.querySelector('.updateLiveContent');
        
        noteSection.classList.add('theme-applied');
        noteSection.style.backgroundColor = theme.bgColor;
        
        titleTextarea.style.color = theme.titleColor;
        contentTextarea.style.color = theme.contentColor;

        titleTextarea.style.backgroundColor = theme.secondaryBgColor;
        contentTextarea.style.backgroundColor = theme.secondaryBgColor;
        

        titleTextarea.style.fontFamily = theme.titleFont;
        contentTextarea.style.fontFamily = theme.contentFont;
        
        titleTextarea.style.fontSize = theme.titleSize;
        contentTextarea.style.fontSize = theme.contentSize;

        const fontSelector = noteSection.querySelector('.custom-font-selector');
        if (fontSelector) {
            fontSelector.value = theme.contentFont;
        }
        
        const titleColorInput = noteSection.querySelector('.color-control:nth-of-type(1) .color-input');
        if (titleColorInput) {
            titleColorInput.value = theme.titleColor;
        }
        
        const contentColorInput = noteSection.querySelector('.color-control:nth-of-type(2) .color-input');
        if (contentColorInput) {
            contentColorInput.value = theme.contentColor;
        }
        
        const bgColorInput = noteSection.querySelector('.color-control:nth-of-type(3) .color-input');
        if (bgColorInput) {
            bgColorInput.value = theme.bgColor;
        }
    }

    function changeFontSize(textarea, delta) {
        const currentSize = parseInt(window.getComputedStyle(textarea).fontSize) || 14;
        const newSize = Math.max(10, Math.min(24, currentSize + delta));
        textarea.style.fontSize = `${newSize}px`;
        
        const noteId = textarea.dataset.noteId;
        const currentTheme = getNoteTheme(noteId) || themes[0];
        
        if (textarea.classList.contains('updateLiveTitle')) {
            currentTheme.titleSize = `${newSize}px`;
        } else if (textarea.classList.contains('updateLiveContent')) {
            currentTheme.contentSize = `${newSize}px`;
        }
        
        saveNoteTheme(noteId, currentTheme);
    }
    
    // need cahnge to databse
    function saveNoteTheme(noteId, theme) {
        const noteThemes = JSON.parse(localStorage.getItem('noteThemes') || '{}');
        noteThemes[noteId] = theme;
        localStorage.setItem('noteThemes', JSON.stringify(noteThemes));
    }

    function getNoteTheme(noteId) {
        const noteThemes = JSON.parse(localStorage.getItem('noteThemes') || '{}');
        return noteThemes[noteId];
    }

    function applyThemesToExistingNotes() {
        const noteSections = document.querySelectorAll('.note-section');
        noteSections.forEach(noteSection => {
            const titleTextarea = noteSection.querySelector('.updateLiveTitle');
            if (titleTextarea) {
                const noteId = titleTextarea.dataset.noteId;
                const savedTheme = getNoteTheme(noteId);
                if (savedTheme) {
                    applyTheme(noteSection, savedTheme);
                }
            }
        });
    }

    const originalGetNotes = window.getNotes;
    window.getNotes = async function(categoryId) {
        await originalGetNotes(categoryId);
        setTimeout(applyThemesToExistingNotes, 100);
    };

    setTimeout(applyThemesToExistingNotes, 500);

    const originalAddNote = window.addNote;
    window.addNote = async function(categoryId) {
        await originalAddNote(categoryId);
        setTimeout(() => {
            const newNotes = document.querySelectorAll('.note-section');
            newNotes.forEach(noteSection => {
                const titleTextarea = noteSection.querySelector('.updateLiveTitle');
                if (titleTextarea && !titleTextarea.style.fontFamily) {
                    applyTheme(noteSection, themes[0]);
                }
            });
        }, 300);
    };
}

document.addEventListener('DOMContentLoaded', function () {
    setupCustomThemes();
})

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupCustomThemes();
}