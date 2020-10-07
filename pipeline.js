class Pipeline extends Array /* of Machines */ {
    get finished() { return !this.find(machine => !machine.finished); }

    get closed() { return !!this.find(machine => machine.closedPipeline); }

    get mainHeight() { return this.reduce((sum, machine) => sum + machine.height + Pipe.height, 0); }

    get height() { return this.mainHeight + (this.terminalMachine ? 0 : Pipe.height); }

    get outputTipe() {
        const last = Array.last(this);
        return last ? last.outputTipe : null;
    }

    get terminalMachine() {
        const last = Array.last(this);
        return last && last.isTerminal ? last : null;
    }

    draw(startingTipe=null, completed=true) {
        Renderer.push(this);
        const showOutputShadow = exists(startingTipe);

        Renderer.translate(Editor.pipeGutterSize, 0);
        Pipe.draw(true, this.length == 0, showOutputShadow ? startingTipe : null);

        Renderer.translate(-Editor.pipeIndent, Pipe.height);
        for (let i = 0; i < this.length; i++) {
            const machine = this[i];
            machine.draw();

            Renderer.translate(0, machine.height);
            
            const shadowTipe = showOutputShadow ? machine.outputTipe : null;
            Renderer.temporary(this, Editor.pipeIndent, 0, 
                machine.properOutputTipe.isStream ?
                    () => Pipe.draw(false, i == this.length - 1 && completed, shadowTipe) :
                    () => Conveyor.draw(shadowTipe)
            );

            Renderer.translate(0, Pipe.height);
        }
        Renderer.pop(this);
    }

    push(machine) {
        if (this.terminalMachine) {
            if (machine.isTerminal) {
                this[this.length - 1] = machine;
                return true;
            }
            console.warn('aborted push!');
            return false;
        }
        super.push(machine);
        return true;
    }

    positionOf(machine) {
        if (!machine) return null;
        const index = this.findIndex(m => m.key === machine.key);
        if (index < 0) return null;
        let start = Pipe.height;
        for (let i = 0; i < index; i++) {
            start += this[i].height + Pipe.height;
        }
        return start;
    }

    test(tipedValue) {
        let value = tipedValue;
        for (const machine of this.pipeline) {
            if (!machine.finished) {
                throw new Error('pipeline not finished');
            }

            value = machine.apply(value);

            if (!exists(value)) {
                return null;
            }
        }

        return value;
    }

    process(tipedValues) {
        return this.reduce((prev, machine) => machine.process(prev), tipedValues);
    }
}