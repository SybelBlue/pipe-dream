class Level {
    tests = [];
    solutions = [];

    get machines() {
        return this._machineSupplier();
    }

    _machineSupplier() { return Machine.machines; }

    constructor(startingTipe, endingTipe, solutionFn) {
        this.startingTipe = startingTipe;
        this.endingTipe = endingTipe;
        this.solutionFn = solutionFn;
    }

    withTest(...startingTipeArgs) {
        this.tests.push(startingTipeArgs.map(this.startingTipe.new));
        this.solutions.push(this.solutionFn(startingTipeArgs).map(this.endingTipe.new));
        return this;
    }

    withPrompt(prompt) {
        this.prompt = prompt;
        return this;
    }

    withMachines(machineTypesSupplier) {
        this._machineSupplier = machineTypesSupplier;
        return this;
    }

    static makeBall(color, size) {
        return {
            color: color,
            size: size,
        }
    }
}

class ReductionLevel extends Level {
    withTest(...startingTipeArgs) {
        this.tests.push(startingTipeArgs.map(this.startingTipe.new));
        this.solutions.push(this.endingTipe.new(this.solutionFn(startingTipeArgs)));
        return this;
    }
}

const levels = [
    new Level(BallTipe, NumberTipe, test => test.map(x => x.size).slice(1, 3))
        .withPrompt('sandbox (return the second and third sizes)')
        .withTest(...[10, 20, 30, 40].map(n => Level.makeBall('blue', n)))
        .withTest(
            Level.makeBall('blue', 10),
            Level.makeBall('red', 20),
            Level.makeBall('blue', 50),
            Level.makeBall('yellow', 70),
            Level.makeBall('purple', 30),
            Level.makeBall('orange', 20),
            Level.makeBall('blue', 40),
            Level.makeBall('red', 50),
        )
        .withTest(
            Level.makeBall('yellow', 30),
            Level.makeBall('green', 10),
            Level.makeBall('blue', 50),
            Level.makeBall('yellow', 70),
            Level.makeBall('purple', 20),
            Level.makeBall('orange', 40),
            Level.makeBall('orange', 40),
            Level.makeBall('red', 50),
        ),
    new Level(BallTipe, NumberTipe, test => test.map(x => x.size))
        .withMachines(() => [MapMachine.dummy])
        .withPrompt('Use the map machine to return the size of each ball!')
        .withTest(...[10, 20, 30, 40].map(n => Level.makeBall('blue', n)))
        .withTest(
            Level.makeBall('blue', 10),
            Level.makeBall('red', 20),
            Level.makeBall('blue', 50),
            Level.makeBall('yellow', 70),
            Level.makeBall('purple', 30),
            Level.makeBall('orange', 20),
            Level.makeBall('blue', 40),
            Level.makeBall('red', 50),
        )
        .withTest(
            Level.makeBall('yellow', 30),
            Level.makeBall('green', 10),
            Level.makeBall('blue', 50),
            Level.makeBall('yellow', 70),
            Level.makeBall('purple', 20),
            Level.makeBall('orange', 40),
            Level.makeBall('orange', 40),
            Level.makeBall('red', 50),
        ),
    new Level(BallTipe, BallTipe, test => test.filter(x => x.color === 'blue'))
        .withMachines(() => [FilterMachine.dummy])
        .withPrompt('Use the filter machine to only allow blue balls through the pipe!')
        .withTest(...[10, 20, 30, 40].map(n => Level.makeBall('blue', n)))
        .withTest()
        .withTest(
            Level.makeBall('blue', 10),
            Level.makeBall('red', 20),
            Level.makeBall('blue', 50),
            Level.makeBall('yellow', 70),
            Level.makeBall('purple', 30),
            Level.makeBall('blue', 20),
            Level.makeBall('blue', 40),
            Level.makeBall('red', 50),
        )
        .withTest(
            Level.makeBall('yellow', 30),
            Level.makeBall('green', 10),
            Level.makeBall('red', 50),
            Level.makeBall('yellow', 70),
            Level.makeBall('purple', 20),
            Level.makeBall('orange', 40),
            Level.makeBall('orange', 40),
            Level.makeBall('red', 50),
        ),
    new Level(BallTipe, NumberTipe, test => test.filter(x => ['red', 'green'].includes(x.color) && x.size > 50).map(x => x.size))
       .withMachines(() => [MapMachine.dummy, FilterMachine.dummy])
       .withPrompt('Use the machines to create a pipe that only gives the sizes of christmas ornaments! (The ball can be red or green, and has to have a size over 50.)')
       .withTest(
           Level.makeBall('red', 30),
           Level.makeBall('orange', 40),
           Level.makeBall('yellow', 50),
           Level.makeBall('green', 60),
           Level.makeBall('blue', 70),
           Level.makeBall('purple', 80),
       )
       .withTest(
           Level.makeBall('red', 80),
           Level.makeBall('green', 40),
           Level.makeBall('green', 30),
           Level.makeBall('red', 60),
           Level.makeBall('red', 80),
           Level.makeBall('green', 20),
       )
       .withTest(
           Level.makeBall('orange', 80),
           Level.makeBall('yellow', 60),
           Level.makeBall('purple', 70),
           Level.makeBall('orange', 60),
           Level.makeBall('blue', 80),
           Level.makeBall('yellow', 60),
       ),
    new Level(BallTipe, BallTipe, test => test.filter(x => x.color === 'purple').slice(0, 3))
        .withMachines(() => [MapMachine.dummy, FilterMachine.dummy, TakeMachine.dummy])
        .withPrompt('Use the machines to create a pipe that only gives the first three purple balls!')
        .withTest(...[30, 40, 50, 60].map(n => Level.makeBall('purple', n)))
        .withTest(
            Level.makeBall('red', 30),
            Level.makeBall('orange', 40),
            Level.makeBall('yellow', 50),
            Level.makeBall('green', 60),
            Level.makeBall('blue', 70),
            Level.makeBall('purple', 80),
        )
        .withTest(
            Level.makeBall('purple', 80),
            Level.makeBall('purple', 60),
            Level.makeBall('green', 40),
            Level.makeBall('orange', 30),
            Level.makeBall('purple', 80),
            Level.makeBall('yellow', 20),
            Level.makeBall('red', 40),
            Level.makeBall('blue', 50),
            Level.makeBall('purple', 80),
        ),
    new ReductionLevel(BallTipe, NumberTipe, test => test.filter(x => ['red', 'yellow', 'blue'].includes(x.color)).length)
        .withMachines(() => [MapMachine.dummy, FilterMachine.dummy, TakeMachine.dummy, CountMachine.dummy])
        .withPrompt('Use the machines to create a pipe that counts how many balls have primary colors (red, yellow, or blue).')
        .withTest(...[30, 40, 50, 60].map((n, i) => Level.makeBall(i % 2 ? 'red' : 'blue', n)))
        .withTest(
            Level.makeBall('red', 30),
            Level.makeBall('orange', 40),
            Level.makeBall('yellow', 50),
            Level.makeBall('green', 60),
            Level.makeBall('blue', 70),
            Level.makeBall('purple', 80),
        )
        .withTest(
            Level.makeBall('purple', 80),
            Level.makeBall('red', 20),
            Level.makeBall('green', 70),
            Level.makeBall('orange', 30),
            Level.makeBall('purple', 70),
            Level.makeBall('green', 20),
            Level.makeBall('red', 40),
            Level.makeBall('blue', 30),
            Level.makeBall('purple', 80),
        ),
    new Level(BallTipe, BallTipe, test => test.filter(x => ['yellow', 'purple'].includes(x.color)).slice(0, 5).filter(x => x.size > 50).slice(0, 3))
        .withMachines(() => [MapMachine.dummy, FilterMachine.dummy, TakeMachine.dummy, CountMachine.dummy])
        .withPrompt('Create a pipe that gives the first three balls with size greater than 50 from the first 5 yellow or purple balls.')
        .withTest(...[30, 40, 50, 60, 70, 80].map((n, i) => Level.makeBall(i % 2 == 0 ? 'yellow' : 'purple', n)))
        // both takes are closed
        .withTest(
            Level.makeBall('purple', 80), // 1, 2
            Level.makeBall('yellow', 60), // 1, 2
            Level.makeBall('green', 40),
            Level.makeBall('orange', 30),
            Level.makeBall('purple', 40), // 1
            Level.makeBall('yellow', 20), // 1, << error if 1 off
            Level.makeBall('red', 40),
            Level.makeBall('blue', 50),
            Level.makeBall('purple', 80), // 1 closed, 2 closed
            Level.makeBall('blue', 50),
            Level.makeBall('green', 80),
        )
        // first take is closed, not second
        .withTest(
            Level.makeBall('purple', 80), // 1, 2
            Level.makeBall('green', 40),
            Level.makeBall('red', 30),
            Level.makeBall('blue', 50),
            Level.makeBall('purple', 40), // 1
            Level.makeBall('yellow', 60), // 1, 2
            Level.makeBall('yellow', 20), // 1
            Level.makeBall('orange', 40),
            Level.makeBall('yellow', 40), // 1 closed
            Level.makeBall('purple', 30),
            Level.makeBall('green', 50),
            Level.makeBall('purple', 70) // << error if no 1
        )
        // second take is closed, not first
        .withTest(
            Level.makeBall('green', 40),
            Level.makeBall('red', 30),
            Level.makeBall('purple', 80), // 1, 2
            Level.makeBall('blue', 50),
            Level.makeBall('purple', 40), // 1
            Level.makeBall('yellow', 60), // 1, 2
            Level.makeBall('purple', 80), // 1, 2 closed
            Level.makeBall('yellow', 60), // << error if no 2
            Level.makeBall('orange', 70),
            Level.makeBall('yellow', 40),
            Level.makeBall('purple', 30)
        )
];

levels.forEach((l, i) => l.number = i);