class TipeMethod {
    static font = Renderer.defaultFont;
    static fontSize = 20;
    static basicHeight = 25;

    showName = true;

    get height() { return TipeMethod.basicHeight; }
    get width() {
        return Renderer.textWidth(this.name, TipeProperty.fontSize, TipeProperty.font) + 10 + Tipe.shapeIndent;
    }

    constructor(name, inTipe, outTipe, compute, prewrapped=false) {
        this.name = name;
        this.inTipe = inTipe;
        this.outTipe = outTipe;
        this.compute = prewrapped ? compute : 
            function(tipedValue) { return outTipe.new(compute(tipedValue)); }
    }

    graftOnto(object, _defaults) {
        object[this.name] = (tipedValue) => this.run(object, tipedValue);
        object[this.name].outTipe = this.outTipe;
        object[this.name].inTipe = this.inTipe;
    }

    run(tipedValue) {
        if (tipedValue.tipe.name !== this.inTipe.name) {
            throw new Error('mismatched in tipes!', tipedValue, this);
        }
        const out = this.compute(tipedValue);
        if (out.tipe.name !== this.outTipe.name) {
            throw new Error('mismatched out tipes!', out, this);
        }
        return out;
    }

    // expects upper left corner is baseline
    draw(onClick) {
        Renderer.newRenderable(Layers.CodeFragment, 
            (regions) => {
                if (regions.fragment.clicked && onClick) onClick();

                stroke(SceneManager.editable && regions.fragment.hovering ? 255 : 0, 0, 0);
                fill(this.outTipe.color);
                textFont(TipeMethod.font);
                textSize(TipeMethod.fontSize);
                rect(0, 0, this.width, this.height, 0, 10, 10, 0);
                if (this.showName) {
                    fill(0);
                    text(this.name, Tipe.shapeIndent + 5, textAscent());
                }
            },
            Renderer.regionStub('fragment', 0, 0, this.width, this.height)
        );

        Renderer.temporary(this, Tipe.shapeMidline, this.height, () => this.outTipe.drawShape(this.outTipe.color));
    }

    // expects upper left corner is baseline
    drawWithDeleteButton(onClick, onDelete) {
        this.draw(onClick);

        const mWidth = this.width;
        const mHeight = this.height;
        const midline = mHeight * 0.5
        const halfWidth = midline * 0.5;
        const start = mWidth + 5;

        Renderer.newRenderable(Layers.UI, 
            (regions) => {
                if (!regions.fragment.hovering && !regions.deleteButton.hovering) return;
                if (regions.deleteButton.clicked) onDelete();

                stroke(255, 20, 20);
                strokeWeight(3);
                line(
                    start, midline - halfWidth, 
                    start + 2 * halfWidth, midline + halfWidth
                );
                line(
                    start, midline + halfWidth, 
                    start + 2 * halfWidth, midline - halfWidth
                );
            },
            Renderer.regionStub('fragment', 0, 0, start, mHeight, false), // so it doesn't block draw collider
            Renderer.regionStub('deleteButton', start, midline - halfWidth, 2 * halfWidth, 2 * halfWidth)
        );
    }
}

class TipeProperty extends TipeMethod {
    constructor(name, inTipe, outTipe) {
        super(name, inTipe, outTipe, function(self) { return self[name]; }, true);
    }

    graftOnto(object, defaults) {
        object[this.name] = 
            defaults[this.name] ? 
                (defaults[this.name].tipe ? defaults[this.name] : this.outTipe.new(defaults[this.name])) : 
                this.outTipe.new();
    }
}

class UIMethod extends TipeMethod {
    get height() {
        return this.inputBox.height + 8;
    }

    get width() {
        return this.inputBox.width + 10 + Tipe.shapeIndent;
    }

    constructor(name, inTipe, outTipe, inputBox, compute) {
        super(name, inTipe, outTipe, compute, true);
        this.inputBox = inputBox;
        this.showName = false;
    }

    draw(onClick) {
        super.draw(onClick);
        Renderer.temporary(this, Tipe.shapeIndent, 4, () => this.inputBox.draw(SceneManager.editable));
    }
}
