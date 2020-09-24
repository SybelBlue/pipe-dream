Java Stream Difficulties
===========


1. Do your best to complete the following methods using streams. Use pseudocode where you cannot remember syntax.
```
class Ball {
    private Color color;
    private float size;

    public Color getColor() { return this.color; }
    public float getSize() { return this.size; }

    public bool isBig() { /* code hidden */ }
}
...
    /**
     * This method takes a list of balls and should return their colors.
     */
    public static List<Color> colorsOfBalls(List<Ball> balls) {
        return /* code (a) here */;
    }

    /**
     * This method takes a list of many colors of balls, and returns the
     * sizes of the red ones.
     */
    public static List<Float> sizesOfRedBalls(List<Balls> balls) {
        return /* code (b) here */;
    }

    /**
     * This method takes a list of many sizes and colors of balls, and 
     * returns the maximum size of all red or blue big balls.
    public static Optional<Integer> biggestSizeOfRedOrBlue(List<Ball> balls) {
        return /* code (c) here */
    }
```

    (a)
    (b)
    (c)

2. Of the things you can fully remember, what was the hardest to learn? Why?

3. Of the things you vaguelly recall, what stands out as the most confusing?

4. If I asked you to explain a stream to someone in Comp 123, do you think you could? How about Optional\<T>, or some of the operations on streams?