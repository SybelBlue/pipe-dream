class TakeMachine extends Machine {
    static inputBoxStart = Machine.bodyHeight;

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
            () => this.inputBox.draw(SceneManager.editable));
    }

    process(values) { return values.slice(0, this.inputBox.value); }

    reset() { this.remaining = this.inputBox.value; }

    accept(tipedValue) { 
        if (this.remaining > 0) {
            this.remaining--;
            return tipedValue;
        }
        return null;
    }
}

class FirstMachine extends Machine {
    finished = true;

    get outputTipe() { return this.inTipe; }

    closedPipeline = false;

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

class DropMachine extends Machine {
    static inputBoxStart = Machine.bodyHeight;

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
            () => this.inputBox.draw(SceneManager.editable));
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
}