class TerminalMachine extends Machine {
    constructor(key, inTipe, bodyColor, text) {
        super(key, inTipe, bodyColor, text);
        TerminalMachine.makeTerminal(this);
    }

    static makeTerminal(obj) {
        Object.defineProperty(obj, 'properOutputTipe', {
            enumerable: true,
            configurable: true,
            get() { return this.outputTipe; },
        });
        Object.defineProperty(obj, 'isTerminal', { configurable: true, value: true })
        Object.defineProperty(obj, 'finished', { configurable: true, value: false })
        Object.defineProperty(obj, 'resilient', { configurable: true, value: true })
        Object.defineProperty(obj, 'closedPipeline', { configurable: true, value: false });
    }
}

class GreedyMachine extends Machine {
    constructor(key, inTipe, bodyColor, text) {
        super(key, inTipe, bodyColor, text);
        GreedyMachine.makeGreedy(this);
    }

    static makeGreedy(obj) {
        Object.defineProperty(obj, 'isGreedy', { configurable: true, value: true })
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

class ScanMachine extends TipedStackMachine {
    description = "A machine that accumulates results and returns the most recent one."

    isReduce = true;
    get innerOutputTipe() { return this.inTipe; }
    get finished() { return this.methodStack.length > 0; }

    get outputTipe() { return this.inTipe; }

    get reductionFn() {
        return this.finished && this.methodStack[0];
    }

    get value() { return this.last; }

    _last = null;
    get last() {
        this.last = this._last;
        return this._last;
    }
    set last(value) { this._last = value || (this.reductionFn ? this.reductionFn.tipedSeed : null); }

    constructor(key, inTipe) {
        super(key, inTipe, color('#7572AC'), 'scan');
        GreedyMachine.makeGreedy(this);

        this.resilient = false;
        if (!this.isDummy) {
            SceneManager.tray.loadOptionsFor(this.inTipe, this, 0);
        }
    }

    process(values) { 
        if (!this.finished || !values.length) return values;
        return values.reduce(
            (p, c) => {
                p.acc.push(p.last = this.reductionFn.run(c, p.last));
                return p;
            },
            { acc: [], last: this.reductionFn.tipedSeed }
        ).acc;
    }

    reset() { this.last = null; }

    accept(tipedValue) {
        if (!this.finished) return tipedValue; 
        this.last = this.reductionFn.run(tipedValue, this.finished ? this.last : this.reductionFn.tipedSeed);

        return this.last;
    }

    pushFragment(fragment, _sourceIndex) { 
        this.methodStack = [fragment];
        SceneManager.tray.loadMachineOptions();
        editor.validatePipeline();
    }
}

class ReduceMachine extends TipedStackMachine {
    description = "A machine that reduces a stream down to a single value."

    isReduce = true;
    get innerOutputTipe() { return this.inTipe; }
    // get finished() { return this.methodStack.length > 0; }

    get outputTipe() { return this.inTipe; }

    get reductionFn() {
        return this.finished && this.methodStack[0];
    }

    get value() { return this.last; }

    _last = null;
    get last() {
        this.last = this._last;
        return this._last;
    }
    set last(value) { this._last = value || (this.reductionFn ? this.reductionFn.tipedSeed : null); }

    constructor(key, inTipe) {
        super(key, inTipe, color('#454372'), 'reduce');
        TerminalMachine.makeTerminal(this);
        GreedyMachine.makeGreedy(this);

        Object.defineProperty(this, 'finished', {
            enumerable: true,
            configurable: true,
            get() { return this.methodStack.length > 0; },
        });

        this.resilient = false;
        if (!this.isDummy) {
            SceneManager.tray.loadOptionsFor(this.inTipe, this, 0);
        }
    }

    process(values) { 
        if (!this.finished) return values;
        if (!values.length) return this.reductionFn.tipedSeed;
        return values.reduce((p, c) => this.reductionFn.run(p, c));
    }

    reset() { this.last = null; }

    accept(tipedValue) {
        if (!this.finished) return null; 
        this.last = this.reductionFn.run(tipedValue, this.finished ? this.last : this.reductionFn.tipedSeed);

        return null;
    }

    pushFragment(fragment, _sourceIndex) { 
        this.methodStack = [fragment];
        SceneManager.tray.loadMachineOptions();
        editor.validatePipeline();
    }
}