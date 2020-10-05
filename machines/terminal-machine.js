class TerminalMachine extends Machine {
    get properOutputTipe() { return this.outputTipe; }
    isTerminal = true;
    finished = true;
    closedPipeline = false;
}

class FirstMachine extends TerminalMachine {
    get outputTipe() { return this.inTipe; }

    description = "A machine that finishes the pipe, and returns the first object that enters."

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

class CountMachine extends TerminalMachine {
    isGreedy = true;
    outputTipe = NumberTipe;
    description = "A machine that finishes the pipe, and returns the number of things that enter."
    get value() { return NumberTipe.new(this.count); }

    count = 0;
    constructor(key, inTipe) {
        super(key, inTipe, color('#C14953'), 'count');
    }

    process(values) { return NumberTipe.new(values.length); }

    reset() { this.count = 0; }

    accept(tipedValue) { this.count++; return null; }
}

// sortBy machine requires stacked greedy

// reduce machine requires double stacked greedy