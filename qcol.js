function testrun() {
    console.log("points n_ticks consumed_balls n_balls multiplier lifetime target_size magnet repulsion");
    //G.nBalls = 1000;
    //G.lifetime = 1000;
    //G.magnet.factor = 10;
    //G.targetSize = 100;
    var n_rounds = 5;
    var nBalls_start = G.nBalls;
    var multiplier_start = G.multiplier;
    var lifetime_start = G.lifetime;
    var targetSize_start = G.targetSize;
    var magnet_start = G.magnet.factor;
    var repulsion_start = G.repulsionProb;

    for (G.nBalls; G.nBalls < 50; G.nBalls+=5) {
      for (G.multiplier; G.multiplier < 2; G.multiplier*=1.1) {
        for (G.lifetime; G.lifetime < 250; G.lifetime+=20) {
          for (G.targetSize; G.targetSize < 100; G.targetSize+=10) {
            for (G.magnet.factor; G.magnet.factor < 10; G.magnet.factor+=1) {
              for (G.repulsionProb; G.repulsionProb < .7; G.repulsionProb+=0.15) {
                for (var i=0; i<n_rounds; i++){
                  startNewRound();

                  //var x = Math.round(Math.random() * G.world.width);
                  //var y = Math.round(Math.random() * G.world.height);
                  var x = Math.round(G.world.width / 2);
                  var y = Math.round(G.world.height / 2);

                  setTargetAt(x, y);

                  var n_ticks = 0;
                  while(!roundHasEnded()) {
                      updateGame();
                      n_ticks += 1;
                  }

                  console.log(G.points[0] + " " + n_ticks +
                              " " + (G.nBalls - S.balls.length) + " " + G.nBalls +
                              " " + G.multiplier.toFixed(2) + " " + G.lifetime + " " +
                              G.targetSize + " " + G.magnet.factor +
                              " " + G.repulsionProb.toFixed(2));
                  G.points[0] = 0;
                }
              }
              G.repulsionProb = repulsion_start;
            }
            G.magnet.factor = magnet_start;
          }
          G.targetSize = targetSize_start;
        }
        G.lifetime = lifetime_start;
      }
      G.multiplier = multiplier_start;
    }
    G.nBalls = nBalls_start;
}

console.log("# Starting test run");

testrun();

console.log("# Testrun ended");
