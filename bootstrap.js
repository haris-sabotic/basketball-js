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
const WS = new WebSocket("ws://localhost:8000");
let WS_ID = null;

WS.addEventListener("open", (event) => {
    // Connection opened
});

WS.addEventListener("message", (event) => {
    let message = JSON.parse(event.data);

    console.log(message);

    if (message.tag == "id") {
        WS_ID = message.id;
    }
});

function SEND_WS_MESSAGE(tag, msg) {
    WS.send(JSON.stringify({ id: WS_ID, tag, msg }));
}

let RECORDING_BALL = [];
let RECORDING_HOOP = [];