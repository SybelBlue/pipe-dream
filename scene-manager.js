class SceneManager {
    static editable = true;

    static level = null;
    static editor = null;
    static tray = null;
    static runner = null;

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
            // maybe draw pipeline only?
            Renderer.newRenderable(Layers.Background, () => {
                fill(Editor.backgroundColor);
                rect(0, 0, canvas.width, canvas.height);
            });
            this.runner.draw();
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
        this.runner = new TestRunner(this.editor.pipeline, this.level.tests[0]);
    }
}

class TestRunner {
    speed = 1;
    currentItem = null;
    output = [];

    constructor(pipeline, test) {
        this.pipeline = pipeline;
        this.pipeline.forEach(m => m.reset());
        this.test = test;
    }

    draw() {
        if (!exists(this.currentItem, false)) {
            const tipedValue = this.test.shift();
            // animate all remaining test items down?
            this.currentItem = {
                value: tipedValue,
                animator: new LerpAnimator(() => tipedValue.draw(), [0, -StackedMachine.tailHeight], [0, Pipe.height], this.speed, () => this.currentEnteredMachine(0)),
            }
            console.log(this.currentItem);
        }

        Renderer.push(this);
        Renderer.translate(Editor.pipelineMidline, 0);
        this.currentItem.animator.draw();
        Renderer.pop(this);
        this.pipeline.draw();
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
            animator: new LerpAnimator(() => tipedValue.draw(), [0, start - StackedMachine.tailHeight], [0, start + Pipe.height], this.speed, () => this.currentEnteredMachine(index + 1)),
        }
    }
}