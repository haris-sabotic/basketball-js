class Ball {
    body = null;
    sensor = null;
    sprite = null;

    /**
     * 
     * @param {PIXI.Application} pixiApp 
     * @param {Matter.Engine} matterEngine
     * @param {{imagePath: string, radius: number, position: Matter.Vector}} attributes 
     */
    constructor(pixiApp, matterEngine, attributes) {
        let body = Bodies.circle(
            attributes.position.x,
            attributes.position.y,
            attributes.radius,
            { isStatic: true, friction: 1.0, restitution: 0.8, label: "ball" }
        );
        Composite.add(matterEngine.world, [body]);
        let sensor = Bodies.circle(
            attributes.position.x,
            attributes.position.y,
            attributes.radius / 3,
            { mass: 0, isSensor: true, label: "sensorBall" }
        );
        Composite.add(matterEngine.world, [sensor]);

        let sprite = PIXI.Sprite.from(attributes.imagePath);
        sprite.anchor.set(0.5);
        sprite.width = attributes.radius * 2;
        sprite.height = attributes.radius * 2;
        sprite.x = attributes.position.x;
        sprite.y = attributes.position.y;
        sprite.zIndex = 101;
        pixiApp.stage.addChild(sprite);

        // disable collision
        body.collisionFilter.category = 0;
        sensor.collisionFilter.category = 0;

        this.body = body;
        this.sensor = sensor;
        this.sprite = sprite;
    }

    scale(scale) {
        this.sprite.width = scale * this.sprite.width;
        this.sprite.height = scale * this.sprite.height;

        Body.scale(this.body, scale, scale);
    }

    enableCollision() {
        this.body.collisionFilter.category = 1;
        this.sensor.collisionFilter.category = 1;
    }

    update() {
        Body.setPosition(this.sensor, this.body.position);

        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
        this.sprite.rotation = this.body.angle;
    }

    deleteSelf(pixiApp, matterEngine) {
        pixiApp.stage.removeChild(this.sprite);
        Composite.remove(matterEngine.world, [this.body, this.sensor]);
    }
}