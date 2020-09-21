class Tray {
    static maxWidth = 230;
    static indent = 10;
    static get background() { return color(20, 20, 25); }

    drawable = [];
    mode = null;

    draw() {
        Renderer.newRenderable(Layers.TrayBackground, function() {
            stroke(80);
            fill(Tray.background);
            rect(0, 0, Tray.maxWidth, editor.height, 0, 20, 20, 0);
        });

        Renderer.push(this);
        Renderer.translate(Tray.indent, 20);
        for (const option of this.drawable) {
            option.draw(() => this.optionClicked(option));
            Renderer.translate(0, option.height + 10);
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
        this.drawable = SceneManager.level.machines;
        this.mode = { type: 'machine' };
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