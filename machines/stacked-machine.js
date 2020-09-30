class StackedMachine extends Machine {
    static tailHeight = 20;

    get outputTipe() { 
        const last = Array.last(this.methodStack);
        return last ? last.outTipe : this.inTipe;
    }
    get height() { return Machine.bodyHeight + this.innerHeight + StackedMachine.tailHeight; }
    get finished() { return true; }
    get innerHeight() { return max(10, Array.sum(this.methodStack.map(m => m.height)) + (this.finished ? 0 : 20)); }

    methodStack = [];

    constructor(key, inTipe, color, text) {
        super(key, inTipe, color, text);
        if (key >= 0) {
            SceneManager.tray.loadOptionsFor(inTipe, this, 0);
        }
    }

    draw() {
        // draw body
        super.draw();

        Renderer.newRenderable(this.drawLayer, () => {
            noStroke();

            // clean interior
            fill(SceneManager.prompt ? SceneManager.promptBackground : (this.isDummy ? Tray.backgroundColor : Editor.backgroundColor));
            rect(0, Machine.bodyHeight, Machine.width, this.innerHeight);

            // draw arm
            fill(this.color);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);

            // draw tail
            rect(0, this.height - StackedMachine.tailHeight, Machine.width, StackedMachine.tailHeight, 0, 10, 10, 10);
        });

        // draw fragment stack
        Renderer.temporary(this, Machine.bodyIndent, Machine.bodyHeight, () => this.drawFragmentStack());
    }

    drawFragmentStack() {
        Renderer.temporary(this, Tipe.shapeMidline, 0, () => this.inTipe.drawShape(this.color));

        Renderer.push(this);
        let currentTipe = this.inTipe;
        this.methodStack.forEach((method, index) => {
            const onClick = () => {
                if (!SceneManager.editable) return;
                SceneManager.tray.loadOptionsFor(method.outTipe, this, index);
                this.fragmentClicked(method, index);
            }

            if (!SceneManager.editable) {
                method.draw(onClick);
            } else {
                method.drawWithDeleteButton(onClick, () => this.deleteFragment(index));
            }

            // update for next loop
            Renderer.translate(0, method.height);
            currentTipe = method.outputTipe;
        });
        Renderer.pop(this);
    }

    fragmentClicked() { }

    deleteFragment(index) {
        this.methodStack = this.methodStack.slice(0, index);
        SceneManager.tray.loadOptionsFor(
            Array.last(this.methodStack) ? Array.last(this.methodStack).outTipe : this.inTipe, 
            this, 
            index
        ); 
        editor.validatePipeline();
    }

    onClick() {
        super.onClick();
        if (!this.isDummy) {
            SceneManager.tray.loadOptionsFor(this.inTipe, this, -1);
        }
    }

    pushFragment(fragment, sourceIndex) { 
        this.methodStack.splice(sourceIndex + 1, this.methodStack.length - sourceIndex - 1, fragment);
        SceneManager.tray.loadOptionsFor(fragment.outTipe, this, sourceIndex + 1);
        editor.validatePipeline();
    }

    apply(tipedValue) { 
        return this.methodStack.reduce(function (prev, method) {
            return method.run(prev);
        }, tipedValue);
    }

    process(values) { return values.map(x => this.apply(x)).filter(x => exists(x, false)); }
}