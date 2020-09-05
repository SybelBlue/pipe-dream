class Machine extends PipelineObject {
    static width = Pipe.mainWidth + 2 * Editor.pipeIndent;
    static get textColor() { return color(11); }

    height = 100;

    get outputTipe() { return BallTipe; }

    constructor(bodyColor, text) {
        super();

        this.color = bodyColor;
        this.text = text;
    }

    draw() {
        Renderer.push(this);
        Renderer.renderObject(Layers.Machine, () => {
            if (this.highlighting) {
                stroke(0);
            } else {
                noStroke();
            }
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

    testHighlight(x, y) {
        this.highlighting =
            0 <= x && x <= Machine.width &&
            0 <= y && y <= this.height;
    }
}

class MapMachine extends Machine {
    // constructor
}