class Challenge {
    constructor(inTipe, outTipe, data) {
        this.inTipe = inTipe;
        this.outTipe = outTipe;
        this.data = data.map(inTipe.new);
    }
}

const testChallenge = new Challenge(
    NumberTipe,
    NumberTipe,
    [-4, 5, 2, 3]
)