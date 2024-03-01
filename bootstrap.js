const TOKEN = (new URLSearchParams(window.location.search)).get('token');

const
    Vector = Matter.Vector,
    Events = Matter.Events,
    Engine = Matter.Engine,
    Runner = Matter.Runner,
    Body = Matter.Body,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Composites = Matter.Composites,
    Composite = Matter.Composite;

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let PIXI_APP;
let CANVAS;
let SCREEN_WIDTH;
let SCREEN_HEIGHT;
let MATTER_ENGINE;

let BALL_TEXTURE = PIXI.Texture.from("assets/ball.png");
let BOARD_TEXTURE = PIXI.Texture.from("assets/board.png");
let BACKGROUND_TEXTURE = PIXI.Texture.from("assets/background.png");

function runBootstrap() {
    PIXI_APP = new PIXI.Application({ background: '#1099bb', resizeTo: window });
    PIXI_APP.stage.sortableChildren = true;
    CANVAS = document.body.appendChild(PIXI_APP.view);
    SCREEN_WIDTH = PIXI_APP.screen.width;
    SCREEN_HEIGHT = PIXI_APP.screen.height;

    PIXI_APP.ticker.maxFPS = 60;

    MATTER_ENGINE = Engine.create();
    MATTER_ENGINE.gravity.scale = 0.012;
}

let audioBasketBounce = new Howl({
    src: ['assets/audio/basket_bounce.mp3']
});
let audioGroundBounce = new Howl({
    src: ['assets/audio/ground_bounce.mp3']
});
let audioNetSwish = new Howl({
    src: ['assets/audio/net_swish.mp3']
});
let audioBallWhoosh = new Howl({
    src: ['assets/audio/ball_whoosh.mp3']
});

let audioBackground = new Howl({
    src: ['assets/audio/background.mp3'],
    loop: true,
});


// Create WebSocket connection.
const WS = new WebSocket(WS_URL);

function SEND_WS_MESSAGE(tag, msg) {
    console.log(`SENDING MESSAGE (${tag})`, msg);
    let strMsg = JSON.stringify(msg);
    let encryptedMsg = strMsg;
    if (msg && msg.prevScore != null) {
        console.log(msg.prevScore);
        encryptedMsg = CryptoJS.AES.encrypt(strMsg, msg.prevScore.toString()).toString();
    }

    WS.send(JSON.stringify({ authToken: TOKEN, tag, msg: encryptedMsg }));
}

WS.addEventListener("open", (event) => {
    SEND_WS_MESSAGE("new_client", null);
    SEND_WS_MESSAGE("games_played", null);
});

WS.addEventListener("message", (event) => {
    let message = JSON.parse(event.data);
    console.log(message);

    if (message.tag == "games_played") {
        const gamesLeft = 10 - message.gamesPlayed;
        if (gamesLeft <= 0) {
            document.querySelector(".play-container > p").innerHTML = "Ne možete igrati više";
            document.querySelector("#play").remove();
        } else {
            document.querySelector("#games-left").innerHTML = gamesLeft;
        }
    }
});

let RECORDING_BALL = [];
let RECORDING_HOOP = [];