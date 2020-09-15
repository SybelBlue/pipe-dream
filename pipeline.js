class Pipeline extends Array /* of Machines */ {
    get finished() { return !this.find(machine => !machine.finished); }

    get closed() { return !!this.find(machine => machine.closedPipeline); }

    get height() {
        return this.reduce((sum, machine) => sum + machine.height + Pipe.height, Pipe.height);
    }

    get outputTipe() {
        const last = Array.last(this);
        return last ? last.outputTipe : null;
    }

    draw(startingTipe=null, completed=true) {
        Renderer.push(this);
        const showOutputShadow = exists(startingTipe, false);

        Renderer.translate(Editor.pipeGutterSize, 0);
        new Pipe(true, this.length == 0).draw(showOutputShadow ? startingTipe : null);

        Renderer.translate(-Editor.pipeIndent, Pipe.height);
        for (let i = 0; i < this.length; i++) {
            const machine = this[i];
            machine.draw();

            Renderer.translate(Editor.pipeIndent, machine.height);
            new Pipe(false, i == this.length - 1 && completed).draw(showOutputShadow ? machine.outputTipe : null);

            Renderer.translate(-Editor.pipeIndent, Pipe.height);
        }
        Renderer.pop(this);
    }
}