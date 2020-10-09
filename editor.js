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

    get pipeTipeChecks() { return this.endingTipe.equals(this.outputTipe); }

    pipeline = new Pipeline();

    constructor(startingTipe, endingTipe, width, height) {
        this.startingTipe = startingTipe;
        this.endingTipe = endingTipe;
        this.width = width;
        this.height = height;
        this.minHeight = height;
    }

    draw() {
        Renderer.push(this);
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

        this.drawIndicator();

        Renderer.newRenderable(Layers.Background, () => {
            // pipe inlet shadow
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, -10, Pipe.innerWidth, 10)

            const pHeight = this.pipeline.height;
            const bottomBarHeight = this.pipeTipeChecks ? 
                pHeight - (this.pipeline.terminalMachine ? this.pipeline.terminalMachine.height : 0) : 
                max(pHeight + Pipe.height + 20, this.height - Editor.darkMargin - Editor.topMargin);

            // bottom bar
            noStroke();
            fill(Editor.darkMarginColor);
            rect(0, bottomBarHeight, this.width, this.height - bottomBarHeight);

            if (!this.pipeline.terminalMachine) {
                // pipe outlet shadow
                fill(20);
                rect(Editor.pipeGutterSize + Pipe.edgeWidth, bottomBarHeight, Pipe.innerWidth, 10);
            }

            // flag for new height if necessary
            const newMinHeight = bottomBarHeight + Editor.darkMargin + Editor.topMargin;
            if (newMinHeight > this.minHeight) {
                this.minHeight = newMinHeight;
            }
        });
        Renderer.pop(this);
    }

    drawIndicator() {
        const selectedMachine = lens(SceneManager, 'tray', 'mode', 'selectedMachine');
        if ((!selectedMachine && this.pipeline.terminalMachine) || lens(selectedMachine, 'isTerminal')) return;
        const targetStart = this.pipeline.positionOf(selectedMachine);
        const arrowMidline = targetStart ? targetStart + selectedMachine.indicatorOffset : this.pipeline.height;
        const bobOffset = 3 * sin(frameCount / 10);
        const leftX = Editor.gutterSize - 20 + bobOffset;
        Renderer.newRenderable(Layers.UI, () => {
            fill(255);
            stroke(255);
            strokeWeight(4);
            line(leftX, arrowMidline, leftX + 15, arrowMidline);
            line(leftX + 5, arrowMidline - 5, leftX + 15, arrowMidline);
            line(leftX + 5, arrowMidline + 5, leftX + 15, arrowMidline);
        });
    }

    removeMachine(key) {
        let i = this.pipeline.findIndex(machine => machine.key === key);
        if (i < 0) throw new Error('removing non existent machine');
        this.pipeline.splice(i, 1);

        this.validatePipeline();
    }

    pushMachine(machineConstructor, ...args) {
        if (this.pipeline.terminalMachine) return;
        this.pipeline.push(new machineConstructor(this._keyCount++, this.outputTipe, ...args));
        if (this.pipeline.terminalMachine) SceneManager.tray.loadMachineOptions();
    }

    validatePipeline() {
        let currentTipe = this.startingTipe;
        for (let i = 0; i < this.pipeline.length; i++) {
            const machine = this.pipeline[i];
            if (!currentTipe.equals(machine.inTipe)) {
                if (machine.resilient) {
                    machine.inTipe = currentTipe;
                } else {
                    this.pipeline = this.pipeline.slice(0, i);
                    return;
                }
            }
            currentTipe = machine.outputTipe;
        }
    }
}