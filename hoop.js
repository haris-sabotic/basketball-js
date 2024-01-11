class Hoop {
    #position = null;
    #net = null;
    #ratio = 3 / 4;
    #basketHeight = 15;

    #spriteBoard = null;
    // #spriteBoardBackground = null;
    // #spriteDecorationBackground = null;
    // #spriteDecorationForeground = null;
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
        this.#position = attributes.position;

        let board = PIXI.Sprite.from("assets/board.jpg");
        board.anchor.set(0.5);
        board.width = attributes.width;
        board.height = this.#ratio * attributes.width;
        board.x = attributes.position.x;
        board.y = attributes.position.y;
        // pixiApp.stage.addChild(board);
        this.#spriteBoard = board;

        // let boardBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        // boardBackground.tint = 0x000000;
        // boardBackground.anchor.set(0.5);
        // boardBackground.width = attributes.width + this.#basketHeight;
        // boardBackground.height = this.#ratio * attributes.width + this.#basketHeight;
        // boardBackground.x = attributes.position.x;
        // boardBackground.y = attributes.position.y;
        // pixiApp.stage.addChild(boardBackground);
        // this.#spriteBoardBackground = boardBackground;

        // let board = new PIXI.Sprite(PIXI.Texture.WHITE);
        // board.tint = 0xFFFFFF;
        // board.anchor.set(0.5);
        // board.width = attributes.width;
        // board.height = this.#ratio * attributes.width;
        // board.x = attributes.position.x;
        // board.y = attributes.position.y;
        // pixiApp.stage.addChild(board);
        // this.#spriteBoard = board;


        // let decorationBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        // decorationBackground.tint = 0x000000;
        // decorationBackground.anchor.set(0.5);
        // decorationBackground.width = board.width * 0.5;
        // decorationBackground.height = board.height * 0.5;
        // decorationBackground.x = board.position.x;
        // decorationBackground.y = board.position.y;
        // pixiApp.stage.addChild(decorationBackground);
        // this.#spriteDecorationBackground = decorationBackground;

        // let decorationForeground = new PIXI.Sprite(PIXI.Texture.WHITE);
        // decorationForeground.tint = 0xFFFFFF;
        // decorationForeground.anchor.set(0.5);
        // decorationForeground.width = board.width * 0.5 - this.#basketHeight;
        // decorationForeground.height = board.height * 0.5 - this.#basketHeight;
        // decorationForeground.x = board.position.x;
        // decorationForeground.y = board.position.y;
        // pixiApp.stage.addChild(decorationForeground);
        // this.#spriteDecorationForeground = decorationForeground;


        let basket = new PIXI.Sprite(PIXI.Texture.WHITE);
        basket.tint = 0xFF0000;
        basket.anchor.set(0.5);
        basket.width = Math.round(board.width * 0.45);
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

        let leftCorner = Vector.create(basket.x - basket.width / 2, basket.y);
        let rightCorner = Vector.create(basket.x + basket.width / 2, basket.y);
        let net = new Net(pixiApp, matterEngine, leftCorner, rightCorner, attributes.width);
        this.#net = net;
    }

    deleteSelf(pixiApp, matterEngine) {
        pixiApp.stage.removeChild(this.#spriteBasket);
        pixiApp.stage.removeChild(this.#spriteBoard);
        // pixiApp.stage.removeChild(this.#spriteBoardBackground);
        // pixiApp.stage.removeChild(this.#spriteDecorationBackground);
        // pixiApp.stage.removeChild(this.#spriteDecorationForeground);

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
        this.#position = newPosition;

        this.#spriteBoard.x = newPosition.x;
        this.#spriteBoard.y = newPosition.y;
        // this.#spriteBoardBackground.x = newPosition.x;
        // this.#spriteBoardBackground.y = newPosition.y;

        // this.#spriteDecorationBackground.x = newPosition.x;
        // this.#spriteDecorationBackground.y = newPosition.y;
        // this.#spriteDecorationForeground.x = newPosition.x;
        // this.#spriteDecorationForeground.y = newPosition.y;

        const basketPos = this.#getSpriteBasketPosition();
        this.#spriteBasket.x = basketPos.x;
        this.#spriteBasket.y = basketPos.y;

        const edgeLeftPos = this.#getSpriteEdgeLeftPosition();
        const edgeRightPos = this.#getSpriteEdgeRightPosition();
        Body.setPosition(this.#bodyEdgeLeft, edgeLeftPos);
        Body.setPosition(this.#bodyEdgeRight, edgeRightPos);

        let sensorBasketRect = this.#getSensorBasketRect();
        Body.setPosition(this.#sensorBasket, Vector.create(sensorBasketRect.x, sensorBasketRect.y));
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
            this.#spriteBoard.position.y + this.#spriteBoard.height / 4
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