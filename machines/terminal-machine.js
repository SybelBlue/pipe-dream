class TerminalMachine extends Machine {
    constructor(key, inTipe, bodyColor, text) {
        super(key, inTipe, bodyColor, text);
        TerminalMachine.makeTerminal(this);
    }

    static makeTerminal(obj) {
        // get properOutputTipe() { return this.outputTipe; }
        Object.defineProperty(obj, 'properOutputTipe', {
            enumerable: true,
            get() { return this.outputTipe; },
        });
        obj.isTerminal = true;
        obj.finished = true;
        obj.resilient = true;
        Object.defineProperty(obj, 'closedPipeline', { value: false });
    }
}

class GreedyMachine extends Machine {
    constructor(key, inTipe, bodyColor, text) {
        super(key, inTipe, bodyColor, text);
        GreedyMachine.makeGreedy(this);
    }

    static makeGreedy(obj) {
        obj.isGreedy = true;
    }
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
    outputTipe = NumberTipe;
    description = "A machine that finishes the pipe, and returns the number of things that enter."
    get value() { return NumberTipe.new(this.count); }

    count = 0;
    constructor(key, inTipe) {
        super(key, inTipe, color('#C14953'), 'count');
        GreedyMachine.makeGreedy(this);
    }

    process(values) { return NumberTipe.new(values.length); }

    reset() { this.count = 0; }

    accept(tipedValue) { this.count++; return null; }
}

// broken still, need infrastructure for releasing values in test
// class SortMachine extends TipedStackMachine {
//     description = "A machine that sorts objects based on a numeric property."
//     innerOutputTipe = NumberTipe;

//     get value() { return this.process(stored); }

//     constructor(key, inTipe) {
//         super(key, inTipe, color('#70877F'), 'sortBy');
//         GreedyMachine.makeGreedy(this);
//     }
    
//     apply(tipedValue) { return tipedValue; }

//     process(values) {
//         if (this.finished) {
//             values.sort((a, b) => super.apply(a) - super.apply(b));
//         }
//         return values;
//     }

//     stored = [];

//     reset() { this.stored = []; }

//     accept(tipedValue) {
//         this.stored.push(tipedValue);
//         return null;
//     }
// }

// needs special onclick?
// class ReduceMachine extends TipedStackMachine {
//     get innerOutputTipe() { return this.inTipe; }
//     get properOutputTipe() { return this.outputTipe; }

//     get outputTipe() { return this.inTipe; }
    
//     constructor(key, inTipe) {
//         super(key, inTipe, color('#454372'), 'reduce');
//         TerminalMachine.makeTerminal(this);
//         GreedyMachine.makeGreedy(this);

//         this.resilient = false;
//     }

//     process(values) { return NumberTipe.new(values.length); }

//     reset() { this.count = 0; }

//     accept(tipedValue) { this.count++; return null; }
// }