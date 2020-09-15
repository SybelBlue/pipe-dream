class Editor {
    static pipeIndent = 30;
    static darkMargin = 30;
    static get backgroundColor() { return color(100); }

    static topMargin = Editor.darkMargin;
    static gutterSize = Tray.maxWidth + 50;
    static pipeGutterSize = Editor.gutterSize + Editor.pipeIndent;

    static get pipelineMidline() { return Editor.gutterSize + Machine.width / 2; }

    get pipelineFinished() { return !this.pipeline.find(machine => !machine.finished); }

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
    }

    draw() {
        Renderer.push(this);
        Renderer.translate(this.x, this.y);
        
        Renderer.newRenderable(Layers.Background, () => {
            noStroke();
            fill(Editor.backgroundColor);
            rect(0, 0, this.width, this.height);

            fill(66);
            rect(0, 0, this.width, Editor.topMargin);
        });

        // set new baseline
        Renderer.translate(0, Editor.topMargin);

        Editor.drawPipeline(this.pipeline, this.startingTipe, this.pipeTipeChecks);

        Renderer.newRenderable(Layers.Background, () => {
            // pipe inlet shadow
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, -10, Pipe.innerWidth, 10)

            const pHeight = this.pipelineHeight;
            const bottomBarHeight = this.pipeTipeChecks ? pHeight : max(pHeight + Pipe.height + 20, this.height - Editor.darkMargin - Editor.topMargin);

            // bottom bar
            noStroke();
            fill(66);
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

    static drawPipeline(pipeline, startingTipe=null, completed=true) {
        Renderer.push(this);
        const showOutputShadow = exists(startingTipe, false);
        
        Renderer.translate(Editor.pipeGutterSize, 0);
        new Pipe(true, pipeline.length == 0).draw(showOutputShadow ? startingTipe : null);

        Renderer.translate(-Editor.pipeIndent, Pipe.height);
        for (let i = 0; i < pipeline.length; i++) {
            const machine = pipeline[i];
            machine.draw();

            Renderer.translate(Editor.pipeIndent, machine.height);
            new Pipe(false, i == pipeline.length - 1 && completed).draw(showOutputShadow ? machine.outputTipe : null);

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