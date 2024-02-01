const finish = () => {
    WS.close();
    document.querySelector("canvas").remove();

    World.clear(MATTER_ENGINE.world);
    Engine.clear(MATTER_ENGINE);
    PIXI_APP.ticker.stop();
    PIXI_APP.stage.destroy(true);

    document.querySelector(".finish-container").classList.remove("hidden");

    document.querySelector(".score-value").innerHTML = `${score}`;

    let highscore = localStorage.getItem("highscore");
    if (highscore == null) {
        highscore = 0;
    }

    if (score > highscore) {
        localStorage.setItem("highscore", score);
        highscore = score;
    }

    document.querySelector(".highscore-value").innerHTML = `${highscore}`;

    document.querySelector("#refresh").addEventListener("click", () => {
        location.reload();
    });
};