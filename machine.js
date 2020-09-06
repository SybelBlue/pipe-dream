class Machine extends PipelineObject {
    static width = Pipe.mainWidth + 2 * Editor.pipeIndent;
    static get textColor() { return color(11); }

    get height() { return 50; }

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
            rect(0, 0, Machine.width, this.height, 10, 10, 10, 0);

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
    get height() { return 50; }
    constructor(inTipe) {
        super(inTipe, color('#E8E288'), 'map');
    }

    draw() {
        super.draw();
    }
}