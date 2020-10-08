class InputBox {
    static boxMaxLength = 150;
    static margin = 5;

    get boxMaxChars() { return floor((InputBox.boxMaxLength - 2 * InputBox.margin) / Renderer.textWidth(' ', this.fontSize, this.font)); }
    get value() { return this.text; }
    get height() { return Renderer.textHeight(this.fontSize, this.font) + 2 * InputBox.margin; }
    get width() { 
        return max(
            20, 
            Renderer.textWidth(
                this.text.substring(0, this.boxMaxChars),
                this.fontSize,
                this.font
            ) + 2 * InputBox.margin
        );
    }

    enforceCharLimit = false;

    used = false;

    promptMsg = 'Enter text:';

    constructor(config={}) {
        this.defaultText = config.defaultText || '';
        this.text = this.defaultText;
        this.last = this.defaultText;

        this.font = config.font || Renderer.defaultFont;
        this.fontSize = config.fontSize || 16;

        this.onClick = () => {};
    }

    draw(interactable=true) {
        const width = this.width;
        const height = this.height;

        Renderer.newRenderable(Layers.UI, 
            (regions) => {
                if (interactable && regions.body.clicked) {
                    Renderer.prompt(this.promptMsg, this.text, (out) => { this.text = out; this.accept(); })
                    this.onClick();
                }

                fill(color(200));
                rect(0, 0, width, height);

                let displayText = this.text.substring(0);
                if (displayText.length > this.boxMaxChars) {
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

    reject() { 
        this.used = this.last !== this.defaultText;
        this.text = this.last;
    }

    accept() {
        if (!exists(this.text) || !this.validate()) {
            this.reject();
        } else {
            this.last = this.text;
        }
    }

    validate() { return true; }
}

class FloatBox extends InputBox {
    enforceCharLimit = true;

    promptMsg = 'Enter a number (decimals okay):';

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

    promptMsg = 'Enter a round number:';

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
