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
        Renderer.push(this);
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

        const radius = Machine.width / 4;

        Renderer.translate(2 * radius, this.height);
        Renderer.pop(this);
    }

    apply(tipedValue) { return tipedValue; }
}

class MapMachine extends Machine {
    static tailHeight = 20;

    get outputTipe() { return this.inTipe; }
    get height() { return Machine.bodyHeight + this.innerHeight + MapMachine.tailHeight; }
    get finsished() { return false; }
    get innerHeight() { return this.finsished ? 0 : 20; }

    constructor(inTipe) {
        super(inTipe, color('#E8E288'), 'map');
    }

    draw() {
        super.draw();
        
        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();
            fill(this.color);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);
        })
        Renderer.push(this);
        Renderer.translate(Machine.bodyIndent, Machine.bodyHeight);
        this.inTipe.methods['absoluteValue'].draw();

        Renderer.pop(this);
        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();
            fill(this.color);
            rect(0, this.height - MapMachine.tailHeight, Machine.width, MapMachine.tailHeight, 0, 10, 10, 10);
        })
    }

    apply(tipedValue) { tipedValue }
}