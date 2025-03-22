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
        
        let currentTheme = themes[0];
        
        const loadedBgColor = noteSection.style.backgroundColor;
        const loadedTitleColor = titleTextarea.style.color;
        const loadedContentColor = contentTextarea.style.color;
        const loadedTitleFont = titleTextarea.style.fontFamily;
        const loadedContentFont = contentTextarea.style.fontFamily;
        const loadedTitleSize = titleTextarea.style.fontSize;
        const loadedContentSize = contentTextarea.style.fontSize;
        
        if (loadedBgColor) {
            currentTheme = {
                bgColor: rgbToHex(loadedBgColor) || '#ffffff',
                secondaryBgColor: rgbToHex(titleTextarea.style.backgroundColor) || '#ffffff',
                titleColor: rgbToHex(loadedTitleColor) || '#333333',
                contentColor: rgbToHex(loadedContentColor) || '#555555',
                titleFont: loadedTitleFont || 'Arial',
                contentFont: loadedContentFont || 'Arial',
                titleSize: loadedTitleSize || '18px',
                contentSize: loadedContentSize || '15px'
            };
        }
        
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
                saveThemeToDatabase(noteId, theme);
            });
            
            themeSelector.appendChild(option);
        });
        
        const titleSizeControl = createFontSizeControl('Title Size:', titleTextarea, noteId);
        const contentSizeControl = createFontSizeControl('Content Size:', contentTextarea, noteId);
        
        const titleColorControl = createColorControl('Title Color:', titleTextarea, 'color', currentTheme.titleColor || '#333333', noteId);
        const contentColorControl = createColorControl('Content Color:', contentTextarea, 'color', currentTheme.contentColor || '#555555', noteId);
        const bgColorControl = createBgColorControl('Background:', noteSection, titleTextarea, contentTextarea, currentTheme.bgColor || '#ffffff', noteId);
        
        const fontSelector = createFontSelector(titleTextarea, contentTextarea, currentTheme.contentFont || 'Arial', noteId);
        
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

    function createFontSizeControl(label, textarea, noteId) {
        const sizeControl = document.createElement('div');
        sizeControl.className = 'font-size-control';
        
        const labelElem = document.createElement('span');
        labelElem.textContent = label;
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.textContent = '-';
        decreaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeFontSize(textarea, -1);
            saveStyleToDatabase(noteId, textarea, 'fontSize');
        });
        
        const increaseBtn = document.createElement('button');
        increaseBtn.textContent = '+';
        increaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeFontSize(textarea, 1);
            saveStyleToDatabase(noteId, textarea, 'fontSize');
        });
        
        sizeControl.appendChild(labelElem);
        sizeControl.appendChild(decreaseBtn);
        sizeControl.appendChild(increaseBtn);
        
        return sizeControl;
    }

    function createColorControl(label, element, property, initialValue, noteId) {
        const colorControl = document.createElement('div');
        colorControl.className = 'color-control';
        
        const colorLabel = document.createElement('span');
        colorLabel.textContent = label;
        
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'color-input';
        colorInput.value = initialValue;
        
        colorInput.addEventListener('input', (e) => {
            element.style[property] = e.target.value;
            saveStyleToDatabase(noteId, element, property);
        });
        
        colorControl.appendChild(colorLabel);
        colorControl.appendChild(colorInput);
        
        return colorControl;
    }

    function createBgColorControl(label, noteSection, titleEl, contentEl, initialValue, noteId) {
        const bgColorControl = document.createElement('div');
        bgColorControl.className = 'color-control';
        
        const bgColorLabel = document.createElement('span');
        bgColorLabel.textContent = label;
        
        const bgColorInput = document.createElement('input');
        bgColorInput.type = 'color';
        bgColorInput.className = 'color-input';
        bgColorInput.value = initialValue;
        
        bgColorInput.addEventListener('input', (e) => {
            noteSection.style.backgroundColor = e.target.value;
            const secondaryColor = lightenColor(e.target.value, 15);
            titleEl.style.backgroundColor = secondaryColor;
            contentEl.style.backgroundColor = secondaryColor;
            
            const theme = {
                bgColor: e.target.value,
                secondaryBgColor: secondaryColor
            };
            
            saveThemeToDatabase(noteId, theme);
        });
        
        bgColorControl.appendChild(bgColorLabel);
        bgColorControl.appendChild(bgColorInput);
        
        return bgColorControl;
    }

    function createFontSelector(titleEl, contentEl, initialValue, noteId) {
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
        fontSelector.value = initialValue;
        
        fontSelector.addEventListener('change', (e) => {
            const selectedFont = e.target.value;
            titleEl.style.fontFamily = selectedFont;
            contentEl.style.fontFamily = selectedFont;
            
            saveThemeToDatabase(noteId, {
                titleFont: selectedFont,
                contentFont: selectedFont
            });
        });
        
        return fontSelector;
    }

    function saveStyleToDatabase(noteId, element, property) {
        const theme = {};
        
        if (element.classList.contains('updateLiveTitle')) {
            if (property === 'color') theme.titleColor = element.style[property];
            if (property === 'fontSize') theme.titleSize = element.style[property];
            if (property === 'fontFamily') theme.titleFont = element.style[property];
        } else if (element.classList.contains('updateLiveContent')) {
            if (property === 'color') theme.contentColor = element.style[property];
            if (property === 'fontSize') theme.contentSize = element.style[property];
            if (property === 'fontFamily') theme.contentFont = element.style[property];
        }
        
        saveThemeToDatabase(noteId, theme);
    }

    async function saveThemeToDatabase(noteId, theme) {
        try {
            const response = await fetch('/notes/updatenotestheme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ noteId, theme })
            });
    
            const data = await response.json();
            if (data.success) {
                console.log('Successfully updated note theme');
            } else {
                console.error('Failed to update theme:', data.message);
            }
        } catch (err) {
            console.error('Theme update failed:', err);
        }
    }

    function darkenColor(color, percent) {
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        
        r = Math.max(0, Math.floor(r * (100 - percent) / 100));
        g = Math.max(0, Math.floor(g * (100 - percent) / 100));
        b = Math.max(0, Math.floor(b * (100 - percent) / 100));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function lightenColor(color, percent) {
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
        g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
        b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function rgbToHex(rgbStr) {
        if (!rgbStr) return null;
        
        if (rgbStr.startsWith('#')) return rgbStr;
        
        const rgbMatch = rgbStr.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!rgbMatch) return null;
        
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function applyTheme(noteSection, theme) {
        const titleTextarea = noteSection.querySelector('.updateLiveTitle');
        const contentTextarea = noteSection.querySelector('.updateLiveContent');
        const noteId = titleTextarea.dataset.noteId;
        
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
        
        saveThemeToDatabase(noteId, theme);
    }

    function changeFontSize(textarea, delta) {
        const currentSize = parseInt(window.getComputedStyle(textarea).fontSize) || 14;
        const newSize = Math.max(10, Math.min(24, currentSize + delta));
        textarea.style.fontSize = `${newSize}px`;
    }
}


document.addEventListener('DOMContentLoaded', function () {
    setupCustomThemes();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupCustomThemes();
}