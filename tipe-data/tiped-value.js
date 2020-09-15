class TipedValue {
    constructor(tipe, defaults={}) {
        this.tipe = tipe;
        this.constructorArgs = defaults;
        if (tipe.basic) {
            this.value = defaults.value;
        }
        for (const methodName in tipe.methods) {
            const method = tipe.methods[methodName];
            method.graftOnto(this, defaults);
        }
    }

    draw() { this.tipe.draw(this); }

    clone() { return new TipedValue(this.tipe, this.constructorArgs); }
}