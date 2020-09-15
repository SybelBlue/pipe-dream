class Level {
    tests = [];
    solutions = [];

    constructor(startingTipe, endingTipe, prompt, solutionFn) {
        this.startingTipe = startingTipe;
        this.endingTipe = endingTipe;
        this.prompt = prompt;
        this.solutionFn = solutionFn;
    }

    withTest(...startingTipeArgs) {
        this.tests.push(startingTipeArgs.map(this.startingTipe.new));
        this.solutions.push(this.solutionFn(startingTipeArgs).map(this.endingTipe.new));
        return this;
    }
}

const levelOne = 
    new Level(NumberTipe, NumberTipe, 'only positive values', test => test.filter(x => x > 0))
        .withTest(1, 2, 3, 4)
        .withTest(2, 4, -5, 3)
        .withTest()
        .withTest(-1, -2, -3, 4);