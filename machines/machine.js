class Machine {
    static get machines() { 
        return [
            new MapMachine(-1, Tipe), 
            new FilterMachine(-1, Tipe), 
            new TakeMachine(-1, Tipe), 
            new FirstMachine(-1, Tipe), 
            new DropMachine(-1, Tipe),
            new CountMachine(-1, Tipe),
        ];
    }

    static width = Pipe.mainWidth + 2 * Editor.pipeIndent;
    static bodyIndent = Editor.pipeIndent;
    static bodyHeight = 50;

    static get textColor() { return color(11); }

    static deleteButtonWidth = 15;
    static deleteButtonIndent = Machine.width - Machine.deleteButtonWidth - 10;
    static deleteButtonMidline = Machine.bodyHeight / 2;

    get height() { return Machine.bodyHeight; }
    get bodyHeight() { return Machine.bodyHeight; }

    get closedPipeline() { return false; }

    get outputTipe() { return BallTipe; }

    get properOutputTipe() { return Tipe.Stream(this.outputTipe); }

    textSize = 26;
    resilient = true;
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
        this.dummy = key < 0;
    }

    draw() {
        Renderer.newRenderable(Layers.Machine, 
            (regions) => {
                if (SceneManager.editable && regions.body.clicked) {
                    if (regions.deleteButton.hovering && !this.dummy) {
                        editor.removeMachine(this.key);
                        SceneManager.tray.loadMachineOptions();
                    } else {
                        this.onClick();
                    }
                }
                noStroke();
                fill(this.color);
                rect(0, 0, Machine.width, this.bodyHeight, 10, 10, 10, 0);

                stroke(0);
                textSize(this.textSize);
                textFont('Courier New');
                fill(Machine.textColor);
                text(this.text, 10, 30);
                
                if (!this.finished && !this.dummy) {
                    stroke(200, 5, 5);
                    const y = 20 + Renderer.textHeight('Courier New', this.textSize) * 0.8;
                    line(10, y, Renderer.textWidth(this.text, 'Courier New', this.textSize) + 10, y);
                }

                if (this.exclaimFrames > 0) {
                    this.exclaimFrames--;
                    noStroke();
                    fill(255);
                    rect(-30, 5, 25, this.bodyHeight - 10, 5);
                    triangle(
                        -5, this.bodyHeight * 0.4,
                        -5, this.bodyHeight * 0.6,
                        -1, this.bodyHeight * 0.5
                    );

                    fill(0)
                    textSize(40);
                    textFont('Courier New');
                    text('!', -30, 25 + 15);
                }

                if (SceneManager.editable && !this.dummy && regions.body.hovering) {
                    noStroke();
                    textSize(16)
                    text(`(${this.inTipe.variableName})`, 20 + Renderer.textWidth(this.text, 'Courier New', 26), 30);

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
            },
            Renderer.regionStub('body', 0, 0, Machine.width, this.bodyHeight),
            Renderer.regionStub('deleteButton', 
                Machine.deleteButtonIndent, Machine.deleteButtonMidline - Machine.deleteButtonWidth/2, 
                20, 20, 
                false)
        );
    }

    onClick() {
        if (this.dummy) {
            editor.pushMachine(this.constructor);
        }
    }

    apply(tipedValue) { return tipedValue; }

    process(values) { return values; }

    reset() {}

    accept(tipedValue) { return this.apply(tipedValue); }

    exclaim() {
        this.exclaimFrames += 90;
    }
}