class TextBox {
    static keyListeners = [];

    get value() { return this.text; }
    get height() { 
        return Renderer.textHeight(this.font, this.fontSize) + 10;
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

        TextBox.keyListeners.push(this);
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

    keyDown(key) {
        if (!this.selected) return;
        this.text = !this.used ? key : this.text + key;
        this.used = true;
    }
    backspaceDown() {
        if (this.text.length === 0 || !this.used) return;
        this.text = this.text.substring(0, this.text.length - 1);
        if (this.text.length === 0) {
            this.used = false;
            this.text = this.defaultText;
        }
    }

    reject() { 
        this.used = this.last !== this.defaultText;
        this.text = this.last;
        this._selected = false;
    }

    accept() {
        if (!this.validate()) {
            this.reject();
        } else {
            this.last = this.text;
            this._selected = false;
        }
    }

    validate() { return true; }
}

class FloatBox extends TextBox{
    get value() { return Number.parseFloat(this.last); }
    validate() {
        this.text = this.text.trim();
        const parsed = Number.parseFloat(this.text);
        if (this.text.includes(' ') || Number.isNaN(parsed)) {
            return false;
        }
        this.text = '' + parsed;
        return true;
    }
}

class IntegerBox extends TextBox{
    get value() { return Number.parseInt(this.last); }
    validate() {
        this.text = this.text.trim();
        const parsed = Number.parseInt(this.text);
        if (this.text.includes(' ') || Number.isNaN(parsed)) {
            return false;
        }
        this.text = '' + parsed;
        return true;
    }
}
