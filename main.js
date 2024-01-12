function runMain() {
    let background = new PIXI.Sprite(BACKGROUND_TEXTURE);
    background.anchor.set(0.5);
    background.x = SCREEN_WIDTH / 2;
    background.y = SCREEN_HEIGHT / 2;
    PIXI_APP.stage.addChild(background);

    // let audioBackground = new Audio("assets/audio/background.mp3");
    // audioBackground.loop = true;
    // audioBackground.volume = 0.1;
    // audioBackground.play();
    // audioBackground.addEventListener("canplaythrough", function () {
    //     audioBackground.play();
    // });
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


    let hoop = null;
    let ball = null;
    let touchStartMousePos = Vector.create(0, 0);
    let touchStartBallPos = Vector.create(0, 0);
    let ballFlying = false;
    let ballFalling = false;
    let threePointer = false;

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
        threePointer = true;

        let velocity = Vector.sub(
            Vector.create(x, y),
            touchStartMousePos
        );
        velocity = Vector.normalise(velocity);
        velocity = Vector.create(velocity.x * 35, velocity.y * 60);

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
    let lasthoopHorizontalDirection = 0;
    let hoopHorizontalSpeed = 5;
    let enableMovingHorizontallyAfterEachPoint = false;
    let hoopHorizontalLimit = HOOP_STARTING_POSITION.x;

    let hoopVerticalDirection = 0;
    let hoopVerticalSpeed = 5;

    PIXI_APP.ticker.add((_delta) => {
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
                    audioBasketBounce.play();
                    threePointer = false;
                }
            }
        });
    });

    Events.on(MATTER_ENGINE, "collisionEnd", (event) => {
        event.pairs.forEach(pair => {
            if (
                (pair.bodyA.label == "sensorBall" && pair.bodyB.label == "sensorBasket") ||
                (pair.bodyA.label == "sensorBasket" && pair.bodyB.label == "sensorBall")
            ) {
                if (threePointer) {
                    score += 3;
                } else {
                    score += 2;
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

                        console.log(hoopHorizontalDirection, hoopHorizontalLimit);
                    } else {
                        if (hoopVerticalDirection == 0) {
                            hoopHorizontalDirection = 0;
                            hoopVerticalDirection = 1;
                        }
                    }
                }
            }
        });
    });


    PIXI_APP.stage.addChild(scoreText);
}
