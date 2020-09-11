class Level {
    tests = [];
    constructor(startTipe, finishTipe) {
        this.startTipe = startTipe;
        this.finishTipe = finishTipe;
    }

    withTest(...startTipeArgs) {
        this.tests.push(startTipeArgs.map(this.startTipe.new));
    }
}