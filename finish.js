const finish = () => {
    document.querySelector("canvas").remove();

    SEND_WS_MESSAGE("finished", null);

    WS.addEventListener("message", (event) => {
        let message = JSON.parse(event.data);

        if (message.tag == "results") {
            if (message) {
                document.querySelector(".score-value").innerHTML = `${message.score}`;
                document.querySelector(".highscore-value").innerHTML = `${message.highscore}`;
            }
        }

        WS.close();
    });

    document.querySelector(".finish-container").classList.remove("hidden");

    document.querySelector("#refresh").addEventListener("click", () => {
        location.reload();
    });
};