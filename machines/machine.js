class Machine extends PipelineObject {
    static get machines() { 
        return [new MapMachine(-1, Tipe), new FilterMachine(-1, Tipe), new TakeMachine(-1, Tipe)];
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

    textSize = 26;

    get outputTipe() { return BallTipe; }

    textSize = 26;

    constructor(key, inTipe, bodyColor, text) {
        super();

        this.key = key;
        this.inTipe = inTipe;
        this.color = bodyColor;
        this.text = text;
        this.dummy = inTipe.name === Tipe.name;
    }

    draw() {
        Renderer.newRenderable(Layers.Machine, 
            (regions) => {
                if (SceneManager.editable && regions.body.hovering && clickThisFrame) {
                    if (regions.deleteButton.hovering) {
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

                if (SceneManager.editable && !this.dummy && regions.body.hovering) {
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
        } else {
            SceneManager.tray.loadOptionsFor(this.inTipe, this, -1);
        }
    }

    // mainly for debug purposes
    apply(tipedValue) { return tipedValue; }

    process(values) { return values; }
}