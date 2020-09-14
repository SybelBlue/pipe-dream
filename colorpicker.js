class ColorPicker {
    get value() { return this.text; }
    
    static colorBoxWidth = 20;
    static colorBoxMargin = 7;
    static height = 20 + 2 * ColorPicker.colorBoxMargin;
    static colorBoxHeight = ColorPicker.height - 2 * ColorPicker.colorBoxMargin;

    static variantNames = Object.keys(ColorTipe.variants);
    static boxAndMargin = ColorPicker.colorBoxWidth + ColorPicker.colorBoxMargin;
    static width = ColorPicker.variantNames.length * ColorPicker.boxAndMargin + ColorPicker.colorBoxMargin;

    static colorBoxes = Object.keys(ColorTipe.variants).map((v, i) => { return {
        tipedColor: ColorTipe.variants[v],
        name: v, 
        x: ColorPicker.colorBoxMargin + i * ColorPicker.boxAndMargin,
        y: ColorPicker.colorBoxMargin,
        width: ColorPicker.colorBoxWidth,
        height: ColorPicker.colorBoxHeight
    }});

    constructor(multiMode=false) {
        this.selected = 
            multiMode ?
                (name) => this.current[name] = !this.current[name]:
                (name) => this.current = name;

        this.current = 
            multiMode ?
                ColorPicker.variantNames.reduce((o, key) => { o[key] = false; return o; }, {}):
                null;

        this.isSelected =
            multiMode ? 
                (name) => this.current[name]:
                (name) => name == this.current;
    }

    draw(layer=Layers.CodeFragment, interactable=true) {
        Renderer.newRenderable(layer, 
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