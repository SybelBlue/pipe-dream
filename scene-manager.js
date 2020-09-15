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
}

class TestRunner {
    static darkMargin = 300;

    speed = 3;
    currentItem = null;
    output = [];

    done = false;
    signaled = false;
    offset = 0;
    finishedFrame = null;

    constructor(pipeline, test) {
        this.pipeline = pipeline;
        this.pipeline.forEach(m => m.reset());
        this.test = test.map(v => v.clone());
    }

    static drawTestPreview(test, closed=true, done=true, yOffset=0) {
        // top pipe
        Renderer.temporary(this, 0, 0, () => new Pipe(false, true, TestRunner.darkMargin, done).draw());

        // pipe inlet shadows
        Renderer.newRenderable(Layers.Pipe, () => {
            const inletY = TestRunner.darkMargin - 10;
            const inletX = Pipe.edgeWidth;
            fill(20);
            if (closed) {
                // closed pipe inlet shadow
                rect(inletX, inletY, Pipe.innerWidth, 10);
            } else {
                // open inlet shadow
                rect(inletX, inletY, Pipe.innerWidth * 0.1, 10);
                rect(inletX + Pipe.innerWidth * (1.0 - 0.1), inletY, Pipe.innerWidth * 0.1, 10);
            }
        });
        
        // render waiting values
        Renderer.push(this);
        Renderer.translate(Editor.pipelineMidline - Editor.pipeGutterSize, TestRunner.darkMargin * 0.8 - yOffset);
        test.slice(0, 5).forEach(tipedValue => {
            tipedValue.draw();
            Renderer.translate(0, -TestRunner.darkMargin/4);
        });
        Renderer.pop(this);
    }

    draw() {
        if (this.signaled) return;

        const pHeight = this.pipeline.height;
        const bottomMarginStart = pHeight + TestRunner.darkMargin
        const bottomMarginHeight = windowHeight - bottomMarginStart;
        // bottom pipe
        Renderer.temporary(this, Editor.pipeGutterSize, bottomMarginStart, 
            () => new Pipe(true, false, bottomMarginHeight).draw());
        
        Renderer.temporary(this, Editor.pipeGutterSize, 0,
            () => TestRunner.drawTestPreview(this.test, this.pipeline.closed, this.done, this.offset));
        this.offset = max(this.offset - this.speed * 0.8, 0);

        // pipeline
        Renderer.temporary(this, 0, TestRunner.darkMargin, () => this.pipeline.draw());

        // background
        Renderer.newRenderable(Layers.Background, () => {
            // backdrop
            fill(Editor.backgroundColor);
            rect(0, 0, windowWidth, windowHeight);

            // top dark margin
            fill(Editor.darkMarginColor);
            rect(0, 0, windowWidth, TestRunner.darkMargin);
            // bottom dark margin
            rect(0, bottomMarginStart, windowWidth, bottomMarginHeight);
        });

        // side bar with all tests and test results listed

        if (this.done) {
            if (this.finishedFrame + 100 < frameCount) {
                SceneManager.testCompleted(this.output);
                this.signaled = true;
            }
            return;
        }

        if (!exists(this.currentItem)) {
            if (!this.test.length || this.pipeline.closed) {
                this.done = true;
                this.finishedFrame = frameCount;
                return;
            }
            const tipedValue = this.test.shift();
            this.offset += TestRunner.darkMargin/4;

            this.currentItem = {
                value: tipedValue,
                animator: new LerpAnimator(
                    () => tipedValue.draw(), 
                    [0, -TestRunner.darkMargin * 0.2],
                    [0, Pipe.height],
                    this.speed,
                    () => this.currentEnteredMachine(0)),
            }
        }

        // render current value
        Renderer.temporary(this, Editor.pipelineMidline, TestRunner.darkMargin, () => this.currentItem.animator.draw());
    }

    currentEnteredMachine(index) {
        if (this.pipeline.length <= index) {
            this.output.push(this.currentItem.value);
            this.currentItem = null;
            return;
        }

        const machine = this.pipeline[index];
        const tipedValue = machine.accept(this.currentItem.value);

        if (!tipedValue) {
            console.log('rejected');
            this.currentItem = null;
            return;
        }

        const start = machine.height + this.currentItem.animator.stop[1];
        this.currentItem = {
            value: tipedValue,
            animator: new LerpAnimator(
                () => tipedValue.draw(), 
                [0, start - StackedMachine.tailHeight], 
                [0, start + Pipe.height], 
                this.speed, 
                () => this.currentEnteredMachine(index + 1)
            ),
        }
    }
}