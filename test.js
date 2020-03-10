function testrun() {
    console.log("x y points n_ticks");
    // G.nBalls = 1000;
    // G.lifetime = 200;
    G.magnet.factor = 10;

    for (var i = 0; i < 1000000; i++) {
        startNewRound();

        var x = Math.round(Math.random() * G.world.width);
        var y = Math.round(Math.random() * G.world.height);

        setTargetAt(x, y);

        var n_ticks = 0;
        while(!roundHasEnded()) {
            updateGame();
            n_ticks += 1;
        }

        console.log(x + " " + y + " " + G.points[0] + " " + n_ticks);
        G.points[0] = 0;
    }
}

console.log("# Starting test run");

testrun();

console.log("# Testrun ended");
