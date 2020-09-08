class Tray {
    static maxWidth = 230;
    static indent = 10;

    drawable = [];
    mode = null;

    draw() {
        Renderer.push(this);
        Renderer.newRenderable(Layers.TrayBackground, function() {
            stroke(80);
            fill(20, 20, 25);
            rect(0, 0, Tray.maxWidth, editor.height, 0, 20, 20, 0);
        })

        Renderer.translate(Tray.indent, 10);
        for (const option of this.drawable) {
            option.draw(() => this.optionClicked(option));
            Renderer.translate(0, TipeMethod.height + 10);
        }
        Renderer.pop(this);
    }

    loadOptionsFor(tipe={methods:[]}, machine, index) {
        this.drawable = [];
        this.mode = {
            type: 'fragment',
            selectedMachine: machine,
            machineIndex: index,
        };

        for (const key in tipe.methods) {
            this.drawable.push(tipe.methods[key]);
        }
    }

    clearAllOptions() {
        this.loadOptionsFor();
    }

    loadMachineOptions() {
        this.drawable = Machine.machines;
        this.mode = { type: 'machine' };
    }

    optionClicked(option) {
        if (!this.mode) return;
        if (this.mode.type === 'fragment') {
            this.mode.selectedMachine && this.mode.selectedMachine.pushFragment(option, this.machineIndex);
        } else if (this.mode.type === 'machine') {
            console.log('something weird happened');
        }
        this.clearAllOptions();
    }
}

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

        let currentTipe = this.pipeline[i].inTipe;
        // if it doesn't break the pipeline to remove the ith machine...
        if (i + 1 < this.pipeline.length && this.pipeline[i + 1].inTipe.name === currentTipe.name) {
            // cut it out
            this.pipeline.splice(i, 1);
        } else {
            // else truncate the pipeline to a valid state
            this.pipeline = this.pipeline.slice(0, i);
        }
    }

    pushMachine(machineConstructor, ...args) {
        this.pipeline.push(new machineConstructor(this._keyCount++, this.lastOutputTipe, ...args));
    }
}