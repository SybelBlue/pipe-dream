class Tray {
    static maxWidth = 230;
    static indent = 10;
    static get backgroundColor() { return color(20, 20, 25); }

    static modes = {
        MACHINE: 'machine',
        FRAGMENT: 'fragment'
    };

    get isFragmentMode() {
        return lens(this.mode, 'type') === Tray.modes.FRAGMENT;
    }

    drawable = [];
    mode = null;

    draw() {
        Renderer.newRenderable(Layers.TrayBackground, () => {
            stroke(80);
            fill(Tray.backgroundColor);
            rect(0, 0, !this.drawable || !this.drawable.length ? 30: Tray.maxWidth, SceneManager.editor.height, 0, 20, 20, 0);
        });

        Renderer.push(this);
        Renderer.translate(Tray.indent, 20);
        for (const option of this.drawable) {
            option.draw(() => this.optionClicked(option), true);
            Renderer.translate(0, option.height + 10);
            
            if (this.mode.type !== Tray.modes.FRAGMENT) continue;

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
        this.mode = {
            type: Tray.modes.FRAGMENT,
            selectedMachine: machine,
            fragmentIndex: index,
            reducable: tipe.reductions && machine.isReduce,
        };

        this.drawable = machine.isTerminal && !this.mode.reducable ? [] : Object.values(tipe[this.mode.reducable ? 'reductions' : 'methods']);
    }

    clearAllOptions() {
        this.loadOptionsFor();
    }

    loadMachineOptions() {
        this.mode = { 
            type: Tray.modes.MACHINE, 
            reducable: Boolean(lens(SceneManager.editor, 'outputTipe', 'reductions')), 
        };
        this.drawable = lens(SceneManager.editor, 'pipeline', 'terminalMachine') ? [] : SceneManager.level.machines.filter(m => SceneManager.unsafeMode || !m.isReduce || this.mode.reducable);
    }

    optionClicked(option) {
        if (!this.mode) return;
        if (this.mode.type === Tray.modes.FRAGMENT) {
            if (this.mode.selectedMachine) {
                this.mode.selectedMachine.pushFragment(option, this.mode.fragmentIndex);
            }
        } else if (this.mode.type === Tray.modes.MACHINE) {
            console.log('something weird happened');
        }
    }
}