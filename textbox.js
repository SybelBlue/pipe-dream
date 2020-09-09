class TextBox {
    static keyListeners = [];

    get height() { return Renderer.textHeight(this.font, this.fontSize) + 10; }
    get width() { return max(20, Renderer.textWidth(this.text, this.font, this.fontSize) + 10); }

    selected = false;
    used = false;

    constructor(config={}) {
        this.defaultText = config.defaultText || '';
        this.text = this.defaultText;
        this.last = this.defaultText;

        this.font = config.font || 'Courier New';
        this.fontSize = config.fontSize || 16;

        TextBox.keyListeners.push(this);
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

                fill(this.selected ? color(20, 200, 200) : color(200));
                rect(0, 0, width, height);

                fill(this.used ? 0 : 100);
                stroke(0);
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
        this.selected = false;
    }

    accept() {
        if (!this.validate()) {
            this.reject();
        } else {
            this.last = this.text;
            this.selected = false;
        }
    }

    validate() {
        return true;
    }
}

class NumberBox extends TextBox{
    get value() { return Number.parseFloat(this.text); }
    validate() {
        this.text = this.text.trim();
        return !this.text.includes(' ') && !Number.isNaN(Number.parseFloat(this.text));
    }
}