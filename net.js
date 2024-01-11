class Net {
    compositeNet = null;
    constraintsNet = null;
    spritesNetConstraints = null;
    spritesNetConstraintsDecoration = null;
    spritesChainLeft = null;
    spritesChainRight = null;

    basketCornerLeft = null;
    basketCornerRight = null;

    chainKnotsCount = 12;
    chainKnotsGap = 10;

    netTint = 0xAAAAAA;

    /**
     * 
     * @param {Matter.Vector} basketCornerLeft 
     * @param {Matter.Vector} basketCornerRight 
     */
    constructor(pixiApp, matterEngine, basketCornerLeft, basketCornerRight, boardSize) {
        this.basketCornerLeft = basketCornerLeft;
        this.basketCornerRight = basketCornerRight;

        let chainLeft = Composites.stack(basketCornerLeft.x, basketCornerLeft.y,
            1, this.chainKnotsCount,
            0, this.chainKnotsGap,
            function (x, y) {
                // (10, 10) is NOT the width and height of the line between 2 knots on the chain!!
                // (10, 10) is more like the size of the knot, the width and height of the line is determined with a Constraint
                let body = Bodies.rectangle(x, y, 10, 10);
                return body;
            }
        );
        Body.setStatic(chainLeft.bodies[0], true);
        Composites.chain(chainLeft,
            0.0, 0.0,
            0.0, 0.0,
            { stiffness: 0.8, length: this.chainKnotsGap }
        );

        let chainRight = Composites.stack(basketCornerRight.x - 10, basketCornerRight.y,
            1, this.chainKnotsCount,
            0, this.chainKnotsGap,
            function (x, y) {
                // (10, 10) is NOT the width and height of the line between 2 knots on the chain!!
                // (10, 10) is more like the size of the knot, the width and height of the line is determined with a Constraint
                return Bodies.rectangle(x, y, 10, 10);
            }
        );
        Body.setStatic(chainRight.bodies[0], true);
        Composites.chain(chainRight,
            0.0, 0.0,
            0.0, 0.0,
            { stiffness: 0.8, length: this.chainKnotsGap }
        );

        let compositeNet = Composite.create();
        Composite.add(compositeNet, chainLeft);
        Composite.add(compositeNet, chainRight);
        Composite.add(matterEngine.world, [compositeNet]);
        this.compositeNet = compositeNet;

        let spritesChainLeft = [];
        let spritesChainRight = [];
        for (let i = 0; i < this.chainKnotsCount - 1; i++) {
            let spriteLeft = new PIXI.Sprite(PIXI.Texture.WHITE);
            spriteLeft.tint = this.netTint;
            spriteLeft.anchor.set(0.5);

            let spriteRight = new PIXI.Sprite(PIXI.Texture.WHITE);
            spriteRight.tint = this.netTint;
            spriteRight.anchor.set(0.5);

            pixiApp.stage.addChild(spriteLeft);
            pixiApp.stage.addChild(spriteRight);
            spritesChainLeft.push(spriteLeft);
            spritesChainRight.push(spriteRight);
        }
        this.spritesChainLeft = spritesChainLeft;
        this.spritesChainRight = spritesChainRight;


        // Constraints
        const constraintsNet = [
            {
                bodyA: compositeNet.composites[0].bodies[6],
                bodyB: compositeNet.composites[1].bodies[0],
                length: 190
            },
            {
                bodyA: compositeNet.composites[0].bodies[9],
                bodyB: compositeNet.composites[1].bodies[3],
                length: 170
            },
            {
                bodyA: compositeNet.composites[0].bodies[11],
                bodyB: compositeNet.composites[1].bodies[7],
                length: 120
            },

            {
                bodyA: compositeNet.composites[1].bodies[6],
                bodyB: compositeNet.composites[0].bodies[0],
                length: 190
            },
            {
                bodyA: compositeNet.composites[1].bodies[9],
                bodyB: compositeNet.composites[0].bodies[3],
                length: 170
            },
            {
                bodyA: compositeNet.composites[1].bodies[11],
                bodyB: compositeNet.composites[0].bodies[7],
                length: 120
            },
        ];
        this.constraintsNet = constraintsNet;

        let spritesNetConstraints = [];
        constraintsNet.forEach(constraint => {
            Composite.add(this.compositeNet, Constraint.create({
                bodyA: constraint.bodyA,
                bodyB: constraint.bodyB,
                pointA: Vector.create(0, 0),
                pointB: Vector.create(0, 0),
                stiffness: 0.5,
                length: constraint.length
            }));


            let sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            sprite.tint = this.netTint;
            sprite.anchor.set(0.5);
            pixiApp.stage.addChild(sprite);
            spritesNetConstraints.push(sprite);
        });
        this.spritesNetConstraints = spritesNetConstraints;

        let spritesNetConstraintsDecoration = [];
        for (let i = 0; i < 2; i++) {
            let sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            sprite.tint = this.netTint;
            sprite.anchor.set(0.5);
            pixiApp.stage.addChild(sprite);
            spritesNetConstraintsDecoration.push(sprite);
        }
        this.spritesNetConstraintsDecoration = spritesNetConstraintsDecoration;
    }

    deleteSelf(pixiApp, matterEngine) {
        this.spritesChainLeft.forEach(sprite => {
            pixiApp.stage.removeChild(sprite);
        });
        this.spritesChainRight.forEach(sprite => {
            pixiApp.stage.removeChild(sprite);
        });
        this.spritesNetConstraints.forEach(sprite => {
            pixiApp.stage.removeChild(sprite);
        });
        this.spritesNetConstraintsDecoration.forEach(sprite => {
            pixiApp.stage.removeChild(sprite);
        });

        Composite.remove(matterEngine.world, [this.compositeNet]);
    }

    update() {
        for (let i = 1; i < this.chainKnotsCount; i++) {
            let rectLeft = this.rectBetweenTwoPoints(
                this.compositeNet.composites[0].bodies[i - 1].position,
                this.compositeNet.composites[0].bodies[i].position,
                10
            );

            this.spritesChainLeft[i - 1].x = rectLeft.x;
            this.spritesChainLeft[i - 1].y = rectLeft.y;
            this.spritesChainLeft[i - 1].width = rectLeft.width;
            this.spritesChainLeft[i - 1].height = rectLeft.height;
            this.spritesChainLeft[i - 1].rotation = rectLeft.angle;


            let rectRight = this.rectBetweenTwoPoints(
                this.compositeNet.composites[1].bodies[i - 1].position,
                this.compositeNet.composites[1].bodies[i].position,
                10
            );

            this.spritesChainRight[i - 1].x = rectRight.x;
            this.spritesChainRight[i - 1].y = rectRight.y;
            this.spritesChainRight[i - 1].width = rectRight.width;
            this.spritesChainRight[i - 1].height = rectRight.height;
            this.spritesChainRight[i - 1].rotation = rectRight.angle;
        }

        for (let i = 0; i < this.constraintsNet.length; i++) {
            const constraint = this.constraintsNet[i];

            let rect = this.rectBetweenTwoPoints(
                constraint.bodyA.position,
                constraint.bodyB.position,
                5
            );

            this.spritesNetConstraints[i].x = rect.x;
            this.spritesNetConstraints[i].y = rect.y;
            this.spritesNetConstraints[i].width = rect.width;
            this.spritesNetConstraints[i].height = rect.height;
            this.spritesNetConstraints[i].rotation = rect.angle;
        }

        // decorational net constraint sprites
        let rectDecorationLeft = this.rectBetweenTwoPoints(
            this.compositeNet.composites[0].bodies[3].position,
            Vector.create(this.basketCornerLeft.x + 0.3 * (this.basketCornerRight.x - this.basketCornerLeft.x), this.basketCornerLeft.y),
            5
        );
        this.spritesNetConstraintsDecoration[0].x = rectDecorationLeft.x;
        this.spritesNetConstraintsDecoration[0].y = rectDecorationLeft.y;
        this.spritesNetConstraintsDecoration[0].width = rectDecorationLeft.width;
        this.spritesNetConstraintsDecoration[0].height = rectDecorationLeft.height;
        this.spritesNetConstraintsDecoration[0].rotation = rectDecorationLeft.angle;

        let rectDecorationRight = this.rectBetweenTwoPoints(
            this.compositeNet.composites[1].bodies[3].position,
            Vector.create(this.basketCornerRight.x - 0.3 * (this.basketCornerRight.x - this.basketCornerLeft.x), this.basketCornerRight.y),
            5
        );
        this.spritesNetConstraintsDecoration[1].x = rectDecorationRight.x;
        this.spritesNetConstraintsDecoration[1].y = rectDecorationRight.y;
        this.spritesNetConstraintsDecoration[1].width = rectDecorationRight.width;
        this.spritesNetConstraintsDecoration[1].height = rectDecorationRight.height;
        this.spritesNetConstraintsDecoration[1].rotation = rectDecorationRight.angle;
    }

    rectBetweenTwoPoints(pointA, pointB, width) {
        let centerPos = Vector.create(
            (pointA.x + pointB.x) / 2.0,
            (pointA.y + pointB.y) / 2.0,
        );

        let height = Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));

        let ninety = Math.PI / 2;
        let angle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) - ninety;

        return {
            x: centerPos.x,
            y: centerPos.y,
            width,
            height,
            angle
        };
    }
}