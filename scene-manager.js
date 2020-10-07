const SceneManager = {
    unsafeMode: false,

    editable: true,
    canContinue: false,

    level: null,
    editor: null,
    tray: null,
    runner: null,

    testIndex: 0,

    lastFocused: null,

    get promptBackground() { return color(220) },

    get minHeight() {
        return this.runner ? this.runner.height : this.editor.minHeight;
    },

    startLevel(level, prompt=false) {
        this.level = level;
        this.prompt = prompt;
        this.tray = new Tray();
        this.tray.loadMachineOptions();
        return (this.editor = new Editor(level.startingTipe, level.endingTipe, windowWidth, windowHeight));
    },

    draw() {
        if (!this.editor) return;

        if (this.editable) {
            this.tray.draw();
            this.editor.draw();

            const canRun = SceneManager.unsafeMode || this.editor.pipeTipeChecks;
            // draw run button
            const margin = 10;
            const width = Renderer.textWidth('Run', 24) + 2 * margin;
            const start = windowWidth - width - margin;
            Renderer.temporary(this, start, margin, 
                () => Renderer.newUIButton('Run', color(80, canRun ? 250 : 150, 80), () => canRun && !this.prompt && this.runLevel(), margin));
            
            // draw prompt button
            const pWidth = Renderer.textWidth('Prompt', 24) + 2 * margin;
            const pStart = start - pWidth - margin;
            Renderer.temporary(this, pStart, margin,
                () => Renderer.newUIButton('Prompt', canRun ? color('#5C9EAD') : color(120, 210, 230), () => this.prompt = true));
        } else {
            this.runner.draw();
            for (const key in this.exittingValues) {
                this.exittingValues[key].draw();
            }
            this.drawTestPreviews();
            this.drawTestTray();
        }

        if (this.prompt) this.drawPrompt();

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

        Renderer.clearStack();
    },

    drawPrompt() {
        const lines = Renderer.textToLines(this.level.prompt, 36, windowWidth - 30);
        if (!exists(lines)) return;
        Renderer.newRenderable(Layers.UI, () => {
            stroke(0);
            fill(this.promptBackground);
            rect(15, 15, windowWidth - 30, windowHeight - 30, 15);
        });

        Renderer.temporary(this, windowWidth - 95, windowHeight - 45,
            () => Renderer.newUIButton('Okay!', color('#5C9EAD'), () => this.prompt = false));

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
        Renderer.pop(this);
    },

    drawTestPreviews() {
        Renderer.push(this);
        const pipeGap = Machine.width / 2;
        const slotWidth = Machine.width + pipeGap;
        let indexStart;
        if (this.testIndex === 0) {
            indexStart = 0;
            Renderer.translate(Editor.gutterSize, 0);
        } else {
            indexStart = this.testIndex - 1;
            Renderer.translate(Editor.gutterSize - slotWidth, 0);
        }
        
        for (var i = indexStart; i < min(indexStart + 4, this.level.tests.length); i++) {
            const test = this.level.tests[i];
            if (i !== this.testIndex) {
                TestRunner.drawTestPreview(test); // make clickable
            }
            Renderer.translate(slotWidth, 0);
        };
        Renderer.pop(this);
    },

    drawTestTray() {
        const trayWidth = 200;
        const textHeight = Renderer.textHeight(24);
        const margin = 10;
        const start = windowWidth - Renderer.textWidth('Stop', 24) - 3 * margin;
        Renderer.temporary(this, start, margin, 
            () => Renderer.newUIButton('Stop', color(250, 80, 80), () => this.editable = true, margin));

        Renderer.push(this);
        Renderer.translate(windowWidth - trayWidth, 2 * margin + textHeight + 2 * margin);

        Renderer.newRenderable(Layers.UI, () => {
            fill(Tray.backgroundColor);
            rect(0, 0, trayWidth + 1, windowHeight - Renderer.xTranslation, 10, 0, 0, 10);
        });

        Renderer.translate(10, 10);
        const height = textHeight + 2 * margin;
        for (let i = 0; i < this.level.tests.length; i++) {
            Renderer.newRenderable(Layers.UI,
                (regions) => {
                    fill(this.colorForTest(i));
                    rect(0, 0, trayWidth - margin, height, 10);

                    fill(regions.test.hovering ? 255 : 0);
                    textSize(24);
                    text('Test ' + i, margin, margin + textHeight * 0.8);

                    if (regions.test.clicked) {
                        this.runTest(i);
                    }
                },
                Renderer.regionStub('test', 0, 0, trayWidth - 20, height)
            );
            Renderer.translate(0, height + 20)
        };

        if (this.canContinue) {
            Renderer.newUIButton('Next Level', color(80, 250, 80), () => updateLevelNumber((this.level.number + 1) % levels.length));
        }
        Renderer.pop(this);
    },

    colorForTest(i) {
        if (i === this.testIndex) {
            return color('#6699CC');
        }
        if (exists(this.testIndex) && i > this.testIndex) {
            return color('#B2B2B2');
        }
        if (this.passedTests[i] === false) {
            return color('#C3423F');
        }
        return color('#81E979');
    },

    runLevel() {
        this.editable = false;
        this.canContinue = false;
        this.testIndex = 0;
        this.exittingValues = {};
        this.currentSolutions = this.level.tests.map(t => this.editor.pipeline.process(t));
        this.passedTests = this.currentSolutions.map((sol, i) => {
            return this.level.solutions[i].length === sol.length && this.level.solutions[i].every((s, j) => s.equals(sol[j]));
        });
        this.runner = new TestRunner(this.editor.pipeline, this.level.tests[this.testIndex]);
    },

    testCompleted(output) {
        this.testIndex++;
        this.beginTest();
    },

    runTest(index) {
        this.testIndex = index;
        this.beginTest();
    },

    beginTest() {
        if (this.level.tests.length <= this.testIndex) {
            this.canContinue = this.passedTests.reduce((p, v) => p && v);
            return;
        }
        this.runner = new TestRunner(this.editor.pipeline, this.level.tests[this.testIndex]);
    },

    valueExitting(tipedValue) {
        const key = frameCount;
        this.exittingValues[key] = 
            new LerpAnimator(
                () => tipedValue.draw(),
                [Editor.pipelineMidline, this.runner.bottomMarginStart],
                [Editor.pipelineMidline, canvas.height],
                this.runner.speed,
                () => delete this.exittingValues[key]
            );
    }
}