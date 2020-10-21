const TestManager = {
    runner: null,

    testXOffset: 0,
    testIndex: 0,

    canContinue: false,

    fastForward: false,

    get speed() {
        return this.fastForward ? 9 : 4;
    },

    get minHeight() {
        return lens(this.runner, 'height');
    },

    draw() {
        this.runner.draw();
        for (const key in this.exittingValues) {
            this.exittingValues[key].draw();
        }
        this.drawTestPreviews();
        this.drawTestTray();

        if (this.minHeight > height) {
            requestRescaleCanvas = true;
        }
    },

    drawTestPreviews() {
        Renderer.push(this);
        Renderer.translate(this.testXOffset, 0);

        const pipeGap = Machine.width / 2;
        const slotWidth = Machine.width + pipeGap;
        let indexStart;
        if (this.testIndex === 0) {
            indexStart = 0;
            Renderer.translate(Editor.gutterSize, 0);
        } else {
            indexStart = this.testIndex - 1;
            Renderer.translate(Editor.gutterSize - slotWidth + Editor.pipeIndent, 0);
        }
        
        for (var i = indexStart; i < min(indexStart + 4, SceneManager.level.tests.length); i++) {
            const test = SceneManager.level.tests[i];
            if (i !== this.testIndex || this.testXOffset !== 0) {
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
        const start = windowWidth - Renderer.textWidth('Stop', 24) - 4 * margin;
        Renderer.temporary(this, start, margin, 
            () => Renderer.newUIButton('Stop', color(250, 80, 80), () => SceneManager.editable = true, margin));
        const buttonText = this.fastForward ? 'Slow' : 'Fast';
        Renderer.temporary(this, start - Renderer.textWidth(buttonText, 24) - 3 * margin, margin, 
            () => Renderer.newUIButton(buttonText, color(80, this.fastForward ? 80 : 250, 80), () => TestManager.fastForward = !TestManager.fastForward, margin));

        Renderer.push(this);
        Renderer.translate(windowWidth - trayWidth, 2 * margin + textHeight + 2 * margin);

        Renderer.newRenderable(Layers.UI, () => {
            fill(Tray.backgroundColor);
            rect(0, 0, trayWidth + 1, windowHeight - Renderer.xTranslation, 10, 0, 0, 10);
        });

        Renderer.translate(10, 10);
        const height = textHeight + 2 * margin;
        for (let i = 0; i < SceneManager.level.tests.length; i++) {
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
            Renderer.newUIButton('Next Level', color(80, 250, 80), () => updateLevelNumber((SceneManager.level.number + 1) % levels.length));
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
        SceneManager.editable = false;
        this.canContinue = false;
        this.exittingValues = {};
        this.currentSolutions = SceneManager.level.tests.map(t => SceneManager.editor.pipeline.process(t));
        this.passedTests = this.currentSolutions.map((sol, i) => {
            const solution = SceneManager.level.solutions[i];
            if (!(solution instanceof Array)) {
                return solution.equals && solution.equals(sol);
            }
            return solution.length === sol.length && solution.every((s, j) => s.equals(sol[j]));
        });
        this.runTest(0);
    },

    testCompleted(output) {
        const oldRunner = this.runner;
        this.runner = new IterateAnimator(
            (offset) => {
                oldRunner.draw(false);
                this.testXOffset = offset;
            },
            0,
            (offset) => offset - TestManager.speed,
            (offset) => offset <= -Editor.gutterSize,
            () => {
                this.testXOffset = 0;
                this.testIndex++;
                this.runner = oldRunner;
                this.beginTest();
            }
        );
    },

    runTest(index) {
        this.testIndex = index;
        this.beginTest();
    },

    beginTest() {
        this.testXOffset = 0;
        if (SceneManager.level.tests.length <= this.testIndex) {
            this.canContinue = this.passedTests.reduce((p, v) => p && v);
            this.testXOffset = -Editor.gutterSize;
            const oldRunner = this.runner;
            this.runner = new PauseAnimator(() => oldRunner.draw(false), 100000, () => SceneManager.editable = true);
            return;
        }
        this.runner = new TestRunner(SceneManager.editor.pipeline, SceneManager.level.tests[this.testIndex]);
    },

    valueExitting(tipedValue) {
        const key = frameCount;
        this.exittingValues[key] = 
            new LerpAnimator(
                () => tipedValue.draw(),
                [Editor.pipelineMidline, lens(this.runner, 'bottomMarginStart') || windowHeight - Editor.darkMargin],
                [Editor.pipelineMidline, dimensions.height],
                () => lens(this.runner, 'speed') || TestManager.speed,
                () => delete this.exittingValues[key]
            );
    }
}