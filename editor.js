class Editor {
    static pipeIndent = 30;
    static darkMargin = 30;
    static get backgroundColor() { return color(100); }
    static get darkMarginColor() { return color(66); }

    static topMargin = Editor.darkMargin;
    static gutterSize = Tray.maxWidth + 50;
    static pipeGutterSize = Editor.gutterSize + Editor.pipeIndent;

    static get pipelineMidline() { return Editor.gutterSize + Machine.width / 2; }

    _keyCount = 0;

    get outputTipe() { return this.pipeline.outputTipe || this.startingTipe; }

    get pipeTipeChecks() { return this.endingTipe.name === this.outputTipe.name; }

    pipeline = new Pipeline();

    constructor(startingTipe, endingTipe, x, y, width, height) {
        this.startingTipe = startingTipe;
        this.endingTipe = endingTipe;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.minHeight = height;
    }

    draw() {
        Renderer.push(this);
        Renderer.translate(this.x, this.y);

        Renderer.newRenderable(Layers.Background, () => {
            noStroke();
            fill(Editor.backgroundColor);
            rect(0, 0, this.width, this.height);

            fill(Editor.darkMarginColor);
            rect(0, 0, this.width, Editor.topMargin);
        });

        // set new baseline
        Renderer.translate(0, Editor.topMargin);

        this.pipeline.draw(this.startingTipe, this.pipeTipeChecks);

        Renderer.newRenderable(Layers.Background, () => {
            // pipe inlet shadow
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, -10, Pipe.innerWidth, 10)

            const pHeight = this.pipeline.height;
            const bottomBarHeight = this.pipeTipeChecks ? pHeight : max(pHeight + Pipe.height + 20, this.height - Editor.darkMargin - Editor.topMargin);

            // bottom bar
            noStroke();
            fill(Editor.darkMarginColor);
            rect(0, bottomBarHeight, this.width, this.height - bottomBarHeight);

            // pipe outlet shadow
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, bottomBarHeight, Pipe.innerWidth, 10);

            // flag for new height if necessary
            const newMinHeight = bottomBarHeight + Editor.darkMargin + Editor.topMargin;
            if (newMinHeight > this.minHeight) {
                this.minHeight = newMinHeight;
                if (this.minHeight > height) {
                    requestRescaleCanvas = true;
                }
            }
        });
        Renderer.pop(this);
    }

    removeMachine(key) {
        let i = this.pipeline.findIndex(machine => machine.key === key);
        if (i < 0) throw new Error('removing non existent machine');
        this.pipeline.splice(i, 1);

        this.validatePipeline();
    }

    pushMachine(machineConstructor, ...args) {
        this.pipeline.push(new machineConstructor(this._keyCount++, this.outputTipe, ...args));
    }

    validatePipeline() {
        let i = 0;
        let currentTipe = this.startingTipe.name;

        while (i < this.pipeline.length && currentTipe === this.pipeline[i].inTipe.name) {
            currentTipe = this.pipeline[i].outputTipe.name;
            i++;
        }

        this.pipeline = this.pipeline.slice(0, i);
    }

    acceptValue(tipedValue) {
        let value = tipedValue;
        for (const machine of this.pipeline) {
            if (!machine.finished) {
                throw new Error('pipeline not finished');
            }

            value = machine.apply(value);

            if (!exists(value, false)) {
                return null;
            }
        }

        return value;
    }
}