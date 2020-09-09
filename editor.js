class Editor {
    static gutterSize = Tray.maxWidth + 30;
    static pipeIndent = 30;
    static pipeGutterSize = Editor.gutterSize + Editor.pipeIndent;
    static darkMargin = 30;
    static get backgroundColor() { return color(100); }

    _keyCount = 0;

    get pipeTipeChecks() { return this.endingTipe.name === this.lastOutputTipe.name; }

    get pipelineHeight() {
        return this.pipeline.reduce((sum, pipe) => sum + pipe.height + Pipe.height, Pipe.height);
    }

    get lastOutputTipe() {
        const last = Array.last(this.pipeline);
        return last ? last.outputTipe : this.startingTipe;
    }

    constructor(startingTipe, endingTipe, x, y, width, height) {
        this.startingTipe = startingTipe;
        this.endingTipe = endingTipe;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.minHeight = height;

        this.pipeline = [];
        this.tray = new Tray();
        this.tray.loadMachineOptions();
    }

    draw() {
        Renderer.push(this);
        Renderer.translate(this.x, this.y);
        this.tray.draw();

        Renderer.newRenderable(Layers.Background, () => {
            noStroke();
            fill(Editor.backgroundColor);
            rect(0, 0, this.width, this.height);

            fill(66);
            rect(0, 0, this.width, Editor.darkMargin);
        });

        // set new baseline
        Renderer.translate(0, Editor.darkMargin);

        Renderer.newRenderable(Layers.Background, () => {
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, -10, Pipe.innerWidth, 10)
        });

        this.renderPipeline();

        Renderer.newRenderable(Layers.Background, () => {
            const pHeight = this.pipelineHeight;
            const bottomBarHeight = this.pipeTipeChecks ? pHeight : max(pHeight + Pipe.height + 20, this.height - Editor.darkMargin * 2);

            noStroke();
            fill(66);
            rect(0, bottomBarHeight, this.width, this.height - bottomBarHeight);
            
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, bottomBarHeight, Pipe.innerWidth, 10);

            const newMinHeight = bottomBarHeight + Editor.darkMargin;
            if (newMinHeight > this.minHeight) {
                this.minHeight = newMinHeight;
                if (this.minHeight > height) {
                    requestRescaleCanvas = true;
                }
            }
        });
        Renderer.pop(this);
    }

    renderPipeline() {
        Renderer.push(this);
        
        Renderer.translate(Editor.pipeGutterSize, 0);
        new Pipe(true, false).draw(this.startingTipe);

        Renderer.translate(-Editor.pipeIndent, Pipe.height);
        for (let i = 0; i < this.pipeline.length; i++) {
            const machine = this.pipeline[i];

            machine.draw();
            Renderer.translate(Editor.pipeIndent, machine.height);
            
            new Pipe(false, i == this.pipeline.length - 1 && this.pipeTipeChecks).draw(machine.outputTipe)
            Renderer.translate(-Editor.pipeIndent, Pipe.height);
        }
        Renderer.pop(this);
    }

    removeMachine(key) {
        let i = this.pipeline.findIndex(machine => machine.key === key);
        if (i < 0) throw new Error('removing non existent machine');
        this.pipeline.splice(i, 1);

        this.validatePipeline();
    }

    pushMachine(machineConstructor, ...args) {
        this.pipeline.push(new machineConstructor(this._keyCount++, this.lastOutputTipe, ...args));
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
}