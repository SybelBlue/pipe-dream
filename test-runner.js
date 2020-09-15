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

        this.bottomMarginStart = this.pipeline.height + TestRunner.darkMargin
        this.bottomMarginHeight = windowHeight - this.bottomMarginStart;
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
        // bottom pipe
        Renderer.temporary(this, Editor.pipeGutterSize, this.bottomMarginStart, 
            () => new Pipe(true, false, this.bottomMarginHeight).draw());
        
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
            rect(0, this.bottomMarginStart, windowWidth, this.bottomMarginHeight);
        });

        if (this.signaled) return;

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
            SceneManager.valueExitting(this.currentItem.value);
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