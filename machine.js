class Machine extends PipelineObject {
    static width = Pipe.mainWidth + 2 * Editor.pipeIndent;
    static bodyIndent = Editor.pipeIndent;
    static bodyHeight = 50;
    static get textColor() { return color(11); }

    get height() { return Machine.bodyHeight; }

    get outputTipe() { return BallTipe; }

    constructor(inTipe, bodyColor, text) {
        super();

        this.inTipe = inTipe;
        this.color = bodyColor;
        this.text = text;
    }

    draw() {
        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();
            fill(this.color);
            rect(0, 0, Machine.width, Machine.bodyHeight, 10, 10, 10, 0);

            if (this.highlighting) noStroke();
            textSize(16);
            textFont('Georgia');
            fill(Machine.textColor);
            text(this.text, 10, 30);
        });
    }

    apply(tipedValue) { return tipedValue; }
}

class MapMachine extends Machine {
    static tailHeight = 20;

    get outputTipe() { 
        const last = Array.last(this.methodStack);
        return last ? last.outTipe : this.inTipe;
    }
    get height() { return Machine.bodyHeight + this.innerHeight + MapMachine.tailHeight; }
    get finsished() { return true; }
    get innerHeight() { return this.methodStack.length * TipeMethod.height + (this.finsished ? 0 : 20); }

    methodStack = [];

    constructor(inTipe) {
        super(inTipe, color('#E8E288'), 'map');
        this.methodStack.push(inTipe.methods['absoluteValue']);
        this.methodStack.push(inTipe.methods['isPositive']);
    }

    draw() {
        // draw body
        super.draw();
        
        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();

            // clean interior
            fill(Editor.backgroundColor);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);

            // draw arm
            fill(this.color);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);

            // draw tail
            rect(0, this.height - MapMachine.tailHeight, Machine.width, MapMachine.tailHeight, 0, 10, 10, 10);
        })
        
        // draw fragment stack
        Renderer.push(this);

        Renderer.translate(Machine.bodyIndent, Machine.bodyHeight);
        this.drawFragmentStack();

        Renderer.pop(this);
    }

    drawFragmentStack() {
        Renderer.push(this);
        Renderer.translate(Tipe.shapeMidline, 0);
        this.inTipe.drawShape(this.color);
        Renderer.pop(this);

        Renderer.push(this);
        let currentTipe = this.inTipe;
        this.methodStack.forEach((method, index) => {
            method.draw(() => {
                editor.tray.loadOptionsFor(method.outTipe, this, index);
                this.fragmentClicked(method, index);
            });
            currentTipe = method.outputTipe;
            Renderer.translate(0, TipeMethod.height);
        })
        Renderer.pop(this);
    }

    fragmentClicked() { console.log('click within machine'); }

    pushFragment(fragment, sourceIndex) { 
        this.methodStack.splice(sourceIndex + 1, this.methodStack.length - sourceIndex - 1, fragment);
    }

    apply(tipedValue) { 
        return this.methodStack.reduce(function (prev, method) {
            return method.run(prev);
        }, tipedValue);
    }
}