class TipedValue {
    constructor(tipe, defaults={}) {
        this.tipe = tipe;
        if (tipe.basic) {
            this.value = defaults.value;
        }
        for (const methodName in tipe.methods) {
            const method = tipe.methods[methodName];
            method.graftOnto(this, defaults);
        }
    }

    draw() { this.tipe.draw(this); }
}