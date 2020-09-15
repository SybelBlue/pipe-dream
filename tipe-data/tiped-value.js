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

    equals(other) {
        if (!exists(other.tipe) || !exists(other.constructorArgs)) return false;
        if (other.tipe.name !== this.tipe.name) return false;
        const keys = Object.keys(this.constructorArgs);
        if (keys.length !== Object.keys(other.constructorArgs).length) return false;
        return keys.every(k => this.constructorArgs[k] == other.constructorArgs[k]);
    }
}