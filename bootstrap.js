const
    Vector = Matter.Vector,
    Events = Matter.Events,
    Engine = Matter.Engine,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Composites = Matter.Composites,
    Composite = Matter.Composite;


let PIXI_APP = new PIXI.Application({ background: '#1099bb', resizeTo: window });
PIXI_APP.stage.sortableChildren = true;
let CANVAS = document.body.appendChild(PIXI_APP.view);
let SCREEN_WIDTH = PIXI_APP.screen.width;
let SCREEN_HEIGHT = PIXI_APP.screen.height;

let MATTER_ENGINE = Engine.create();
MATTER_ENGINE.gravity.scale = 0.01;
Runner.run(Runner.create(), MATTER_ENGINE);