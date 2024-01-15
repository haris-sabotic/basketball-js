class Hoop {
    #net = null;
    #ratio = 463 / 745;
    #basketHeight = 15;

    #spriteBoard = null;
    #spriteBasket = null;

    #sensorBasket = null;
    #bodyEdgeLeft = null;
    #bodyEdgeRight = null;

    /**
     * 
     * @param {PIXI.Application} pixiApp 
     * @param {Matter.Engine} matterEngine
     * @param {{width: number, position: Matter.Vector}} attributes 
     */
    constructor(pixiApp, matterEngine, attributes) {
        let board = new PIXI.Sprite(BOARD_TEXTURE);
        board.anchor.set(0.5);
        board.width = attributes.width;
        board.height = this.#ratio * attributes.width;
        board.x = attributes.position.x;
        board.y = attributes.position.y;
        pixiApp.stage.addChild(board);
        this.#spriteBoard = board;


        let basket = new PIXI.Sprite(PIXI.Texture.WHITE);
        basket.tint = 0xFF0000;
        basket.anchor.set(0.5);
        basket.width = Math.round(board.width * 0.30);
        basket.height = this.#basketHeight;
        basket.x = this.#getSpriteBasketPosition().x;
        basket.y = this.#getSpriteBasketPosition().y;
        basket.zIndex = 100;
        pixiApp.stage.addChild(basket);
        this.#spriteBasket = basket;


        let edgeLeftPos = this.#getSpriteEdgeLeftPosition();
        let edgeLeftBody = Bodies.rectangle(
            edgeLeftPos.x,
            edgeLeftPos.y,
            this.#basketHeight,
            this.#basketHeight,
            { isStatic: true, label: "edgeLeft" }
        );
        let edgeRightPos = this.#getSpriteEdgeRightPosition();
        let edgeRightBody = Bodies.rectangle(
            edgeRightPos.x,
            edgeRightPos.y,
            this.#basketHeight,
            this.#basketHeight,
            { isStatic: true, label: "edgeRight" }
        );
        Composite.add(matterEngine.world, [edgeLeftBody, edgeRightBody]);
        this.#bodyEdgeLeft = edgeLeftBody;
        this.#bodyEdgeRight = edgeRightBody;

        let sensorBasketRect = this.#getSensorBasketRect();
        let sensorBasket = Bodies.rectangle(
            sensorBasketRect.x,
            sensorBasketRect.y,
            sensorBasketRect.width,
            sensorBasketRect.height,
            { isStatic: true, isSensor: true, label: "sensorBasket" }
        );
        Composite.add(matterEngine.world, [sensorBasket]);
        this.#sensorBasket = sensorBasket;

        // NET

        let netCorners = this.#getNetCorners();
        let net = new Net(pixiApp, matterEngine, netCorners.left, netCorners.right, attributes.width);
        this.#net = net;
    }

    deleteSelf(pixiApp, matterEngine) {
        pixiApp.stage.removeChild(this.#spriteBasket);
        pixiApp.stage.removeChild(this.#spriteBoard);

        Composite.remove(matterEngine.world, [this.#bodyEdgeLeft, this.#bodyEdgeRight, this.#sensorBasket]);

        this.#net.deleteSelf(pixiApp, matterEngine);
    }

    update() {
        this.#net.update();
    }

    /**
     * 
     * @param {Matter.Vector} newPosition 
     */
    setPosition(newPosition) {
        this.#spriteBoard.x = newPosition.x;
        this.#spriteBoard.y = newPosition.y;

        const basketPos = this.#getSpriteBasketPosition();
        this.#spriteBasket.x = basketPos.x;
        this.#spriteBasket.y = basketPos.y;

        const edgeLeftPos = this.#getSpriteEdgeLeftPosition();
        const edgeRightPos = this.#getSpriteEdgeRightPosition();
        Body.setPosition(this.#bodyEdgeLeft, edgeLeftPos);
        Body.setPosition(this.#bodyEdgeRight, edgeRightPos);

        let sensorBasketRect = this.#getSensorBasketRect();
        Body.setPosition(this.#sensorBasket, Vector.create(sensorBasketRect.x, sensorBasketRect.y));

        let netCorners = this.#getNetCorners();
        this.#net.setPosition(netCorners.left, netCorners.right);
    }

    moveHorizontally(amount) {
        this.setPosition(
            Vector.create(this.#spriteBoard.x + amount, this.#spriteBoard.y)
        );
    }

    moveVertically(amount) {
        this.setPosition(
            Vector.create(this.#spriteBoard.x, this.#spriteBoard.y + amount)
        );
    }

    centerPos() {
        return Vector.create(this.#spriteBoard.x, this.#spriteBoard.y);
    }

    #getNetCorners() {
        return {
            left: Vector.create(this.#spriteBasket.x - this.#spriteBasket.width / 2, this.#spriteBasket.y),
            right: Vector.create(this.#spriteBasket.x + this.#spriteBasket.width / 2, this.#spriteBasket.y)
        };
    }

    #getSensorBasketRect() {
        let width = this.#spriteBasket.width / 2;
        let height = this.#basketHeight;
        return {
            x: this.#spriteBasket.x,
            y: this.#spriteBoard.y + this.#spriteBoard.height,
            width: width,
            height: height,
        };
    }

    #getSpriteBasketPosition() {
        return Vector.create(
            this.#spriteBoard.position.x,
            this.#spriteBoard.position.y + this.#spriteBoard.height / 3
        );
    }

    #getSpriteEdgeLeftPosition() {
        return Vector.create(
            this.#spriteBasket.x - this.#spriteBasket.width / 2 + this.#basketHeight / 2,
            this.#spriteBasket.y
        );
    }
    #getSpriteEdgeRightPosition() {
        return Vector.create(
            this.#spriteBasket.x + this.#spriteBasket.width / 2 - this.#basketHeight / 2,
            this.#spriteBasket.y
        );
    }
}