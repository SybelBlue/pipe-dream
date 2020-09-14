class ColorPicker {
    get value() { return this.text; }
    get height() { 
        return TipeMethod.;
    }
    get width() { return max(20, Renderer.textWidth(this.text, this.font, this.fontSize) + 10); }

    _selected = false;
    get selected() { return this._selected; }
    set selected(value) {
        if (!value) this.accept();
        this._selected = value;
    }

    used = false;

    constructor(config={}) {
        this.defaultText = config.defaultText || '';
        this.text = this.defaultText;
        this.last = this.defaultText;

        this.font = config.font || 'Courier New';
        this.fontSize = config.fontSize || 16;

        InputBox.keyListeners.push(this);
    }

    draw(layer=Layers.CodeFragment, interactable=true) {
        const width = this.width;
        const height = this.height;

        Renderer.newRenderable(layer, 
            (regions) => {
                if (interactable && clickThisFrame) {
                    this.selected = regions.body.hovering;
                }

                fill(this.selected ? color(100, 200, 200) : color(200));
                rect(0, 0, width, height);

                stroke(10);
                fill(this.used ? 0 : 50);
                textSize(this.fontSize);
                textFont(this.font);
                text(this.text, 5, 5 + height / 2);
            },
            Renderer.regionStub('body', 0, 0, width, height)
        )
    }
}