class TextBox {
    get height() { return Renderer.textHeight(this.font, this.fontSize) + 10; }
    get width() { return max(20, Renderer.textWidth(this.text, this.font, this.fontSize) + 10); }
    
    selected = false;
    used = false;

    constructor(config={}) {
        this.defaultText = config.defaultText || '';
        this.text = this.defaultText;

        this.font = config.font || 'Courier New';
        this.fontSize = config.fontSize || 16;
    }

    draw(layer=Layers.CodeFragment) {
        const width = this.width;
        const height = this.height;

        Renderer.newRenderable(layer, 
            (regions) => {
                if (clickThisFrame) {
                    const hasFocus = regions.body.hovering;
                    if (this.selected && !hasFocus) {
                        this.validate();
                    }
                    this.selected = hasFocus;
                }

                text(this.text, 5, 5);
                fill(255);
                rect(0, 0, width, height);
            },
            Renderer.regionStub('body', 0, 0, width, height)
        )
    }

    keyDown(key) {
        if (!selected) return;
        this.text = !used && this.text === this.defaultText ? key : this.text + key;
        this.used = true;
    }

    backspaceDown() {
        if (!this.text.length) return;
        this.text = this.text.substring(0, this.length - 1);
        if (!this.text.length) {
            this.used = false;
            this.text = this.defaultText;
        }
    }

    valiate() {}
}