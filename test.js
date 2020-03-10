console.log("Starting test run");

G.nBalls = 1000;
startNewRound();
clickEvt = {'x': 40, 'y': 100};
setTargetAt(clickEvt.x, clickEvt.y);

while(!checkIfRoundHasEnded()) {
    updateGame();
}

console.log(G.points)

console.log("Testrun ended");
