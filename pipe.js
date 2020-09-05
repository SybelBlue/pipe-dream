class Pipe {
    static lipHeight = 6;
    static mainWidth = 140;
    static edgeWidth = 6;
    static innerWidth = Pipe.mainWidth - 2 * Pipe.edgeWidth;

    static get edgeColor() { return color(240); }
    static get innerColor() { return color(240 * .2 + 66 * (1.0 - .2)); }

    constructor(y, height, drawTop, drawBottom) {
        this.y = y;
        this.height = height;
        this.drawTop = drawTop;
        this.drawBottom = drawBottom;
    }

    draw() {
        push();

        if (this.highlighting) {
            const c = mouseIsPressed ? color(200, 20, 200) : color(20, 200, 200);
            stroke(c);
        } else {
            noStroke();
        }

        // center the coordinate system on upper left corner (w/o lip)
        translate(Editor.pipeGutterSize, this.y);

        // interior color
        fill(Pipe.innerColor);
        rect(0, 0, Pipe.mainWidth, this.height);
        

        fill(Pipe.edgeColor);

        const topOfBottomLip = this.height - Pipe.lipHeight;

        // left half
        beginShape();
        vertex(Pipe.edgeWidth, 0);
        vertex(Pipe.edgeWidth, this.height);
        // bottom lip
        if (this.drawBottom) {
            vertex(-Pipe.edgeWidth, this.height);
            vertex(-Pipe.edgeWidth, topOfBottomLip);
            vertex(0, topOfBottomLip);
        } else {
            vertex(0, this.height);
        }
        // upper lip
        if (this.drawTop) {
            vertex(0, Pipe.lipHeight);
            vertex(-Pipe.edgeWidth, Pipe.lipHeight);
            vertex(-Pipe.edgeWidth, 0);
        } else {
            vertex(0, 0);
        }
        endShape(CLOSE);

        // right half
        // recenter on upper right corner (w/o lip)
        translate(Pipe.mainWidth, 0);

        beginShape();
        vertex(-Pipe.edgeWidth, 0);
        vertex(-Pipe.edgeWidth, this.height);
        // bottom lip
        if (this.drawBottom) {
            vertex(Pipe.edgeWidth, this.height);
            vertex(Pipe.edgeWidth, topOfBottomLip);
            vertex(0, topOfBottomLip);
        } else {
            vertex(0, this.height);
        }
        // upper lip
        if (this.drawTop) {
            vertex(0, Pipe.lipHeight);
            vertex(Pipe.edgeWidth, Pipe.lipHeight);
            vertex(Pipe.edgeWidth, 0);
        } else {
            vertex(0, 0);
        }
        endShape(CLOSE);

        pop();
    }

    testHighlight(x, y) {
        this.highlighting =
            Editor.pipeGutterSize <= x && x <= Editor.pipeGutterSize + Pipe.mainWidth &&
            this.y <= y && y <= this.y + this.height;
    }
}
