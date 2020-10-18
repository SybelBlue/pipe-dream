class TipeMethod {
    static font = Renderer.defaultFont;
    static fontSize = 20;
    static basicHeight = 25;

    showName = true;

    get height() { return TipeMethod.basicHeight; }
    get width() {
        return Renderer.textWidth(this.name, TipeProperty.fontSize, TipeProperty.font) + 10 + Tipe.shapeIndent;
    }

    constructor(name, inTipe, outTipe, compute, documentation='') {
        this.name = name;
        this.inTipe = inTipe;
        this.outTipe = outTipe;
        this.documentation = documentation;
        if (compute) {
            this.compute = tipedValue => outTipe.new(compute(tipedValue));
        }
    }

    graftOnto(object, _defaults) {
        object[this.name] = (tipedValue) => this.run(object, tipedValue);
        object[this.name].outTipe = this.outTipe;
        object[this.name].inTipe = this.inTipe;
    }

    run(tipedValue) {
        if (tipedValue.tipe.name !== this.inTipe.name) {
            console.warn(tipedValue, this);
            throw new Error('mismatched in tipes!');
        }
        const out = this.compute(tipedValue);
        if (out.tipe.name !== this.outTipe.name) {
            throw new Error('mismatched out tipes!', out, this);
        }
        return out;
    }

    // expects upper left corner is baseline
    draw(onClick, _passThrough) {
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

    transpile(asRef=false, hasNext=true) {
        const nonRef = `.${this.name}` + (this.outTipe.isFunctionTipe ? '' : '()');
        return asRef ? `${this.inTipe.name}::${this.name}` : nonRef;
    }

    // get cacheData() { return null; }

    recieveCacheData(_data) { }
}

class TipeProperty extends TipeMethod {
    constructor(name, inTipe, outTipe) {
        super(name, inTipe, outTipe, null);
        this.compute = function(self) { return self[name]; };
    }

    graftOnto(object, defaults) {
        object[this.name] = 
            defaults[this.name] ? 
                (defaults[this.name].tipe ? defaults[this.name] : this.outTipe.new(defaults[this.name])) : 
                this.outTipe.new();
    }

    transpile(asRef=false) {
        const getter = `get${this.name.charAt(0).toUpperCase() + this.name.slice(1)}`;
        return asRef ? `${this.inTipe.name}::${getter}` : `.${getter}()`;
    }
}

class TipeReduction extends TipeMethod {
    constructor(name, tipe, compute, seed) {
        super(name, tipe, tipe, null);
        this.tipedSeed = tipe.new(seed);
        this.compute = (tipedValue, tipedPrev) => this.outTipe.new(compute(tipedPrev, tipedValue));
    }

    run(tipedValue, tipedPrev=this.tipedSeed) {
        if (!tipedValue.tipe.equals(this.inTipe) || !tipedPrev.tipe.equals(this.inTipe)) {
            console.warn(tipedValue, this);
            throw new Error('mismatched in tipes!');
        }
        const out = this.compute(tipedValue, tipedPrev);
        if (out.tipe.name !== this.outTipe.name) {
            throw new Error('mismatched out tipes!', out, this);
        }
        return out;
    }

    transpile(_asRef=false) {
        return `${this.inTipe.name}::${this.name}`;
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
        super(name, inTipe, outTipe, null);
        this.compute = compute;
        this.inputBox = inputBox;
        this.showName = false;
    }

    draw(onClick, passThrough=false) {
        super.draw(onClick);
        this.inputBox.onClick = passThrough ? onClick : () => {};
        Renderer.temporary(this, Tipe.shapeIndent, 4, () => this.inputBox.draw(SceneManager.editable));
    }

    transpile(asRef) {
        return `(${this.inputBox.transpileValue})`;
    }

    get cacheData() { return this.inputBox.cacheData; }

    recieveCacheData(data) { this.inputBox.recieveCacheData(data); }
}
