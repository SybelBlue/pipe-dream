class Machine extends PipelineObject {
    static width = Pipe.mainWidth + 2 * Editor.pipeIndent;
    static get textColor() { return color(11); }

    constructor(y, height, bodyColor, text) {
        super(y, height);
        
        this.color = bodyColor;
        this.text = text;
        this.drawShadow = true;
    }

    draw() {
        push();
        translate(Editor.gutterSize, this.y);

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

        const radius = Machine.width / 4;

        if (this.drawShadow) {
            // draw shadow output
            BallTipe.drawShadow(2 * radius, this.height, radius);
        }

        BallTipe.draw(2 * radius, this.height + radius, { radius: radius, color: {red: 200, green: 20, blue: 0}});
        pop();
    }

    testHighlight(x, y) {
        this.highlighting =
            Editor.gutterSize <= x && x <= Editor.gutterSize + Machine.width &&
            this.y <= y && y <= this.y + this.height;
    }
}