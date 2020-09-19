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
        const topOfBottomLip = height - Pipe.lipHeight;

        Renderer.newRenderable(Layers.Pipe, () => {
            // background
            noStroke();
            fill(innerColor);
            rect(0, 0, Pipe.mainWidth, height);
            
            fill(Pipe.edgeColor);

            stroke(0);
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

class Conveyor extends Pipe {
    static seamGap = 20;
    static framesPerMovement = 1;

    static draw(shadowTipe=null, height=Conveyor.height) {
        if (shadowTipe) {
            Renderer.temporary(this, Conveyor.mainWidth/2, 0, () => shadowTipe.drawShadow());
        }

        Renderer.newRenderable(Layers.Pipe, () => {
            // background
            noStroke();
            fill(75);
            rect(0, 0, Conveyor.mainWidth, height);
            
            const offset = floor(frameCount / this.framesPerMovement) % this.seamGap;

            const fullSeams = floor(height / this.seamGap);
            const numOfSeams = fullSeams + (offset < height % this.seamGap ? 1 : 0);
            for (let i = 0; i < numOfSeams; i++) {
                fill(25);
                const start = i * this.seamGap + offset;
                rect(0, start, Conveyor.mainWidth, min(2, height - start));
            }
        });
    }
}
