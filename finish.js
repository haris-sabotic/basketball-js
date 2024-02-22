const finish = () => {
    // WS.close();
    document.querySelector("canvas").remove();

    // World.clear(MATTER_ENGINE.world);
    // Engine.clear(MATTER_ENGINE);
    // PIXI_APP.ticker.stop();
    // PIXI_APP.stage.destroy(true);

    SEND_WS_MESSAGE("finished", null);

    WS.addEventListener("message", (event) => {
        let message = JSON.parse(event.data);

        if (message.tag == "results") {
            if (message)
                document.querySelector(".score-value").innerHTML = `${message.score}`;
        }
    });

    document.querySelector(".finish-container").classList.remove("hidden");


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
        window.location.href = window.location.pathname + "?autoPlay=true";
    });
};