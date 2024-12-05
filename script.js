const restartBtn = document.getElementById("restart");
restartBtn.addEventListener("click", () => restart());
// const canvas = document.getElementsByTagName("canvas");
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

const SICK = 0,
  CLEAN = 1;

const WIDTH = 500,
  HEIGHT = 500;
const NODE_RAD = 20;

/** @type {Vertex[]} */
let selected = [];
let selectedEdge;

let WIN = false;
let FIRST_LOAD = true;
let ONBOARDING_TEXT =
  "In this game, all vertices and edges of a graph are covered by a contaminant " +
  "(indicated with green). The contaminant must be removed using cleaning brushes. " +
  "Brushes start at vertices and can travel along adjacent edges. Traveling an edge " +
  "means both the edge and the ending vertex are cleaned.\n\n" +
  "" +
  "The main challange in the game comes from the fact that you can only move a brush from a vertex if the number " +
  "of brushes it holds is greater than or equal to its own degree\n\n" +
  "" +
  "You goal is to clean the graph.\n\n" +
  "How To Play:\n" +
  "- Create brushes by right clicking on vertices\n" +
  "- Move a brush from one vertex V to an adjacent vertex U by left clicking on V and then U. \n\n";

let error = "";

class Vertex {
  constructor(id, x, y, radius, state, brushNumber) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.state = state || SICK;
    this.brushNumber = brushNumber || 0;
    this.degree = 0;
  }

  draw() {
    if (this.degree == 0) this.state = CLEAN;

    if (dist(mouseX, mouseY, this.x, this.y) < this.radius) {
      fill(240);
    } else {
      fill(255);
    }

    if (selected[0] == this || selected[1] == this) {
      strokeWeight(5);
    } else {
      strokeWeight(2);
    }
    if (this.state === SICK) {
      stroke(color(0, 200, 0));
    } else {
      stroke(0);
    }
    circle(this.x, this.y, this.radius);

    noStroke();
    fill(0);
    textAlign(CENTER);
    textSize(15);

    text(this.brushNumber, this.x, this.y);

    textSize(10);
    text("deg: " + this.degree, this.x, this.y + 10);
  }

  /**
   * @param firstClick {(v: Vertex) => void}
   * @param secondClick {(v: Vertex) => void}
   */
  clicked(firstClick, secondClick) {
    if (dist(mouseX, mouseY, this.x, this.y) < this.radius) {
      if (selected.length == 1) {
        let e = graph.e.find(
          (e) =>
            (e[0] == selected[0].id && e[1] == this.id) ||
            (e[1] == selected[0].id && e[0] == this.id)
        );
        if (this == selected[0]) {
          secondClick(this);
          error = "";
        } else if (e != undefined) {
          if (selected[0].brushNumber >= selected[0].degree) {
            secondClick(this);
            error = "";
          } else error = "Cannot Move! Brush Count < Degree";
        } else error = "Cannot Move! Vertex not Adjacent";
      } else firstClick(this);
    }
  }
}

let clicks = 0;
let brushes = 0;
/** @type {{n: number, n1: number, n2: number, e: [number, number, number][], type: "Cn" | "Kn" | "Bi" | "Knm" }} */
let graph = {
  n: 0,
  n1: 0,
  n2: 0,
  e: [],
  type: "",
};

/** @type {Vertex[]} */
let buttons = [];

function restart() {
  clicks = 0;
  brushes = 0;
  WIN = false;
  selected = [];
  graph = randomGraph();
}

function randInt(min = 0, max = 0) {
  if (min > max) {
    let temp = min;
    min = max;
    max = temp;
  }
  if (max == min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGraph() {
  buttons = [];
  let out = {
    n: 0,
    n1: 0,
    n2: 0,
    e: [],
    type: "",
  };

  switch (randInt(0, 3)) {
    case 0:
      out.n = randInt(5, 7);
      out.type = "Kn";
      for (let i = 0; i < out.n; i++) {
        for (let j = i; j < out.n; j++) {
          if (i != j) out.e.push([i, j, SICK]);
        }
      }
      break;
    case 1:
      out.n = randInt(5, 7);
      out.type = "Cn";
      for (let i = 0; i < out.n; i++) {
        out.e.push([i, (i + 1) % out.n, SICK]);
      }
      break;
    case 2:
      out.n1 = randInt(2, 4);
      out.n2 = randInt(2, 4);
      out.n = out.n1 + out.n2;
      out.type = "Knm";

      for (let i = 0; i < out.n1; i++) {
        for (let j = 0; j < out.n2; j++) {
          if (i != out.n1 + j) out.e.push([i, out.n1 + j, SICK]);
        }
      }

      break;
    case 3:
      out.n1 = randInt(2, 4);
      out.n2 = randInt(2, 4);
      out.n = out.n1 + out.n2;
      out.type = "Bi";

      for (let i = 0; i < out.n1; i++) {
        for (let j = 0; j < out.n2; j++) {
          if (i != out.n1 + j) out.e.push([i, out.n1 + j, SICK]);
        }
      }

      for (let i = 0; i < out.n1 * out.n2; i++) {
        if (randInt(0, 1) == 1) out.e.splice(i, 1);
      }

      break;
    default:
      break;
  }

  if (out.type == "Knm" || out.type == "Bi") {
    for (let i = 0; i < out.n1; i++) {
      buttons.push(
        new Vertex(
          i,
          -150 + WIDTH / 2,
          100 * (0.5 + i - out.n1 / 2) + HEIGHT / 2,
          NODE_RAD
        )
      );
    }
    for (let i = 0; i < out.n2; i++) {
      buttons.push(
        new Vertex(
          i + out.n1,
          150 + WIDTH / 2,
          100 * (0.5 + i - out.n2 / 2) + HEIGHT / 2,
          NODE_RAD
        )
      );
    }
  } else {
    for (let i = 0; i < out.n; i++) {
      buttons.push(
        new Vertex(
          i,
          150 * Math.cos((i * 2 * Math.PI) / out.n) + WIDTH / 2,
          150 * Math.sin((i * 2 * Math.PI) / out.n) + HEIGHT / 2,
          NODE_RAD
        )
      );
    }
  }

  out.e.forEach((edge) => {
    // console.log(edge);
    if (buttons[edge[0]]) buttons[edge[0]].degree++;
    if (buttons[edge[1]]) buttons[edge[1]].degree++;
  });

  return out;
}

function dist(a, b, x, y) {
  return Math.sqrt((a - x) * (a - x) + (b - y) * (b - y));
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  noStroke();
  ellipseMode(RADIUS);
  restart();
  textFont("Bricolage Grotesque");
}

function draw() {
  background(200);

  noStroke();
  fill(0);
  textAlign(CENTER);
  textSize(20);

  if (FIRST_LOAD) {
    text("Brush Number Game", WIDTH / 2, 30);
    textSize(16);
    text("Click Anywhere to Start", WIDTH / 2, 60);

    textAlign(LEFT);
    text(ONBOARDING_TEXT, WIDTH / 2 - 225, 90, 450);

    return;
  }
  let c =
    (graph.type == "Knm") | (graph.type == "Bi")
      ? graph.n1 + "," + graph.n2
      : graph.n;
  text(`Graph Type: ${graph.type[0] + c}`, WIDTH / 2, 20);
  text("Moves: " + clicks, WIDTH / 2, 40);
  text("Brushes: " + brushes, WIDTH / 2, 60);
  if (WIN) text("YOU WIN!!", WIDTH / 2, 80);
  if (error) text(error, WIDTH / 2, 480);
  // buttons.forEach((button) => button.draw());
  graph.e.forEach((edge) => {
    const b1 = buttons[edge[0]];
    const b2 = buttons[edge[1]];

    strokeWeight(2);
    stroke(edge[2] === SICK ? color(0, 200, 0) : 0);

    line(b1.x, b1.y, b2.x, b2.y);

    // strokeWeight(20);
    // stroke(color(100, 100, 200, 100));
    // line(b1.x, b1.y, b2.x, b2.y);
  });

  if (selected.length) {
    graph.e.forEach((edge) => {
      // if (edge[2] == CLEAN) return;

      const b1 = buttons[edge[0]];
      const b2 = buttons[edge[1]];
      if (b1 == selected[0] || b2 == selected[0]) {
      } else return;

      // strokeWeight(2);
      // stroke(edge[2] === SICK ? color(0, 200, 0) : 0);

      strokeWeight(20);
      stroke(color(100, 100, 100, 100));
      line(b1.x, b1.y, b2.x, b2.y);
    });
  }
  buttons.forEach((button) => button.draw());
}

function mousePressed() {
  if (FIRST_LOAD) {
    FIRST_LOAD = false;
    return;
  }
  buttons.forEach((button) => {
    if (WIN) return;
    if (mouseButton != "left") {
      button.clicked(
        (v) => {
          v.brushNumber++;
          brushes++;
        },
        (v) => {
          v.brushNumber++;
          brushes++;
        }
      );
      return;
    }
    button.clicked(
      (v) => {
        selected = [v];
      },
      (v) => {
        if (v == selected[0]) {
          selected = [];
          return;
        }
        if (selected[0].brushNumber == 0) {
          selected = [];
          return;
        }
        selected[0].brushNumber -= 1;
        v.brushNumber += 1;
        v.state = CLEAN;

        graph.e.forEach((edge) => {
          const b1 = buttons[edge[0]];
          const b2 = buttons[edge[1]];
          if (
            (b1 == selected[0] && b2 == v) ||
            (b2 == selected[0] && b1 == v)
          ) {
            edge[2] = CLEAN;
          } else return;
        });
        selected = [];
        clicks++;
      }
    );
  });
  if (!WIN) {
    if (buttons.find((v) => v.state != CLEAN) != undefined) return;
    if (graph.e.find((e) => e[2] != CLEAN) != undefined) return;
    WIN = true;
  }
}
