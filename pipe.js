class Pipe {
    static lipHeight = 6;
    static mainWidth = 140;
    static edgeWidth = 6;
    static innerWidth = Pipe.mainWidth - 2 * Pipe.edgeWidth;
    static height = 100;

    static get edgeColor() { return color(240); }
    static get innerColor() { return color(240 * .2 + 66 * (1.0 - .2)); }

    constructor(drawTop, drawBottom) {
        this.drawTop = drawTop;
        this.drawBottom = drawBottom;
    }

    draw(shadowTipe=null) {
        if (shadowTipe) {
            Renderer.push(this);
            Renderer.translate(Pipe.mainWidth/2, 0);
            shadowTipe.drawShadow();
            Renderer.pop(this);
        }
        Renderer.push(this);
        Renderer.renderObject(Layers.Pipe, () => {
            if (this.highlighting) {
                const c = mouseIsPressed ? color(200, 20, 200) : color(20, 200, 200);
                stroke(c);
            } else {
                noStroke();
            }

            // interior color
            fill(Pipe.innerColor);
            rect(0, 0, Pipe.mainWidth, Pipe.height);
        });
        

        const topOfBottomLip = Pipe.height - Pipe.lipHeight;

        Renderer.renderObject(Layers.Pipe, () => {
            fill(Pipe.edgeColor);

            // left half
            beginShape();
            vertex(Pipe.edgeWidth, 0);
            vertex(Pipe.edgeWidth, Pipe.height);
            // bottom lip
            if (this.drawBottom) {
                vertex(-Pipe.edgeWidth, Pipe.height);
                vertex(-Pipe.edgeWidth, topOfBottomLip);
                vertex(0, topOfBottomLip);
            } else {
                vertex(0, Pipe.height);
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
        });

        // right half
        // recenter on upper right corner (w/o lip)
        Renderer.translate(Pipe.mainWidth, 0);
        Renderer.renderObject(Layers.Pipe, () => {
            beginShape();
            vertex(-Pipe.edgeWidth, 0);
            vertex(-Pipe.edgeWidth, Pipe.height);
            // bottom lip
            if (this.drawBottom) {
                vertex(Pipe.edgeWidth, Pipe.height);
                vertex(Pipe.edgeWidth, topOfBottomLip);
                vertex(0, topOfBottomLip);
            } else {
                vertex(0, Pipe.height);
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
        });

        Renderer.pop(this);
    }

    testHighlight(x, y) {
        this.highlighting =
            0 <= x && x <= Pipe.mainWidth &&
            0 <= y && y <= Pipe.height;
    }
}
