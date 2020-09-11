class SceneManager {
    static editable = true;

    static level = null;
    static editor = null;

    static startLevel(level) {
        this.level = level;
        return (this.editor = new Editor(level.startingTipe, level.endingTipe, 0, 0, windowWidth, windowHeight));
    }

    static draw() {
        if (!this.editor) return;
        this.editor.draw();

        const focused = Renderer.renderAll().found;
    
        if (!focused && clickThisFrame) {
            editor.tray.loadMachineOptions();
        }
        Renderer.clearStack();
    }
}

class Editor {
    static pipeIndent = 30;
    static darkMargin = 30;
    static get backgroundColor() { return color(100); }

    topMargin = Editor.darkMargin;
    get gutterSize() { return Tray.maxWidth + 50; }
    get pipeGutterSize() { return this.gutterSize + Editor.pipeIndent; }
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
        this.tray = new Tray();
        this.tray.loadMachineOptions();
    }

    draw() {
        Renderer.push(this);
        Renderer.translate(this.x, this.y);
        // if (!this running) {
        this.tray.draw();
        // } else {
        //     Renderer.newRenderable(Layers.UI, (regions) => {
        //         fill(10);
        //         rect(10, 10, 80, 45, 10);

        //         stroke(255, 40, 60);
        //         fill(regions.stopButton.hovering ? 250 : 200, 20, 50);
        //         rect(20, 20, 25, 25);

        //         stroke(30, 30, 255)
        //         fill(20, 20, 250);
        //         rect(55, 20, 10, 25);
        //         rect(70, 20, 10, 25);
        //         if (regions.stopButton.hovering && clickThisFrame) this running = false;
        //     }, Renderer.regionStub('stopButton', 20, 20, 25, 25));
        // }

        Renderer.newRenderable(Layers.Background, () => {
            noStroke();
            fill(Editor.backgroundColor);
            rect(0, 0, this.width, this.height);

            fill(66);
            rect(0, 0, this.width, this.topMargin);
        });

        // set new baseline
        Renderer.translate(0, this.topMargin);

        Renderer.newRenderable(Layers.Background, () => {
            fill(20);
            rect(this.pipeGutterSize + Pipe.edgeWidth, -10, Pipe.innerWidth, 10)
        });

        this.renderPipeline();

        Renderer.newRenderable(Layers.Background, () => {
            const pHeight = this.pipelineHeight;
            const bottomBarHeight = this.pipeTipeChecks ? pHeight : max(pHeight + Pipe.height + 20, this.height - Editor.darkMargin - this.topMargin);

            noStroke();
            fill(66);
            rect(0, bottomBarHeight, this.width, this.height - bottomBarHeight);
            
            fill(20);
            rect(this.pipeGutterSize + Pipe.edgeWidth, bottomBarHeight, Pipe.innerWidth, 10);

            const newMinHeight = bottomBarHeight + Editor.darkMargin + this.topMargin;
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
        
        Renderer.translate(this.pipeGutterSize, 0);
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