class InputBox {
    static keyListeners = [];
    static boxMaxLength = 150;
    static margin = 5;

    get boxMaxChars() { return floor((InputBox.boxMaxLength - 2 * InputBox.margin) / Renderer.textWidth(' ', this.fontSize, this.font)); }
    get value() { return this.text; }
    get height() { return Renderer.textHeight(this.fontSize, this.font) + 2 * InputBox.margin; }
    get width() { 
        return max(
            20, 
            Renderer.textWidth(
                this.selected ? this.text : this.text.substring(0, this.boxMaxChars),
                this.fontSize,
                this.font
            ) + 2 * InputBox.margin
        );
    }

    enforceCharLimit = false;

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

        this.font = config.font || Renderer.defaultFont;
        this.fontSize = config.fontSize || 16;

        InputBox.keyListeners.push(this);
    }

    draw(interactable=true) {
        const width = this.width;
        const height = this.height;

        Renderer.newRenderable(Layers.UI, 
            (regions) => {
                if (interactable && clickThisFrame) {
                    this.selected = regions.body.clicked;
                }

                fill(this.selected ? color(100, 200, 200) : color(200));
                rect(0, 0, width, height);

                let displayText = this.text.substring(0);
                if (!this.selected && displayText.length > this.boxMaxChars) {
                    displayText = displayText.substring(0, this.boxMaxChars - 1) + '…';
                }

                stroke(10);
                fill(this.used ? 0 : 50);
                textSize(this.fontSize);
                textFont(this.font);
                text(displayText, InputBox.margin, InputBox.margin + height / 2);
            },
            Renderer.regionStub('body', 0, 0, width, height)
        )
    }

    keyDown(key) {
        if (!this.selected || (this.enforceCharLimit && this.text.length >= this.boxMaxChars)) return;
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

class FloatBox extends InputBox {
    enforceCharLimit = true;

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

class IntegerBox extends InputBox {
    enforceCharLimit = true;

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
