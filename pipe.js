class Pipe {
    static lipHeight = 6;
    static mainWidth = 140;
    static edgeWidth = 6;
    static innerWidth = Pipe.mainWidth - 2 * Pipe.edgeWidth;
    static height = 100;

    static get edgeColor() { return color(240); }
    static get innerColor() { return color(240 * .2 + 66 * (1.0 - .2)); }

    constructor(drawTop, drawBottom, height=Pipe.height) {
        this.drawTop = drawTop;
        this.drawBottom = drawBottom;
        this.height = height;
    }

    draw(shadowTipe=null) {
        if (shadowTipe) {
            Renderer.temporary(this, Pipe.mainWidth/2, 0, () => shadowTipe.drawShadow());
        }

        Renderer.push(this);
        Renderer.newRenderable(Layers.Pipe, () => {
            if (this.highlighting) {
                const c = mouseIsPressed ? color(200, 20, 200) : color(20, 200, 200);
                stroke(c);
            } else {
                noStroke();
            }

            // interior color
            fill(Pipe.innerColor);
            rect(0, 0, Pipe.mainWidth, this.height);
        });
        

        const topOfBottomLip = this.height - Pipe.lipHeight;

        Renderer.newRenderable(Layers.Pipe, () => {
            fill(Pipe.edgeColor);

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
        });

        // right half
        // recenter on upper right corner (w/o lip)
        Renderer.translate(Pipe.mainWidth, 0);
        Renderer.newRenderable(Layers.Pipe, () => {
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
        });

        Renderer.pop(this);
    }
}
