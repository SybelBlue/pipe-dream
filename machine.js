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
        Renderer.renderObject(Layers.Machine, () => {
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
}

class MapMachine extends Machine {
    get outputTipe() { return this.startingTipe; }
    get height() { return Machine.bodyHeight + this.innerHeight + this.tailHeight; }
    tailHeight = 20;
    get finsished() { return false; }
    get innerHeight() { return this.finsished ? 0 : 20; }
    constructor(inTipe) {
        super(inTipe, color('#E8E288'), 'map');
    }

    draw() {
        super.draw();
        
        Renderer.renderObject(Layers.Machine, () => {
            noStroke();
            fill(this.color);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);
        })
        Renderer.push(this);
        Renderer.translate(Machine.bodyIndent, 0);
        Renderer.pop(this);
        Renderer.renderObject
    }
}