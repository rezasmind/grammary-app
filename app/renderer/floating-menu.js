// Floating menu for text selection processing

class GrammaryFloatingMenu {
    constructor() {
        this.menu = null;
        this.toneSelector = null;
        this.selectedText = '';
        this.isInput = false;
        this.init();
    }

    init() {
        this.createMenu();
        this.lastSelection = '';
        
        // Listen for selection changes
        document.addEventListener('selectionchange', () => {
            // Use requestAnimationFrame to wait for selection to be complete
            requestAnimationFrame(() => this.handleSelection());
        });
        
        // Handle document clicks for menu hiding
        document.addEventListener('mousedown', (e) => {
            if (this.menu && 
                !this.menu.contains(e.target) && 
                !window.getSelection().toString().trim()) {
                this.hideMenu();
            }
        });

        // Prevent menu from closing when clicking inside it
        this.menu.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        // Handle scroll and resize events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (this.menu.style.display === 'block') {
                clearTimeout(scrollTimeout);
                // Hide immediately during scroll
                this.menu.style.opacity = '0';
                this.menu.style.transform = 'translateY(10px)';
                
                scrollTimeout = setTimeout(() => {
                    this.handleSelection();
                }, 150);
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (this.menu.style.display === 'block') {
                this.handleSelection();
            }
        }, { passive: true });
    }

    createMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'grammary-floating-menu';
        
        // Create button group
        this.buttonGroup = document.createElement('div');
        this.buttonGroup.className = 'button-group';
        this.menu.appendChild(this.buttonGroup);

        // Create tone selector
        this.toneSelector = document.createElement('div');
        this.toneSelector.className = 'grammary-tone-selector';
        const tones = ['رسمی', 'دوستانه', 'علمی', 'خلاقانه'];
        tones.forEach(tone => {
            const button = document.createElement('button');
            button.textContent = tone;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!button.disabled) {
                    this.handleToneSelection(tone);
                }
            });
            this.toneSelector.appendChild(button);
        });
        this.menu.appendChild(this.toneSelector);
        
        // Add to document
        document.body.appendChild(this.menu);
    }

    async handleSelection() {
        let selectedText = '';
        let rect;
        
        // Get the active element and selection
        const target = document.activeElement;
        const selection = window.getSelection();
        
        // Check if we're in an input/textarea/contenteditable
        this.isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || 
                       target.getAttribute('contenteditable') === 'true';

        if (this.isInput) {
            // Handle input/textarea selection
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                const start = target.selectionStart;
                const end = target.selectionEnd;
                
                if (typeof target.value !== 'undefined' && start !== end) {
                    selectedText = target.value.substring(start, end);
                    
                    // Create a temporary span to measure the text position
                    const span = document.createElement('span');
                    span.style.font = window.getComputedStyle(target).font;
                    span.style.position = 'absolute';
                    span.style.visibility = 'hidden';
                    span.textContent = target.value.substring(0, start);
                    document.body.appendChild(span);
                    
                    const inputRect = target.getBoundingClientRect();
                    const textWidth = span.offsetWidth;
                    const lineHeight = parseInt(window.getComputedStyle(target).lineHeight) || 20;
                    
                    // Calculate the position based on input's position and text measurements
                    rect = {
                        left: inputRect.left + Math.min(textWidth, inputRect.width - 20),
                        top: inputRect.top,
                        bottom: inputRect.top + lineHeight,
                        width: 0,
                        height: lineHeight
                    };
                    
                    document.body.removeChild(span);
                }
            } else if (selection.rangeCount > 0) {
                // Handle contenteditable selection
                selectedText = selection.toString().trim();
                rect = selection.getRangeAt(0).getBoundingClientRect();
            }
        } else {
            // Handle regular DOM selection
            selectedText = selection.toString().trim();
            
            if (selection.rangeCount > 0) {
                rect = selection.getRangeAt(0).getBoundingClientRect();
            }
        }

        // Only proceed if there's actually selected text and we have valid coordinates
        // and the selection has changed
        if (selectedText && 
            rect && 
            (rect.width > 0 || rect.height > 0) && 
            selectedText !== this.lastSelection) {
            
            this.selectedText = selectedText;
            this.lastSelection = selectedText;
            this.showMenu(rect);
        } else if (!selectedText) {
            // Clear last selection when text is deselected
            this.lastSelection = '';
        }
    }

    showMenu(rect) {
        // Clear previous buttons but keep structure
        this.buttonGroup.innerHTML = '';
        this.toneSelector.style.display = 'none';

        // Detect language
        const isPersian = /[\u0600-\u06FF]/.test(this.selectedText);

        // Add appropriate buttons
        if (this.isInput) {
            if (isPersian) {
                this.addButton(this.buttonGroup, '🔄 ترجمه', () => this.translate('en'));
                this.addButton(this.buttonGroup, '✍️ اصلاح نگارش', () => this.fixWriting());
            } else {
                this.addButton(this.buttonGroup, '🔍 بررسی گرامر', () => this.fixGrammar());
                this.addButton(this.buttonGroup, '✍️ اصلاح نگارش', () => this.fixWriting());
                this.addButton(this.buttonGroup, '🎭 تغییر لحن', () => this.showToneSelector());
            }
        } else {
            if (isPersian) {
                this.addButton(this.buttonGroup, '🔄 ترجمه به انگلیسی', () => this.translate('en'));
            } else {
                this.addButton(this.buttonGroup, '🔄 ترجمه به فارسی', () => this.translate('fa'));
            }
            this.addButton(this.buttonGroup, '📝 خلاصه‌سازی', () => this.summarize());
        }

        // First set display block but keep it invisible
        this.menu.style.display = 'block';
        this.menu.style.opacity = '0';
        this.menu.style.transform = 'translateY(10px)';

        // Get dimensions
        const menuRect = this.menu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Calculate position relative to the selection
        let top = rect.bottom + scrollY;
        let left = rect.left + scrollX - (menuRect.width / 2) + (rect.width / 2);

        // Check if menu would go off screen
        if (rect.bottom + menuRect.height > viewportHeight) {
            // Show above selection if not enough space below
            top = rect.top + scrollY - menuRect.height;
        }

        // Ensure menu stays within horizontal bounds
        left = Math.max(scrollX + 10, Math.min(left, scrollX + viewportWidth - menuRect.width - 10));

        // Apply position
        this.menu.style.top = `${top}px`;
        this.menu.style.left = `${left}px`;
        
        // Force a reflow before adding the visible class
        this.menu.offsetHeight;
        
        // Make menu visible with animation
        requestAnimationFrame(() => {
            this.menu.style.opacity = '1';
            this.menu.style.transform = 'translateY(0)';
        });
    }

    hideMenu() {
        if (this.menu) {
            // Start fade out animation
            this.menu.style.opacity = '0';
            this.menu.style.transform = 'translateY(10px)';
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                this.menu.style.display = 'none';
                if (this.toneSelector) {
                    this.toneSelector.style.display = 'none';
                }
            }, 200); // Match the transition duration from CSS
        }
    }

    showToneSelector() {
        // Toggle tone selector
        const isVisible = this.toneSelector.style.display === 'block';
        this.toneSelector.style.display = isVisible ? 'none' : 'block';
        
        // Position the tone selector relative to the last button
        if (!isVisible) {
            const lastButton = this.buttonGroup.lastElementChild;
            if (lastButton) {
                const buttonRect = lastButton.getBoundingClientRect();
                const menuRect = this.menu.getBoundingClientRect();
                
                this.toneSelector.style.top = '100%';
                this.toneSelector.style.right = '0';
            }
        }
    }

    addButton(container, text, onClick) {
        const button = document.createElement('button');
        button.innerHTML = text;
        button.type = 'button'; // Explicitly set button type
        
        // Improved click handling
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Hide tone selector if it's visible
            if (this.toneSelector && this.toneSelector.style.display === 'block') {
                this.toneSelector.style.display = 'none';
            }
            
            // Prevent multiple clicks
            if (!button.disabled) {
                const resetLoading = this.setLoading(button);
                
                try {
                    // Execute the callback
                    await Promise.resolve(onClick());
                } catch (error) {
                    console.error('Button click error:', error);
                    alert('خطا در اجرای عملیات');
                } finally {
                    resetLoading();
                    this.hideMenu();
                }
            }
        });

        container.appendChild(button);
        return button;
    }

    setLoading(button) {
        const originalText = button.innerHTML;
        const loader = document.createElement('span');
        loader.className = 'grammary-loading';
        button.innerHTML = '';
        button.appendChild(loader);
        button.disabled = true;
        return () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    async translate(targetLang) {
        try {
            const result = await window.api.translateText(this.selectedText, targetLang, 'formal');
            
            if (this.isInput) {
                this.applyInputChange(result);
            } else {
                this.showInlineResult(result, 'ترجمه');
            }
        } catch (error) {
            console.error('Translation error:', error);
            alert('خطا در ترجمه متن');
        }
    }

    async summarize() {
        try {
            const result = await window.api.summarizeText(this.selectedText);
            this.showInlineResult(result, 'خلاصه');
        } catch (error) {
            console.error('Summarization error:', error);
            alert('خطا در خلاصه‌سازی متن');
        }
    }

    async fixGrammar() {
        try {
            const result = await window.api.correctGrammar(this.selectedText);
            this.applyInputChange(result);
        } catch (error) {
            console.error('Grammar correction error:', error);
            alert('خطا در اصلاح گرامر');
        }
    }

    async fixWriting() {
        try {
            // This would be implemented with a writing correction API
            const result = await window.api.correctGrammar(this.selectedText); // Using grammar correction as placeholder
            this.applyInputChange(result);
        } catch (error) {
            console.error('Writing correction error:', error);
            alert('خطا در اصلاح نگارش');
        }
    }

    async handleToneSelection(tone) {
        try {
            // This would be implemented with a tone adjustment API
            const result = await window.api.translateText(this.selectedText, 'en', tone); // Using translation as placeholder
            this.applyInputChange(result);
        } catch (error) {
            console.error('Tone adjustment error:', error);
            alert('خطا در تغییر لحن');
        }
    }

    showInlineResult(text, type) {
        // Get the selection and its range
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Create result container
        const container = document.createElement('div');
        container.className = 'grammary-inline-result';
        
        // Create the original text element
        const originalText = document.createElement('div');
        originalText.className = 'original-text';
        originalText.textContent = this.selectedText;
        
        // Create the result text element
        const resultText = document.createElement('div');
        resultText.className = 'result-text';
        resultText.textContent = text;

        // Create header with type and close button
        const header = document.createElement('div');
        header.className = 'result-header';
        
        const typeLabel = document.createElement('span');
        typeLabel.textContent = type;
        header.appendChild(typeLabel);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.className = 'close-button';
        closeButton.onclick = () => container.remove();
        header.appendChild(closeButton);

        // Assemble the container
        container.appendChild(header);
        container.appendChild(originalText);
        container.appendChild(resultText);

        // Insert after the selected text's containing element
        let targetElement = range.commonAncestorContainer;
        while (targetElement && targetElement.nodeType !== Node.ELEMENT_NODE) {
            targetElement = targetElement.parentNode;
        }
        
        if (targetElement) {
            // If the target is an inline element, find its block parent
            while (targetElement && 
                   window.getComputedStyle(targetElement).display === 'inline') {
                targetElement = targetElement.parentNode;
            }
            
            if (targetElement === document.body) {
                // If we reached the body, wrap the result in a div
                const wrapper = document.createElement('div');
                wrapper.style.margin = '1em';
                wrapper.appendChild(container);
                targetElement.insertBefore(wrapper, targetElement.firstChild);
            } else {
                targetElement.insertAdjacentElement('afterend', container);
            }
        }
    }

    applyInputChange(text) {
        const target = document.activeElement;
        if (!target) return;

        try {
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const currentValue = target.value;
                const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
                
                // Update the value
                target.value = newValue;
                
                // Dispatch input event to trigger any listeners
                target.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Reset selection
                target.setSelectionRange(start + text.length, start + text.length);
            } else if (target.getAttribute('contenteditable') === 'true') {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                
                const range = selection.getRangeAt(0);
                
                // Clear existing content
                range.deleteContents();
                
                // Create and insert new content
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);
                
                // Clean up and normalize
                target.normalize();
                
                // Update selection
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Force contenteditable update
                target.dispatchEvent(new Event('input', { bubbles: true }));
            }
        } catch (error) {
            console.error('Error in applyInputChange:', error);
            alert('خطا در اعمال تغییرات');
        }
    }
}

// Add CSS for the floating menu
function addFloatingMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .grammary-floating-menu {
            position: absolute;
            display: none;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            padding: 8px;
            z-index: 9999;
            direction: rtl;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            font-family: 'Vazirmatn', 'Tahoma', sans-serif;
        }
        
        .grammary-floating-menu .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        .grammary-floating-menu button {
            background: #f0f0f0;
            border: none;
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
            white-space: nowrap;
        }
        
        .grammary-floating-menu button:hover {
            background: #e0e0e0;
        }
        
        .grammary-tone-selector {
            display: none;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #eee;
        }
        
        .grammary-tone-selector button {
            margin-right: 5px;
            margin-bottom: 5px;
        }
        
        .grammary-loading {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            border-top-color: #3498db;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .grammary-inline-result {
            position: relative;
            margin: 1em 0;
            padding: 1em;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            direction: rtl;
            max-width: 800px;
            font-family: 'Vazirmatn', 'Tahoma', sans-serif;
        }
        
        .grammary-inline-result .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5em;
            padding-bottom: 0.5em;
            border-bottom: 1px solid #eee;
            font-weight: bold;
            color: #666;
        }
        
        .grammary-inline-result .close-button {
            background: none;
            border: none;
            color: #999;
            font-size: 1.5em;
            cursor: pointer;
            padding: 0 0.3em;
        }
        
        .grammary-inline-result .close-button:hover {
            color: #666;
        }
        
        .grammary-inline-result .original-text {
            color: #666;
            margin-bottom: 0.5em;
            padding: 0.5em;
            background: #f8f8f8;
            border-radius: 4px;
        }
        
        .grammary-inline-result .result-text {
            color: #333;
            padding: 0.5em;
        }
    `;
    document.head.appendChild(style);
}

// Initialize the floating menu when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    addFloatingMenuStyles();
    window.grammaryFloatingMenu = new GrammaryFloatingMenu();
}); 