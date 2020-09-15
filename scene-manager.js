class SceneManager {
    static editable = true;

    static level = null;
    static editor = null;
    static tray = null;
    static runner = null;
    static testIndex = 0;

    static startLevel(level) {
        this.level = level;
        this.tray = new Tray();
        this.tray.loadMachineOptions();
        return (this.editor = new Editor(level.startingTipe, level.endingTipe, 0, 0, windowWidth, windowHeight));
    }

    static draw() {
        if (!this.editor) return;

        if (this.editable) {
            this.tray.draw();
            this.editor.draw();

            // draw play button
            const margin = 10;
            const tHeight = Renderer.textHeight('Courier New', 24);
            const height = tHeight + 2 * margin;
            const width = Renderer.textWidth('Run', 'Courier New', 24) + 2 * margin;
            const start = canvas.width - width - margin;
            Renderer.newRenderable(Layers.UI, (regions) => {
                fill(10);
                stroke(regions.runButton.hovering ? 200 : 0);
                rect(start, margin, width, height, 5);

                noStroke();
                fill(20, 200, 20);
                textFont('Courier New');
                textSize(24);
                text('Run', start + margin, 2 * margin + tHeight * 0.8);
                if (regions.runButton.clicked) {
                    this.runLevel();
                }
            }, Renderer.regionStub('runButton', start, 10, height, height));
        } else {
            this.runner.draw();
            for (const key in this.exittingValues) {
                this.exittingValues[key].draw();
            }

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
        }

        // render running ui
        // Renderer.newRenderable(Layers.UI, (regions) => {
        //     fill(10);
        //     rect(10, 10, 80, 45, 10);

        //     stroke(255, 40, 60);
        //     fill(regions.stopButton.hovering ? 250 : 200, 20, 50);
        //     rect(20, 20, 25, 25);

        //     stroke(30, 30, 255)
        //     fill(20, 20, 250);
        //     rect(55, 20, 10, 25);
        //     rect(70, 20, 10, 25);
        //     if (regions.stopButton.clicked) this running = false;
        // }, Renderer.regionStub('stopButton', 20, 20, 25, 25));

        const focused = Renderer.renderAll().found;

        if (!focused && clickThisFrame) {
            SceneManager.tray.loadMachineOptions();
        }
        Renderer.clearStack();
    }

    static runLevel() {
        this.editable = false;
        this.testIndex = 0;
        this.exittingValues = {};
        this.runner = new TestRunner(this.editor.pipeline, this.level.tests[this.testIndex]);
    }

    static testCompleted(output) {
        this.testIndex++;
        if (this.level.tests.length <= this.testIndex) {
            SceneManager.editable = true;
            return;
        }
        this.runner = new TestRunner(this.editor.pipeline, this.level.tests[this.testIndex]);
        console.log('test completed', output);
    }

    static valueExitting(tipedValue) {
        const key = frameCount;
        this.exittingValues[key] = 
            new LerpAnimator(
                () => tipedValue.draw(),
                [Editor.pipelineMidline, this.runner.bottomMarginStart],
                [Editor.pipelineMidline, windowHeight],
                this.runner.speed,
                () => delete this.exittingValues[key]
            );
    }
}