class Machine {
    static get machines() { 
        return [
            new MapMachine(-1, Tipe),
            new FilterMachine(-1, Tipe),
            new TakeMachine(-1, Tipe),
            new FirstMachine(-1, Tipe),
            new DropMachine(-1, Tipe),
            new CountMachine(-1, Tipe),
            // new SortMachine(-1, Tipe),
            new ReduceMachine(-1, Tipe),
            new ScanMachine(-1, Tipe),
        ];
    }

    static get dummy() { return new this(-1, Tipe); }

    static width = Pipe.mainWidth + 2 * Editor.pipeIndent;
    static bodyIndent = Editor.pipeIndent;
    static bodyHeight = 50;

    static get textColor() { return color(11); }

    static deleteButtonWidth = 15;
    static deleteButtonIndent = Machine.width - Machine.deleteButtonWidth - 10;
    static deleteButtonMidline = Machine.bodyHeight / 2;
    
    static swapButtonHeight = Machine.deleteButtonWidth;
    static swapButtonWidth = Machine.deleteButtonWidth * 1.25;
    static swapButtonMidline = Machine.deleteButtonMidline;
    static swapButtonStart = -Machine.swapButtonWidth - 3;

    get height() { return Machine.bodyHeight; }
    get bodyHeight() { return Machine.bodyHeight; }

    get indicatorOffset() { return Machine.bodyHeight / 2; }

    get closedPipeline() { return false; }

    get outputTipe() { return BallTipe; }

    get properOutputTipe() { return Tipe.Stream(this.outputTipe); }

    description = "A simple machine, \n with simple uses.";
    textSize = 26;
    resilient = false;
    isGreedy = false;
    isDummy = true;
    
    drawSwapButtons = true;
    exclaimFrames = 0;

    get inTipe() { return this._inTipe; }
    set inTipe(value) {
        if (this.resilient) {
            this._inTipe = value;
        } else {
            throw new Error('Tried to change inTipe on non-resilient machine');
        }
    }

    constructor(key, inTipe, bodyColor, text) {
        this.key = key;
        this._inTipe = inTipe;
        this.color = bodyColor;
        this.text = text;
        this.isDummy = key < 0;

        this.drawLayer = Layers.Machine;
    }

    draw() {
        Renderer.newRenderable(this.drawLayer, 
            (regions) => {
                if (SceneManager.editable && regions.body.clicked) {
                    if (regions.deleteButton.hovering && !this.isDummy) {
                        SceneManager.editor.removeMachine(this.key);
                        SceneManager.tray.loadMachineOptions();
                    } else {
                        this.onClick();
                    }
                }
                noStroke();
                fill(this.color);
                rect(0, 0, Machine.width, this.bodyHeight, 10, 10, 10, 0);

                stroke(0);
                textSize(this.textSize + (this.isDummy && regions.body.hovering ? 2 : 0));
                fill(Machine.textColor);
                text(this.text, 10, 30);
                
                // draw red line
                if (!this.finished && !this.isDummy) {
                    stroke(200, 5, 5);
                    const y = 20 + Renderer.textHeight(this.textSize) * 0.8;
                    line(10, y, Renderer.textWidth(this.text, this.textSize) + 10, y);
                }

                if (this.exclaimFrames > 0) {
                    this.exclaimFrames--;
                    noStroke();
                    fill(255);
                    rect(-30, 5, 25, Machine.bodyHeight - 10, 5);
                    triangle(
                        -5, Machine.bodyHeight * 0.4,
                        -5, Machine.bodyHeight * 0.6,
                        -1, Machine.bodyHeight * 0.5
                    );

                    fill(0)
                    textSize(40);
                    text('!', -30, 25 + 15);
                }

                if (SceneManager.editable && !this.isDummy) {
                    if (regions.body.hovering) {
                        noStroke();
                        textSize(16);
                        text(`(${this.inTipe.isFunctionTipe ? `f(${this.inTipe.inTipe.variableName})` : this.inTipe.variableName})`, 20 + Renderer.textWidth(this.text, 26), 30);

                        stroke(255, 20, 20);
                        strokeWeight(5);
                        const halfWidth = Machine.deleteButtonWidth / 2;
                        line(
                            Machine.deleteButtonIndent, Machine.deleteButtonMidline - halfWidth, 
                            Machine.deleteButtonIndent + Machine.deleteButtonWidth, Machine.deleteButtonMidline + halfWidth
                        );
                        line(
                            Machine.deleteButtonIndent, Machine.deleteButtonMidline + halfWidth, 
                            Machine.deleteButtonIndent + Machine.deleteButtonWidth, Machine.deleteButtonMidline - halfWidth
                        );
                    }

                    if (!this.drawSwapButtons) return;

                    if (regions.body.hovering || regions.swapUpButton.hovering || regions.swapDownButton.hovering) {
                        fill(20);
                        noStroke();
                        if (SceneManager.editor.canSwapUp(this)) {
                            triangle(
                                Machine.swapButtonStart, Machine.swapButtonMidline - 1,
                                Machine.swapButtonStart + Machine.swapButtonWidth, Machine.swapButtonMidline - 1,
                                Machine.swapButtonStart + Machine.swapButtonWidth/2, Machine.swapButtonMidline - Machine.swapButtonHeight
                            );
                        }
                        if (SceneManager.editor.canSwapDown(this)) {
                            triangle(
                                Machine.swapButtonStart, Machine.swapButtonMidline + 1,
                                Machine.swapButtonStart + Machine.swapButtonWidth, Machine.swapButtonMidline + 1,
                                Machine.swapButtonStart + Machine.swapButtonWidth/2, Machine.swapButtonMidline + Machine.swapButtonHeight
                            );
                        }
                    }
                    if (regions.swapUpButton.clicked) {
                        SceneManager.editor.swapUp(this);
                    }
                    if (regions.swapDownButton.clicked) {
                        SceneManager.editor.swapDown(this);
                    }
                }
            },
            Renderer.regionStub('body', 0, 0, Machine.width, this.bodyHeight),
            Renderer.regionStub('deleteButton', 
                Machine.deleteButtonIndent, Machine.deleteButtonMidline - Machine.deleteButtonWidth/2, 
                20, 20, 
                false),
            Renderer.regionStub('swapUpButton', Machine.swapButtonStart, Machine.swapButtonMidline - Machine.swapButtonHeight, -Machine.swapButtonStart, Machine.swapButtonHeight),
            Renderer.regionStub('swapDownButton', Machine.swapButtonStart, Machine.swapButtonMidline, -Machine.swapButtonStart, Machine.swapButtonHeight)
        );
    }

    drawDescription(width) {
        const dummyWidth = Machine.width + 10;
        const textWidth = width - dummyWidth;
        if (textWidth < 0) return;

        const last = this.drawLayer;
        this.drawLayer = Layers.UI;
        this.draw();
        this.drawLayer = last;

        const lines = Renderer.textToLines(this.description, 24, textWidth);
        const lineGap = 5;
        const lineHeight = Renderer.textHeight(24);
        const textBodyHeight = (lineHeight + lineGap) * lines.length - lineGap;
        
        Renderer.newRenderable(Layers.UI, () => {
            fill(0);
            stroke(0);
            textSize(24);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                text(line, dummyWidth, i * (lineHeight + lineGap) + lineHeight);
            }
        });

        return max(textBodyHeight, this.height);
    }

    onClick() {
        if (this.isDummy) {
            SceneManager.editor.pushMachine(this.constructor);
        }
    }

    apply(tipedValue) { return tipedValue; }

    process(values) { return values; }

    reset() {}

    accept(tipedValue) { return this.apply(tipedValue); }

    exclaim() {
        this.exclaimFrames += 90;
    }

    get transpileText() { return this.text; }

    transpile() {
        return `${this.transpileText}()`;
    }

    // get cacheData() { return null; }

    recieveCacheData(_data) { }
}