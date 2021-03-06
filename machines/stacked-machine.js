class StackedMachine extends Machine {
    static tailHeight = 20;

    get outputTipe() { 
        const last = Array.last(this.methodStack);
        return last ? last.outTipe : this.inTipe;
    }
    get height() { return Machine.bodyHeight + this.innerHeight + StackedMachine.tailHeight; }
    get finished() { return true; }
    get innerHeight() { return max(10, Array.sum(this.methodStack.map(m => m.height)) + (this.finished ? 0 : 20)); }

    get innerBackgroundColor() {
        const marginColor = this.isTerminal && SceneManager.editable && SceneManager.editor.pipeTipeChecks ? Editor.darkMarginColor : Editor.backgroundColor;
        const dummyColor = this.isDummy ? Tray.backgroundColor : marginColor;
        return SceneManager.showPrompt ? SceneManager.promptBackground : dummyColor;
    }

    methodStack = [];

    constructor(key, inTipe, color, text) {
        super(key, inTipe, color, text);
        if (!this.isDummy) {
            SceneManager.tray.loadOptionsFor(this.inTipe, this, 0);
        }
        this.resilient = true;
    }

    draw() {
        // draw body
        super.draw();

        const tailHeight = this.height - StackedMachine.tailHeight;
        Renderer.newRenderable(this.drawLayer, 
            regions => {
                noStroke();

                // clean interior
                fill(this.innerBackgroundColor);
                rect(0, Machine.bodyHeight, Machine.width, this.innerHeight);

                // draw arm
                fill(this.color);
                rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);

                // draw tail
                rect(0, tailHeight, Machine.width, StackedMachine.tailHeight, 0, 10, 10, 10);

                if (SceneManager.editable && !this.isDummy && regions.tail.clicked) {
                    const lastMethod = Array.last(this.methodStack);
                    const trayTipe = lastMethod ? lastMethod.outTipe : this.inTipe;
                    SceneManager.tray.loadOptionsFor(trayTipe, this, this.methodStack.length - 1);
                }
            },
            Renderer.regionStub('tail', 0, tailHeight, Machine.width, StackedMachine.tailHeight)
        );

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

    indicatorOffset(fragmentIndex) { 
        return this.height - StackedMachine.tailHeight - this.methodStack.slice(fragmentIndex + 1).reduce((p, fragment) => p + fragment.height, 0);
    }

    deleteFragment(index) {
        this.resilient = this.methodStack.length === 0;
        this.methodStack = this.methodStack.slice(0, index);
        SceneManager.tray.loadOptionsFor(
            Array.last(this.methodStack) ? Array.last(this.methodStack).outTipe : this.inTipe, 
            this, 
            index
        ); 
        SceneManager.editor.validatePipeline();
    }

    onClick() {
        super.onClick();
        if (!this.isDummy) {
            SceneManager.tray.loadOptionsFor(this.inTipe, this, -1);
        }
    }

    pushFragment(fragment, sourceIndex) {
        this.resilient = false; 
        this.methodStack.splice(sourceIndex + 1, this.methodStack.length - sourceIndex - 1, fragment);
        SceneManager.tray.loadOptionsFor(fragment.outTipe, this, sourceIndex + 1);
        SceneManager.editor.validatePipeline();
    }

    apply(tipedValue) { 
        return this.methodStack.reduce(function (prev, method) {
            return method.run(prev);
        }, tipedValue);
    }

    process(values) { return values.map(x => this.apply(x)).filter(x => exists(x, false)); }

    transpile() {
        const inFunc = this.inTipe.isFunctionTipe;
        const inVarName = inFunc ? 'f' : this.inTipe.variableName;

        if (this.methodStack.length === 0) {
            // import java.util.function.Function
            return `${this.transpileText}(${inVarName} -> ${inVarName} /* does nothing */)`;
        }
        const suffix = ')';
        const methodStackStr = this.methodStack.reduce((prev, method, i) => prev + method.transpile(false, i < this.methodStack.length - 1), '');

        if (this.methodStack.length === 1) {
            if (inFunc) {
                return this.transpileText + `(f -> f.apply` + methodStackStr + suffix;
            }
            return `${this.transpileText}(${this.methodStack[0].transpile(true)})`;
        }
        
        const prefix = `${this.transpileText}(${inVarName} -> ${inFunc ? 'f.apply' : ''}`;
        
        if ((this.innerOutputTipe || this.outputTipe).isFunctionTipe) {
            const paramTipe = this.outputTipe.inTipe;
            const fVarName = paramTipe.variableName;
            return prefix + `(Function<${paramTipe.name}, ${this.outputTipe.outTipe.name}>) (${fVarName} -> ${inVarName + methodStackStr}(${fVarName}))` + suffix;
        }

        return prefix + (inFunc ? '' : inVarName) + methodStackStr + suffix;
    }

    get cacheData() {
        return JSON.stringify(this.methodStack.map(method => { return { name: method.name, data: method.cacheData }; }));
    }

    recieveCacheData(data) {
        for (const methodData of JSON.parse(data)) {
            const outputTipe = Array.last(this.methodStack) ? Array.last(this.methodStack).outTipe : this.inTipe;
            const fragment = outputTipe.methods[methodData.name];
            this.pushFragment(fragment, this.methodStack.length - 1);
            fragment.recieveCacheData(methodData.data);
        }
    }
}

class TipedStackMachine extends StackedMachine {
    get outputTipe() { return this.inTipe; }

    innerOutputTipe = Tipe;

    get finished() { 
        const last = Array.last(this.methodStack);
        return (last ? last.outTipe : this.inTipe).equals(this.innerOutputTipe);
    }

    textSize = 24;

    constructor(key, inTipe, bodyColor, text) {
        super(key, inTipe, bodyColor, text);
    }

    draw() {
        super.draw();

        Renderer.push(this);
        Renderer.translate(Machine.bodyIndent + Tipe.shapeMidline, this.height - MapMachine.tailHeight);
        Renderer.newRenderable(this.drawLayer, () => {
            noStroke();
            fill(this.innerBackgroundColor);
            this.innerOutputTipe.shapeOutline(0)
        });
        Renderer.pop(this);
    }
}