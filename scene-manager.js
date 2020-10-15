const SceneManager = {
    unsafeMode: false,

    editable: true,

    level: null,
    editor: null,
    tray: null,

    lastFocused: null,

    promptHeight: 0,

    get promptBackground() { return color(220) },

    get minHeight() {
        return robustMax(lens(TestManager, 'minHeight'), lens(this.editor, 'minHeight'), this.promptHeight + 30);
    },

    get transpiled() {
        const varName = lens(SceneManager.level, 'startingTipe', 'variableName');
        return lens(SceneManager.editor, 'pipeline', 'transpile') && varName && SceneManager.editor.pipeline.transpile(varName + 's');
    },

    startLevel(level, prompt=false) {
        this.level = level;
        this.showPrompt = prompt;
        this.tray = new Tray();
        this.editor = new Editor(level.startingTipe, level.endingTipe, windowWidth, windowHeight);

        this.tray.loadMachineOptions();
        
        return this.editor;
    },

    draw() {
        if (!this.editor) return;

        try {
            if (this.editable) {
                this.tray.draw();
                this.editor.draw();
                this.drawHeaderButtons();
            } else {
                TestManager.draw();
            }
        } catch (e) {
            console.warn('Problem drawing');
            console.error(e);
        }

        this.promptHeight = 0;
        if (this.showPrompt) this.drawPrompt();

        if (this.minHeight > height) {
            requestRescaleCanvas = true;
        }

        try {
            const focused = Renderer.renderAll().found;

            if (clickThisFrame) {
                if (this.lastFocused && this.lastFocused != focused) {
                    this.lastFocused.loseFocus && this.lastFocused.loseFocus();
                }

                this.lastFocused = focused;

                if (focused) {
                    focused.gainFocus && focused.gainFocus();
                } else {
                    SceneManager.tray.loadMachineOptions();
                }
            }
        } catch (e) {
            console.warn('Problem rendering');
            console.error(e);
        } finally {
            Renderer.clearStack();
        }
    },

    drawHeaderButtons() {
        // constructs buttons right to left, updating nextStart each time
        let nextStart = this.drawHeaderButton(
            'Run', 
            windowWidth, 
            color(80, this.editor.pipeTipeChecks ? 250 : 150, 80), 
            () => !this.prompt && TestManager.runLevel()
        ).start;
        
        nextStart = this.drawHeaderButton(
            'Prompt', 
            nextStart, 
            this.editor.pipeTipeChecks ? color('#5C9EAD') : color(120, 210, 230),
            () => this.showPrompt = true
        ).start;

        nextStart = this.drawHeaderButton(
            'Undo', 
            nextStart,
            color('#B796AC'), 
            () => SceneManager.undo()
        ).start;

        if (SceneManager.redoStack.length || SceneManager.unsafeMode) {
            nextStart = this.drawHeaderButton(
                'Redo', 
                nextStart,
                color('#FFD400'), 
                () => SceneManager.redo()
            ).start;
        }

        if (SceneManager.editor.pipeline.length) {
            nextStart = this.drawHeaderButton(
                'Clear', 
                nextStart,
                color('#D72638'), 
                () => SceneManager.clear()
            ).start;
        }
    },

    drawHeaderButton(text, start, color, onClick, margin=10) {
        const width = Renderer.textWidth(text, 24) + 2 * margin;
        const buttonStart = start - width - margin;
        Renderer.temporary(this, buttonStart, margin, () => Renderer.newUIButton(text, color, onClick, margin));
        return { width: width, start: buttonStart };
    },

    drawPrompt() {
        const lines = Renderer.textToLines(this.level.prompt, 36, windowWidth - 50);
        if (!exists(lines)) return;
        Renderer.newRenderable(Layers.UI, () => {
            stroke(0);
            fill(this.promptBackground);
            rect(15, 15, windowWidth - 30, this.promptHeight, 15);
            if (clickThisFrame) {
                this.showPrompt = false;
            }
        });

        Renderer.push(this);
        Renderer.translate(25, 0);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            Renderer.translate(0, Renderer.textHeight(36) + 5);
            Renderer.newRenderable(Layers.UI, () => {
                stroke(0);
                fill(0);
                textSize(36);
                text(line, 0, Renderer.textHeight(36) * 0.8);
            });
        }
        Renderer.translate(0, Renderer.textHeight(36) + 5);

        const width = windowWidth - 20;
        Renderer.translate(10, 30);
        for (const machine of SceneManager.level.machines) {
            const h = machine.drawDescription(width);
            Renderer.translate(0, h + 10);
        }
        
        this.promptHeight = max(windowHeight - 30, Renderer.stackTop.localY + 30);
        
        Renderer.pop(this);

        Renderer.temporary(this, windowWidth - 95, this.promptHeight - 15,
            () => Renderer.newUIButton('Okay!', color('#5C9EAD'), () => this.showPrompt = false));
    },

    actionStack: [],
    redoStack: [],

    allowCaching: true,

    get cacheKey() { return (lens(SceneManager, 'level', 'number') || 'missing') + ''; },

    cache() {
        if (!SceneManager.allowCaching) return;
        const pipeline = lens(SceneManager, 'editor', 'pipeline');
        if (!pipeline) return;

        const lastData = SceneManager.retrieve();
        const data = pipeline.cacheData;

        if (lastData == data) return;

        if (SceneManager.actionStack.length > 1000) {
            SceneManager.actionStack = SceneManager.actionStack.slice(SceneManager.actionStack.length - 990);
        }

        SceneManager.actionStack.push(lastData);
        SceneManager.redoStack = [];
        localStorage.setItem(SceneManager.cacheKey, data);
    },
    
    retrieve() {
        return localStorage.getItem(SceneManager.cacheKey);
    },
    
    loadFromCache() {
        const pipeline = SceneManager.retrieve();
        if (!pipeline) return;
        SceneManager.editor.clearPipeline();
        SceneManager.editor.pipeline.recieveCacheData(pipeline);
    },

    undo() {
        if (!this.actionStack.length) return;
        const last = this.actionStack.pop();
        this.redoStack.push(SceneManager.retrieve());
        localStorage.setItem(SceneManager.cacheKey, last);
        SceneManager.allowCaching = false;
        try { SceneManager.loadFromCache(); }
        finally { SceneManager.allowCaching = true; }
    },

    redo() {
        if (!this.redoStack.length) return;
        const next = this.redoStack.pop();
        this.actionStack.push(SceneManager.retrieve());
        localStorage.setItem(SceneManager.cacheKey, next);
        SceneManager.allowCaching = false;
        try { SceneManager.loadFromCache(); } 
        finally { SceneManager.allowCaching = true; }
    },

    clear() {
        SceneManager.editor.clearPipeline();
        SceneManager.cache();
    }
}