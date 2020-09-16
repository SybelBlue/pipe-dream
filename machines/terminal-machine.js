class TerminalMachine extends Machine {
    isTerminal = true;
    greedy = true;
    finished = true;
    closedPipeline = false;
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