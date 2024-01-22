let score = 0;
function runMain() {
    let background = new PIXI.Sprite(BACKGROUND_TEXTURE);
    background.anchor.set(0.5);
    background.x = SCREEN_WIDTH / 2;
    background.y = SCREEN_HEIGHT / 2;
    if (PIXI_APP.screen.width / PIXI_APP.screen.height < background.width / background.height) {
        let ratio = background.width / background.height;
        background.height = PIXI_APP.screen.height;
        background.width = ratio * PIXI_APP.screen.height;
    } else {
        let ratio = background.height / background.width;
        background.width = PIXI_APP.screen.width;
        background.height = ratio * PIXI_APP.screen.width;
    }

    PIXI_APP.stage.addChild(background);

    let bodyGround = Bodies.rectangle(
        0, SCREEN_HEIGHT / 2 + 550,
        999999, 300,
        { isStatic: true, label: "ground" }
    );
    Composite.add(MATTER_ENGINE.world, [bodyGround]);

    let audioBackgroundPlaying = false;
    audioBackground.onload = () => {
        if (!audioBackgroundPlaying) {
            audioBackground.play();
            audioBackgroundPlaying = true;
        }
    };
    audioBackground.onunlock = () => {
        if (!audioBackgroundPlaying) {
            audioBackground.play();
            audioBackgroundPlaying = true;
        }
    };
    if (!audioBackgroundPlaying) {
        audioBackground.play();
        audioBackgroundPlaying = true;
    }



    score = 0;
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

    let timer = 60;
    let timerText = new PIXI.Text(
        `${timer}`,
        new PIXI.TextStyle({
            fontSize: 100,
            fontWeight: "bold",
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 15,
        })
    );
    timerText.x = SCREEN_WIDTH;
    timerText.y = 5;
    timerText.anchor.set(1.0, 0.0);
    setInterval(function () {
        timer -= 1;
        timerText.text = `${timer}`;

        if (timer == 0) {
            console.log("GAME OVER");
            finish();
        }
    }, 1000);



    let hoop = null;
    let ball = null;
    let touchStartMousePos = Vector.create(0, 0);
    let touchStartBallPos = Vector.create(0, 0);
    let ballFlying = false;
    let ballFalling = false;
    let clearShot = false;
    let touchedGroundOnce = false;
    let canAddPoint = true;

    const BALL_STARTING_POSITION = Vector.create(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 500);
    const SETUP_BALL = () => {
        ball = new Ball(
            PIXI_APP,
            MATTER_ENGINE,
            {
                imageName: "ball",
                radius: 130,
                position: BALL_STARTING_POSITION
            }
        );
        ballFlying = false;
        ballFalling = false;
    };

    const HOOP_STARTING_POSITION = Vector.create(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 545);
    const SETUP_HOOP = () => {
        hoop = new Hoop(
            PIXI_APP,
            MATTER_ENGINE,
            {
                width: 750,
                position: HOOP_STARTING_POSITION
            }
        );
    };

    SETUP_BALL();
    SETUP_HOOP();

    const shootBall = (x, y) => {
        audioBallWhoosh.play();
        clearShot = true;
        touchedGroundOnce = false;
        canAddPoint = true;

        let velocity = Vector.sub(
            Vector.create(x, y),
            touchStartMousePos
        );
        velocity = Vector.normalise(velocity);
        velocity = Vector.create(velocity.x * 50, velocity.y * 90);

        SEND_WS_MESSAGE("shoot", { velocity });

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

    let hoopHorizontalDirection = 0;
    let hoopHorizontalSpeed = 5;
    let enableMovingHorizontallyAfterEachPoint = false;
    let hoopHorizontalLimit = HOOP_STARTING_POSITION.x;

    let hoopVerticalDirection = 0;
    let hoopVerticalSpeed = 5;

    setInterval(() => {
        if (enableMovingHorizontallyAfterEachPoint) {
            if (hoopHorizontalDirection == -1) {
                if (hoop.centerPos().x <= hoopHorizontalLimit) {
                    hoopHorizontalDirection = 0;

                    hoopVerticalDirection = -1;
                }
            } else if (hoopHorizontalDirection == 1) {
                if (hoop.centerPos().x >= hoopHorizontalLimit) {
                    hoopHorizontalDirection = 0;

                    hoopVerticalDirection = -1;
                }
            }
        } else {
            if (hoop.centerPos().x >= HOOP_STARTING_POSITION.x + 300) {
                hoopHorizontalDirection = -1;
            } else if (hoop.centerPos().x <= HOOP_STARTING_POSITION.x - 300) {
                hoopHorizontalDirection = 1;
            }
        }

        if (hoop.centerPos().y <= HOOP_STARTING_POSITION.y - 10) {
            hoopVerticalDirection = 1;
        } else if (hoop.centerPos().y >= HOOP_STARTING_POSITION.y + 300) {
            hoopVerticalDirection = -1;
        }

        hoop.moveHorizontally(hoopHorizontalDirection * hoopHorizontalSpeed);
        hoop.moveVertically(hoopVerticalDirection * hoopVerticalSpeed);


        ball.update();
        hoop.update();

        if (ball.body.velocity.y > 0) {
            ballFalling = true;
            ball.enableCollision();
        } else {
            if (ballFlying && !ballFalling) {
                ball.scale(0.98);
            }
        }

        if (ballFalling) {
            ball.sprite.zIndex = 99;
        }


        Engine.update(MATTER_ENGINE, 1000 / 60);
    }, 1000 / 60);

    Events.on(MATTER_ENGINE, "collisionStart", (event) => {
        event.pairs.forEach(pair => {
            if (pair.bodyA.label == "ball" || pair.bodyB.label == "ball") {
                if (
                    pair.bodyA.label == "edgeLeft" ||
                    pair.bodyB.label == "edgeLeft" ||
                    pair.bodyA.label == "edgeRight" ||
                    pair.bodyB.label == "edgeRight"
                ) {
                    audioBasketBounce.play();
                    clearShot = false;
                }
            }
        });
    });

    Events.on(MATTER_ENGINE, "collisionEnd", (event) => {
        event.pairs.forEach(pair => {
            if (pair.bodyA.label == "ball" || pair.bodyB.label == "ball") {
                if (
                    pair.bodyA.label == "ground" ||
                    pair.bodyB.label == "ground"
                ) {
                    if (touchedGroundOnce) {
                        audioGroundBounce.volume = 0.5;
                        audioGroundBounce.play();
                        ball.deleteSelf(PIXI_APP, MATTER_ENGINE);
                        SETUP_BALL();
                    } else {
                        audioGroundBounce.volume = 1.0;
                        audioGroundBounce.play();
                        touchedGroundOnce = true;
                    }
                }
            }
        });
    });

    Events.on(MATTER_ENGINE, "collisionEnd", (event) => {
        event.pairs.forEach(pair => {
            if (canAddPoint) {
                if (
                    (pair.bodyA.label == "sensorBall" && pair.bodyB.label == "sensorBasket") ||
                    (pair.bodyA.label == "sensorBasket" && pair.bodyB.label == "sensorBall")
                ) {
                    canAddPoint = false;

                    if (clearShot) {
                        score += 2;
                    } else {
                        score += 1;
                    }
                    scoreText.text = `${score}`;
                    audioNetSwish.play();

                    if (score >= 10 && score < 20) {
                        if (hoopHorizontalDirection == 0) {
                            hoopHorizontalDirection = 1;
                        }
                    }

                    if (score >= 20) {
                        if (hoopVerticalDirection != 0) {
                            enableMovingHorizontallyAfterEachPoint = true;
                        }

                        if (enableMovingHorizontallyAfterEachPoint) {
                            hoopVerticalDirection = 0;

                            if (hoop.centerPos().x >= HOOP_STARTING_POSITION.x) {
                                hoopHorizontalDirection = -1;
                                hoopHorizontalLimit = HOOP_STARTING_POSITION.x - randomIntFromInterval(100, 300);
                            } else if (hoop.centerPos().x <= HOOP_STARTING_POSITION.x) {
                                hoopHorizontalDirection = 1;
                                hoopHorizontalLimit = HOOP_STARTING_POSITION.x + randomIntFromInterval(100, 300);
                            }
                        } else {
                            if (hoopVerticalDirection == 0) {
                                hoopHorizontalDirection = 0;
                                hoopVerticalDirection = 1;
                            }
                        }
                    }
                }
            }
        });
    });


    PIXI_APP.stage.addChild(scoreText);
    PIXI_APP.stage.addChild(timerText);
}
