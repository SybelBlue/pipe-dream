class ColorPicker {
    get value() { return this.text; }
    
    static height = TipeMethod.basicHeight + 5;
    static colorBoxHeight = ColorPicker.height - 10;
    static colorBoxWidth = 20;
    static colorBoxMargin = 5;

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

    // _selected = false;
    // get selected() { return this._selected; }
    // set selected(value) {
    //     if (!value) this.accept();
    //     this._selected = value;
    // }

    selected = variantNames.reduce((o, key) => o[key] = false, {});

    constructor() {
        this.selected[variantNames[0]] = true;
    }

    draw(layer=Layers.CodeFragment, interactable=true) {        
        Renderer.newRenderable(layer, 
            (regions) => {
                fill(ColorTipe.color);
                rect(0, 0, this.width, this.height);
                
                for (const box of ColorPicker.colorBoxes) {
                    if (interactable && regions[box.name].clicked) {
                        this.selected[box.name] = !this.selected[box.name];
                    }
                    
                    stroke(this.selected[box.name] ? color(255, 30, 30) : color(0));
                    fill(ColorTipe.asP5Color(box.tipedColor));
                    rect(box.x, box.y, box.width, box.height);
                }
            },
            ...ColorPicker.colorBoxes.map(o => Renderer.regionStub(o.name, o.x, o.y, o.width, o.height))
        )
    }
}