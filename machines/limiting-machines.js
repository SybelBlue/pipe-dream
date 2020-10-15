class TakeMachine extends Machine {
    static inputBoxStart = Machine.bodyHeight;

    description = "A machine that only allows a certain number of things to pass through, then closes the pipe."
    finished = true;

    get height() { return this.bodyHeight; }
    get bodyHeight() { return TakeMachine.inputBoxStart + this.inputBox.height + 10; }

    get outputTipe() { return this.inTipe; }

    get closedPipeline() { return this.remaining <= 0; }

    constructor(key, inTipe) {
        super(key, inTipe, color('#48A9A6'), 'take');
        this.inputBox = new IntegerBox({ defaultText: '3' });
    }

    draw() {
        super.draw();
        Renderer.temporary(this, StackedMachine.bodyIndent, TakeMachine.inputBoxStart, 
            () => this.inputBox.draw(SceneManager.editable && !this.isDummy));
    }

    process(values) { return values.slice(0, this.inputBox.value); }

    reset() { this.remaining = this.inputBox.value; }

    accept(tipedValue) { 
        if (this.remaining > 0) {
            this.remaining--;
            if (this.remaining == 0) {
                this.exclaim();
            }
            return tipedValue;
        }
        return null;
    }

    get transpileText() { return 'limit'; }

    transpile() {
        return `${this.transpileText}(${this.inputBox.value})`;
    }
}

class DropMachine extends Machine {
    static inputBoxStart = Machine.bodyHeight;

    description = "A machine that discards the first x objects that pass through it."
    finished = true;

    get height() { return this.bodyHeight; }

    get bodyHeight() { return DropMachine.inputBoxStart + this.inputBox.height + 10; }

    get outputTipe() { return this.inTipe; }

    constructor(key, inTipe) {
        super(key, inTipe, color('#CE7DA5'), 'drop');
        this.inputBox = new IntegerBox({ defaultText: '3' });
    }

    draw() {
        super.draw();
        Renderer.temporary(this, StackedMachine.bodyIndent, TakeMachine.inputBoxStart, 
            () => this.inputBox.draw(SceneManager.editable && !this.isDummy));
    }

    process(values) { return values.slice(this.inputBox.value); }

    reset() { this.remaining = this.inputBox.value; }

    accept(tipedValue) { 
        if (this.remaining > 0) {
            this.remaining--;
            return null;
        }
        return tipedValue;
    }

    get transpileText() { return 'skip'; }

    transpile() {
        return `${this.transpileText}(${this.inputBox.value})`;
    }
}