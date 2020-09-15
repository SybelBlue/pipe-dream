class ColorPicker {
    get value() { return this.current; }

    static colorBoxWidth = 20;
    static colorBoxMargin = 7;
    static height = 20 + 2 * ColorPicker.colorBoxMargin;
    static colorBoxHeight = ColorPicker.height - 2 * ColorPicker.colorBoxMargin;

    static get variantNames() { return Object.keys(ColorTipe.variants); }
    static boxAndMargin = ColorPicker.colorBoxWidth + ColorPicker.colorBoxMargin;
    static get width() { return ColorPicker.variantNames.length * ColorPicker.boxAndMargin + ColorPicker.colorBoxMargin; }

    // necessary instance fields for UIMethod to interpret as InputBox properly
    width = ColorPicker.width;
    height = ColorPicker.height;

    // memoized so that dependencies don't form a loop
    static _colorBoxes = null;
    static get colorBoxes() { 
        if (!ColorPicker._colorBoxes) {
            ColorPicker._colorBoxes = Object.keys(ColorTipe.variants).map((v, i) => { return {
                tipedColor: ColorTipe.variants[v],
                name: v, 
                x: ColorPicker.colorBoxMargin + i * ColorPicker.boxAndMargin,
                y: ColorPicker.colorBoxMargin,
                width: ColorPicker.colorBoxWidth,
                height: ColorPicker.colorBoxHeight
            }});
        }
        return ColorPicker._colorBoxes;
    }

    constructor(multiMode=false) {
        this.selected = 
            multiMode ?
                (name) => this.current[name] = !this.current[name]:
                (name) => this.current = name;

        this.current = 
            multiMode ?
                ColorPicker.variantNames.reduce((o, key) => { o[key] = false; return o; }, {}):
                ColorPicker.variantNames[0];

        this.isSelected =
            multiMode ? 
                (name) => this.current[name]:
                (name) => name == this.current;
    }

    draw(interactable=true) {
        Renderer.newRenderable(Layers.CodeFragment, 
            (regions) => {
                fill(ColorTipe.color);
                rect(0, 0, ColorPicker.width, ColorPicker.height, 0, 10, 10, 0);

                for (const box of ColorPicker.colorBoxes) {
                    if (interactable && regions[box.name].clicked) {
                        this.selected(box.name);
                    }

                    strokeWeight(4);
                    stroke(this.isSelected(box.name) ? color(255, 30, 30) : color(0));
                    fill(ColorTipe.asP5Color(box.tipedColor));
                    rect(box.x, box.y, box.width, box.height);
                }
            },
            ...ColorPicker.colorBoxes.map(o => Renderer.regionStub(o.name, o.x, o.y, o.width, o.height))
        )
    }
}