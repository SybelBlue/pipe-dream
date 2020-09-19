class Pipe {
    static lipHeight = 6;
    static mainWidth = 140;
    static edgeWidth = 6;
    static innerWidth = Pipe.mainWidth - 2 * Pipe.edgeWidth;
    static height = 100;

    static get edgeColor() { return color(240); }

    static draw(drawTop, drawBottom, shadowTipe=null, height=Pipe.height, darken=false) {
        const innerColor = darken ? color(50) : color(100);
        if (shadowTipe) {
            Renderer.temporary(this, Pipe.mainWidth/2, 0, () => shadowTipe.drawShadow());
        }

        Renderer.newRenderable(Layers.Pipe, () => {
            noStroke();
            fill(innerColor);
            rect(0, 0, Pipe.mainWidth, height);
        });


        const topOfBottomLip = height - Pipe.lipHeight;

        Renderer.newRenderable(Layers.Pipe, () => {
            fill(Pipe.edgeColor);

            // left half
            beginShape();
            vertex(Pipe.edgeWidth, 0);
            vertex(Pipe.edgeWidth, height);
            // bottom lip
            if (drawBottom) {
                vertex(-Pipe.edgeWidth, height);
                vertex(-Pipe.edgeWidth, topOfBottomLip);
                vertex(0, topOfBottomLip);
            } else {
                vertex(0, height);
            }
            // upper lip
            if (drawTop) {
                vertex(0, Pipe.lipHeight);
                vertex(-Pipe.edgeWidth, Pipe.lipHeight);
                vertex(-Pipe.edgeWidth, 0);
            } else {
                vertex(0, 0);
            }
            endShape(CLOSE);
        });

        Renderer.push(this);
        // right half
        // recenter on upper right corner (w/o lip)
        Renderer.translate(Pipe.mainWidth, 0);
        Renderer.newRenderable(Layers.Pipe, () => {
            beginShape();
            vertex(-Pipe.edgeWidth, 0);
            vertex(-Pipe.edgeWidth, height);
            // bottom lip
            if (drawBottom) {
                vertex(Pipe.edgeWidth, height);
                vertex(Pipe.edgeWidth, topOfBottomLip);
                vertex(0, topOfBottomLip);
            } else {
                vertex(0, height);
            }
            // upper lip
            if (drawTop) {
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
