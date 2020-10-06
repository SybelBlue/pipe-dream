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
        Object.defineProperty(obj, 'isTerminal', { value: true })
        Object.defineProperty(obj, 'finished', { value: false })
        Object.defineProperty(obj, 'resilient', { value: true })
        Object.defineProperty(obj, 'closedPipeline', { value: false });
    }
}

class GreedyMachine extends Machine {
    constructor(key, inTipe, bodyColor, text) {
        super(key, inTipe, bodyColor, text);
        GreedyMachine.makeGreedy(this);
    }

    static makeGreedy(obj) {
        Object.defineProperty(obj, 'isGreedy', { value: true })
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

// class ScanMachine extends TipedStackMachine {
//     description = "A machine that accumulates calculation over time."

//     get innerOutputTipe() { return this.inTipe; }

//     isReduce = true;

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

class ReduceMachine extends TipedStackMachine {
    description = "A machine that reduces a stream down to a single value."

    get innerOutputTipe() { return this.inTipe; }
    get finished() { return this.methodStack.length > 0; }

    isReduce = true;

    get outputTipe() { return this.inTipe; }

    get reductionFn() {
        return
            this.finished ?
                (p, c) => this.methodStack[0].run(c, p) :
                (p, _c) => p;
    }

    constructor(key, inTipe) {
        super(key, inTipe, color('#454372'), 'reduce');
        TerminalMachine.makeTerminal(this);
        GreedyMachine.makeGreedy(this);

        this.resilient = false;
    }

    process(values) { return values.reduce(this.reductionFn); }

    reset() { this.count = 0; }

    accept(tipedValue) { this.count++; return null; }

    pushFragment(fragment, _sourceIndex) { 
        this.methodStack = [fragment];
        SceneManager.tray.loadMachineOptions();
        editor.validatePipeline();
    }
}