class Tray {
    static maxWidth = 230;
    static indent = 10;
    static get backgroundColor() { return color(20, 20, 25); }

    drawable = [];
    mode = null;

    draw() {
        Renderer.newRenderable(Layers.TrayBackground, function() {
            stroke(80);
            fill(Tray.backgroundColor);
            rect(0, 0, Tray.maxWidth, editor.height, 0, 20, 20, 0);
        });

        Renderer.push(this);
        Renderer.translate(Tray.indent, 20);
        for (const option of this.drawable) {
            option.draw(() => this.optionClicked(option), true);
            Renderer.translate(0, option.height + 10);
            if (this.mode.type !== 'fragment') continue;
            const varName = option.outTipe.variableName;
            const textHeight = Renderer.textHeight(16);
            const start = Tray.maxWidth - 2 * Tray.indent - Renderer.textWidth(varName, 16);
            Renderer.newRenderable(Layers.FragmentShape, () => {
                textSize(16);
                fill(255);
                noStroke();
                text(varName, start, textHeight * 0.8);
            });
            Renderer.translate(0, textHeight + 10);
        }
        Renderer.pop(this);
    }

    loadOptionsFor(tipe={methods:[]}, machine, index) {
        console.log('frag ops');
        this.mode = {
            type: 'fragment',
            selectedMachine: machine,
            machineIndex: index,
            reducable: tipe.reductions && machine.isReduce,
        };

        this.drawable = machine.isTerminal ? [] : Object.values(tipe[this.mode.reducable ? 'reductions' : 'methods']);
    }

    clearAllOptions() {
        this.loadOptionsFor();
    }

    loadMachineOptions() {
        console.log('machine ops');
        this.mode = { 
            type: 'machine', 
            reducable: Boolean(lens(SceneManager.editor, 'outputTipe', 'reductions')), 
        };
        this.drawable = lens(SceneManager.editor, 'pipeline', 'terminalMachine') ? [] : SceneManager.level.machines.filter(m => SceneManager.unsafeMode || !m.isReduce || this.mode.reducable);
    }

    optionClicked(option) {
        if (!this.mode) return;
        if (this.mode.type === 'fragment') {
            if (this.mode.selectedMachine) {
                this.mode.selectedMachine.pushFragment(option, this.mode.machineIndex);
            }
        } else if (this.mode.type === 'machine') {
            console.log('something weird happened');
        }
    }
}