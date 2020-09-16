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

    static makeBall(color, size) {
        return {
            color: color,
            size: size,
        }
    }
}

const levelOne = 
    new Level(NumberTipe, NumberTipe, 'only positive values', test => test.filter(x => x > 0))
        .withTest(1, 2, 3, 4)
        .withTest(2, 4, -5, 3)
        .withTest()
        .withTest(-1, -2, -3, 4);

const levelTwo = 
    new Level(BallTipe, NumberTipe, 'size of blue balls', test => test.filter(x => x.color.name == 'blue').map(x => x.size))
        .withTest(...[10, 20, 30, 40].map(n => Level.makeBall('blue', n)))
        .withTest(...[10, 20, 30, 40].map(n => Level.makeBall('green', n)))
        .withTest(
            Level.makeBall('blue', 10),
            Level.makeBall('red', 20),
            Level.makeBall('blue', 5),
            Level.makeBall('yellow', 15),
            Level.makeBall('purple', 30),
            Level.makeBall('orange', 20),
            Level.makeBall('blue', 40),
            Level.makeBall('red', 5),
        );