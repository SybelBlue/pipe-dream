class TerminalMachine extends Machine {
    isTerminal = true;
    greedy = true;

    finished = true;

    closedPipeline = false;

    constructor(key, inTipe, color, text) {
        super(key, inTipe, color, text);
    }

    draw() {
        super.draw();
    }

    process(values) { return values[0]; }
}

class FirstMachine extends TerminalMachine {
    get outputTipe() { return this.inTipe; }

    constructor(key, inTipe) {
        super(key, inTipe, color('#3D5A80'), 'first');
    }

    process(values) { return values.slice(0, 1); }

    reset() { this.closedPipeline = false; }

    accept(tipedValue) { 
        if (this.closedPipeline) {
            return null;
        }
        this.closedPipeline = true;
        return tipedValue;
    }
}