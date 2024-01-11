let background = PIXI.Sprite.from("assets/background.jpg");
background.anchor.set(0.5);
background.x = SCREEN_WIDTH / 2;
background.y = SCREEN_HEIGHT / 2;
PIXI_APP.stage.addChild(background);

let playAudioBackground = () => new Audio("assets/audio/background.mp3").play();
let playAudioBasketBounce = () => new Audio("assets/audio/basket_bounce.mp3").play();
let playAudioNetSwish = () => new Audio("assets/audio/net_swish.mp3").play();
let playAudioBallWhoosh = () => new Audio("assets/audio/ball_whoosh.mp3").play();

let audioBackground = new Audio("assets/audio/background.mp3");
audioBackground.loop = true;
audioBackground.volume = 0.1;
audioBackground.play();
audioBackground.addEventListener("canplaythrough", function () {
    audioBackground.play();
});


let score = 0;
let scoreText = new PIXI.Text(
    `${score}`,
    new PIXI.TextStyle({
        fontSize: 160,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 15
    })
);
scoreText.x = SCREEN_WIDTH / 2;
scoreText.y = 90;
scoreText.anchor.set(0.5);
PIXI_APP.stage.addChild(scoreText);


const STARTING_BALL_POSITION = Vector.create(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 500);

let hoop = null;
let ball = null;
let touchStartMousePos = Vector.create(0, 0);
let touchStartBallPos = Vector.create(0, 0);
let ballFlying = false;
let ballFalling = false;

const SETUP_BALL = () => {
    ball = new Ball(
        PIXI_APP,
        MATTER_ENGINE,
        {
            imagePath: "assets/ball.png",
            radius: 120,
            position: STARTING_BALL_POSITION
        }
    );
    ballFlying = false;
    ballFalling = false;
};


const SETUP_HOOP = () => {
    hoop = new Hoop(
        PIXI_APP,
        MATTER_ENGINE,
        {
            width: 500,
            position: Vector.create(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 500)
        }
    );
};

SETUP_BALL();
SETUP_HOOP();

const shootBall = (x, y) => {
    playAudioBallWhoosh();
    let velocity = Vector.sub(
        Vector.create(x, y),
        touchStartMousePos
    );
    velocity = Vector.normalise(velocity);
    velocity = Vector.create(velocity.x * 60, velocity.y * 90);

    Body.setStatic(ball.body, false);
    Body.setVelocity(ball.body, velocity);

    ballFlying = true;
    currentlyDragging = false;
};

let lastTouchMovePos = Vector.create(0, 0);
CANVAS.addEventListener("touchstart", (e) => {
    if (!ballFlying) {
        touchStartMousePos.x = e.touches[0].screenX;
        touchStartMousePos.y = e.touches[0].screenY;

        touchStartBallPos.x = ball.body.position.x;
        touchStartBallPos.y = ball.body.position.y;
    }
});
CANVAS.addEventListener("touchmove", (e) => {
    if (!ballFlying) {
        Body.setPosition(ball.body, Vector.create(
            touchStartBallPos.x + (e.touches[0].screenX - touchStartMousePos.x),
            touchStartBallPos.y + (e.touches[0].screenY - touchStartMousePos.y)
        ));

        lastTouchMovePos = Vector.create(e.touches[0].screenX, e.touches[0].screenY);

        if (Math.abs(e.touches[0].screenY - touchStartMousePos.y) > 150) {
            shootBall(lastTouchMovePos.x, lastTouchMovePos.y);
        }
    }
});
CANVAS.addEventListener("touchend", (e) => {
    if (!ballFlying) {
        shootBall(lastTouchMovePos.x, lastTouchMovePos.y);
    }
});

PIXI_APP.ticker.add((_delta) => {
    ball.update();
    hoop.update();

    if (ball.body.velocity.y > 0) {
        ballFalling = true;
        ball.enableCollision();
    } else {
        if (ballFlying && !ballFalling) {
            ball.scale(0.984);
        }
    }

    if (ballFalling) {
        ball.sprite.zIndex = 99;
    }

    if (ball.body.position.y + ball.sprite.height / 2 > SCREEN_HEIGHT) {
        ball.deleteSelf(PIXI_APP, MATTER_ENGINE);
        SETUP_BALL();
    }
});

Events.on(MATTER_ENGINE, "collisionEnd", (event) => {
    event.pairs.forEach(pair => {
        if (pair.bodyA.label == "ball" || pair.bodyB.label == "ball") {
            if (
                pair.bodyA.label == "edgeLeft" ||
                pair.bodyB.label == "edgeLeft" ||
                pair.bodyA.label == "edgeRight" ||
                pair.bodyB.label == "edgeRight"
            ) {
                playAudioBasketBounce();
            }
        } else if (
            (pair.bodyA.label == "sensorBall" && pair.bodyB.label == "sensorBasket") ||
            (pair.bodyA.label == "sensorBasket" && pair.bodyB.label == "sensorBall")
        ) {
            score += 1;
            scoreText.text = `${score}`;
            playAudioNetSwish();
        }
    });
});
