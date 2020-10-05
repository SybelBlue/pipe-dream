class MapMachine extends StackedMachine {
    description = "A machine that turns one object into another object."
    constructor(key, inTipe) {
        super(key, inTipe, color('#E8E288'), 'map');
    }
}

class FilterMachine extends TipedStackMachine {
    description = "A machine that only allows certain objects through.\nIt requires a Boolean value inside."
    innerOutputTipe = BooleanTipe;

    constructor(key, inTipe) {
        super(key, inTipe, color('#7dce82'), 'filter');
    }

    apply(tipedValue) {
        const result = super.apply(tipedValue);
        return result.value ? tipedValue : null;
    }
}