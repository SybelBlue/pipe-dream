class TestRunner {
    static darkMargin = 300;

    get speed() { return TestManager.speed; }
    currentItem = null;
    output = [];

    done = false;
    signaled = false;
    ballYOffset = 0;
    finishedFrame = null;

    constructor(pipeline, test) {
        this.pipeline = pipeline;
        this.pipeline.forEach(m => m.reset());
        this.test = test.map(v => v.clone());

        this.bottomMarginStart = TestRunner.darkMargin + this.pipeline.height;
        this.bottomMarginHeight = max(windowHeight - this.bottomMarginStart, TestRunner.darkMargin * 0.8);

        // flag for new height if necessary
        this.height = this.bottomMarginStart + this.bottomMarginHeight;
        requestRescaleCanvas = (this.height > windowHeight);
    }

    static drawTestPreview(test, closed=true, done=true, yOffset=0) {
        // top pipe
        Renderer.temporary(this, 0, 0, () => Pipe.draw(false, true, null, TestRunner.darkMargin, done));

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
        Renderer.translate(Editor.pipelineMidline - Editor.pipeGutterSize, TestRunner.darkMargin - Tipe.maxDrawWidth - yOffset);
        test.slice(0, 5).forEach(tipedValue => {
            tipedValue.draw();
            Renderer.translate(0, -Tipe.maxDrawWidth);
        });
        Renderer.pop(this);
    }

    draw(drawTestPreview=true) {
        // bottom pipe
        Renderer.temporary(this, Editor.pipeGutterSize, this.bottomMarginStart, 
            !Array.last(this.pipeline) || Array.last(this.pipeline).properOutputTipe.isStream ?
                () => Pipe.draw(true, false, null, this.bottomMarginHeight) :
                () => Conveyor.draw(null, this.bottomMarginHeight)
        );
        
        if (drawTestPreview) {
            Renderer.temporary(this, Editor.pipeGutterSize, 0,
                () => TestRunner.drawTestPreview(this.test, this.pipeline.closed, this.done, this.ballYOffset));
        }
        this.ballYOffset = max(this.ballYOffset - this.speed * 0.8, 0);

        // pipeline
        Renderer.temporary(this, 0, TestRunner.darkMargin, () => this.pipeline.draw());

        // background
        Renderer.newRenderable(Layers.Background, () => {
            // backdrop
            fill(Editor.backgroundColor);
            rect(0, 0, windowWidth, this.height);

            // top dark margin
            fill(Editor.darkMarginColor);
            rect(0, 0, windowWidth, TestRunner.darkMargin);
            // bottom dark margin
            rect(0, this.bottomMarginStart, windowWidth, this.bottomMarginHeight);
        });

        if (this.signaled) return;

        if (this.done) {
            if (this.finishedFrame + 100 < frameCount) {
                TestManager.testCompleted(this.output);
                this.signaled = true;
            }
            return;
        }

        if (!exists(this.currentItem)) {
            if (!this.test.length || this.pipeline.closed) {
                if (this.pipeline.terminalMachine && this.pipeline.terminalMachine.isGreedy) {
                    const finalValue = this.pipeline.terminalMachine.value;
                    this.output.push(finalValue);
                    TestManager.valueExitting(finalValue);
                }
                this.done = true;
                this.finishedFrame = frameCount;
                return;
            }
            const tipedValue = this.test.shift();
            this.ballYOffset += Tipe.maxDrawWidth;

            this.currentItem = {
                value: tipedValue,
                animator: new LerpAnimator(
                    () => tipedValue.draw(), 
                    [0, -Tipe.maxDrawWidth],
                    [0, Pipe.height],
                    () => this.speed,
                    () => this.currentEnteredMachine(0)),
            }
        }

        // render current value
        Renderer.temporary(this, Editor.pipelineMidline, TestRunner.darkMargin, () => this.currentItem.animator.draw());
    }

    currentEnteredMachine(index) {
        if (this.pipeline.length <= index) {
            this.output.push(this.currentItem.value);
            TestManager.valueExitting(this.currentItem.value);
            this.currentItem = null;
            return;
        }

        const machine = this.pipeline[index];
        const tipedValue = machine.accept(this.currentItem.value);

        if (!tipedValue) {
            this.currentItem = null;
            return;
        }

        if (machine.isTerminal) {
            TestManager.valueExitting(this.currentItem.value);
            this.currentItem = null;
            return;
        }

        const start = machine.height + this.currentItem.animator.stop[1];
        const onComplete = () => this.currentItem = {
            value: tipedValue,
            animator: new LerpAnimator(
                () => tipedValue.draw(), 
                [0, start - StackedMachine.tailHeight], 
                [0, start + Pipe.height], 
                () => this.speed, 
                () => this.currentEnteredMachine(index + 1)
            ),
        };

        this.currentItem = {
            value: tipedValue,
            animator: new PauseAnimator(
                () => {},
                20,
                onComplete
            )
        }
    }
}