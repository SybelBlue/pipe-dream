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

    get outputTipe() { return this.inTipe; }
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
        super.draw();
        
        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();
            fill(Editor.backgroundColor);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);
            
            fill(this.color);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);
        })
        
        Renderer.push(this);

        Renderer.translate(Machine.bodyIndent, Machine.bodyHeight);
        this.drawFragmentStack();

        Renderer.pop(this);

        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();
            fill(this.color);
            rect(0, this.height - MapMachine.tailHeight, Machine.width, MapMachine.tailHeight, 0, 10, 10, 10);
        })
    }

    drawFragmentStack() {
        Renderer.push(this);
        Renderer.translate(Tipe.shapeMidline, 0);
        this.inTipe.drawShape(this.color);
        Renderer.pop(this);

        Renderer.push(this);
        let currentTipe = this.inTipe;
        this.methodStack.forEach(method => {
            method.draw();
            currentTipe = method.outputTipe;
            Renderer.translate(0, TipeMethod.height);
        })
        Renderer.pop(this);
    }

    apply(tipedValue) { 
        return this.methodStack.reduce(function (prev, method) {
            return method.run(prev);
        }, tipedValue);
    }
}