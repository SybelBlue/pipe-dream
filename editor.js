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

        this.drawTranspilerOutput();
    }

    drawIndicator() {
        const selectedMachine = lens(SceneManager, 'tray', 'mode', 'selectedMachine');
        const fragmentIndex = lens(SceneManager, 'tray', 'mode', 'fragmentIndex');
        if ((!selectedMachine && this.pipeline.terminalMachine) || lens(selectedMachine, 'isTerminal')) return;
        const targetStart = this.pipeline.positionOf(selectedMachine);
        const arrowMidline = targetStart ? targetStart + selectedMachine.indicatorOffset(fragmentIndex) : this.pipeline.height;
        const bobOffset = 3 * sin(frameCount / 10);
        const leftX = Editor.gutterSize - 20 + bobOffset;
        Renderer.newRenderable(Layers.UI, () => {
            fill(0);
            stroke(0);
            strokeWeight(4);
            line(Tray.maxWidth, arrowMidline, leftX + 15, arrowMidline);
            line(leftX + 5, arrowMidline - 5, leftX + 15, arrowMidline);
            line(leftX + 5, arrowMidline + 5, leftX + 15, arrowMidline);
        });
    }

    drawTranspilerOutput() {
        const trayConfig = {
            x: Editor.gutterSize + Machine.width * 2,
            y: Editor.darkMargin * 2,
            margin: 10,
            fontSize: 14
        };

        trayConfig.width = this.width - trayConfig.x;
        trayConfig.lineGap = Renderer.textHeight(trayConfig.fontSize) + 4;
        trayConfig.textWidth = trayConfig.width - 4.5 * trayConfig.margin; // + 2.5*margin for the javadoc/spacing prefixes

        const javaDocs = Renderer.textToLines(`\nTodo:\n${SceneManager.level.prompt}\n`, trayConfig.fontSize, trayConfig.textWidth);
        if (javaDocs.length == 1) {
            javaDocs[0] = '// ' + javaDocs[0];
        } else for (let i = 0; i < javaDocs.length; i++) {
            const line = javaDocs[i];
            if (i == 0) {
                javaDocs[i] = '/**' + line;
            } else if (i == javaDocs.length - 1) {
                javaDocs[i] = ' */' + line;
            } else {
                javaDocs[i] = ' * ' + line;
            }
        }
        
        const transpiledLines = Renderer.textToLines(`return ${SceneManager.transpiled};`, trayConfig.fontSize, trayConfig.textWidth, Renderer.defaultFont, false);
        const justifiedLines = transpiledLines.map((line, i) => {
            if (i == 0 || !line.length) return line;
            return line[0] == '\t' ? line : '    ' + line;
        })
        trayConfig.lines = javaDocs.concat(justifiedLines);


        const linesHeight = (trayConfig.lines.length + 1) * trayConfig.lineGap;
        trayConfig.height = windowHeight < linesHeight ? this.height - trayConfig.y : linesHeight;
        
        if (trayConfig.width < 200) return;

        Renderer.push(this);
        Renderer.translate(trayConfig.x, trayConfig.y);
        Renderer.newRenderable(Layers.TrayBackground, () => {
            stroke(0);
            fill(Pipe.edgeColor);
            rect(0, 0, trayConfig.width, trayConfig.height, 10, 0, 0, 10);
        });

        Renderer.translate(trayConfig.margin, trayConfig.lineGap);
        for (const line of trayConfig.lines) {
            Renderer.newRenderable(Layers.TrayBackground, () => {
                textSize(trayConfig.fontSize);
                stroke(0);
                text(line, 0, 0);
            });

            Renderer.translate(0, trayConfig.lineGap);
        }

        Renderer.pop(this);
    }

    removeMachine(key) {
        let i = this.pipeline.findIndex(machine => machine.key === key);
        if (i < 0) throw new Error('removing non existent machine');
        this.pipeline.splice(i, 1);

        this.validatePipeline();
    }

    pushMachine(machineConstructor, doCache=true) {
        if (this.pipeline.terminalMachine) return;
        
        const machine = new machineConstructor(this._keyCount++, this.outputTipe);
        this.pipeline.push(machine);
        
        if (this.pipeline.terminalMachine && !machine.isReduction) {
            SceneManager.tray.loadMachineOptions();
        }

        if (doCache) {
            SceneManager.cache();
        }

        return machine;
    }

    clearPipeline() {
        this.pipeline = new Pipeline();
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
                    break;
                }
            }
            currentTipe = machine.outputTipe;
        }

        SceneManager.cache();
    }
}