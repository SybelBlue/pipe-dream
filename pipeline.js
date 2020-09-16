class Pipeline extends Array /* of Machines */ {
    get finished() { return !this.find(machine => !machine.finished); }

    get closed() { return !!this.find(machine => machine.closedPipeline); }

    get height() {
        return this.reduce(
            (sum, machine) => sum + machine.height + Pipe.height, 
            this.terminalMachine ? 0 : Pipe.height
        );
    }

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
        new Pipe(true, this.length == 0).draw(showOutputShadow ? startingTipe : null);

        Renderer.translate(-Editor.pipeIndent, Pipe.height);
        for (let i = 0; i < this.length; i++) {
            const machine = this[i];
            machine.draw();

            Renderer.translate(0, machine.height);
            
            if (!machine.isTerminal) { 
                Renderer.temporary(this, Editor.pipeIndent, 0, 
                    () => new Pipe(false, i == this.length - 1 && completed)
                            .draw(showOutputShadow ? machine.outputTipe : null));
            }

            Renderer.translate(0, Pipe.height);
        }
        Renderer.pop(this);
    }

    push(...args) {
        if (this.terminalMachine) {
            console.warn('aborted push!');
            return false;
        }
        super.push(...args);
        return true;
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