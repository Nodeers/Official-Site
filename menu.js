	$(document).ready(function(){
		// set up hover panels
		// although this can be done without JavaScript, we've attached these events
		// because it causes the hover to be triggered when the element is tapped on a touch device
		$('.hover').hover(function(){
			$(this).addClass('flip');
		},function(){
			$(this).removeClass('flip');
		});
	});

function ul(index) {
	console.log('click!' + index)
	
	var underlines = document.querySelectorAll(".underline");

	for (var i = 0; i < underlines.length; i++) {
		underlines[i].style.transform = 'translate3d(' + index * 100 + '%,0,0)';
	}
}

//* workflow*//

const center = { x: 325, y: 175 };
const serv_dist = 250;
const pointer_dist = 172;
const pointer_time = 2;
const icon_size = 42;
const circle_radius = 38;
const text_top_margin = 18;
const tspan_delta = 16;

//name is used as the title for the bubble
//icon is the id of the corresponding svg symbol
const services_data = [
{ name: "Industries", icon: "industries" },
{ name: "Validation\n(C&Q and CSV)", icon: "validation" },
{ name: "Engineering", icon: "engineering" },
{ name: "Project\nManagement", icon: "management" },
{ name: "Manufacturing\nIT", icon: "manufacturing" },
{ name: "Technical\nServices", icon: "technical" },
{ name: "Process\nAutomation", icon: "process" }];


const services = document.getElementById("service-collection");
const nav_container = document.getElementById("circle-nav-services");
const symbol_copy = document.getElementById("circle-nav-copy");
const use_copy = document.querySelector("use.nav-copy");

//Keeps code DRY avoiding namespace for element creation
function createSVGElement(el) {
  return document.createElementNS("http://www.w3.org/2000/svg", el);
}

//Quick setup for multiple attributes
function setAttributes(el, options) {
  Object.keys(options).forEach(function (attr) {
    el.setAttribute(attr, options[attr]);
  });
}

//Service bubbles are created dynamically
function addService(serv, index) {
  let group = createSVGElement("g");
  group.setAttribute("class", "service serv-" + index);

  /* This group is needed to apply animations in
                                                          the icon and its background at the same time */
  let icon_group = createSVGElement("g");
  icon_group.setAttribute("class", "icon-wrapper");

  let circle = createSVGElement("circle");
  setAttributes(circle, {
    r: circle_radius,
    cx: center.x,
    cy: center.y });

  let circle_shadow = circle.cloneNode();
  setAttributes(circle, {
    class: 'shadow' });

  icon_group.appendChild(circle_shadow);
  icon_group.appendChild(circle);

  let symbol = createSVGElement("use");
  setAttributes(symbol, {
    'x': center.x - icon_size / 2,
    'y': center.y - icon_size / 2,
    'width': icon_size,
    'height': icon_size });

  symbol.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + serv.icon);
  icon_group.appendChild(symbol);

  group.appendChild(icon_group);

  let text = createSVGElement("text");
  setAttributes(text, {
    x: center.x,
    y: center.y + circle_radius + text_top_margin });


  let tspan = createSVGElement("tspan");
  if (serv.name.indexOf('\n') >= 0) {

    let tspan2 = tspan.cloneNode();
    let name = serv.name.split('\n');
    jQuery(tspan).text(name[0]);
    jQuery(tspan2).text(name[1]);

    setAttributes(tspan2, {
      x: center.x,
      dy: tspan_delta });


    text.appendChild(tspan);
    text.appendChild(tspan2);
  } else
  {
    jQuery(tspan).text(serv.name);
    text.appendChild(tspan);
  }

  group.appendChild(text);
  services.appendChild(group);

  let service_bubble = jQuery(".serv-" + index);

  //Uses tween to look for right position
  twn_pivot_path.seek(index);
  TweenLite.set(service_bubble, {
    x: pivot_path.x,
    y: pivot_path.y,
    transformOrigin: "center center" });


  service_bubble.click(serviceClick);
}

//Creates pointer
function createPointer() {
  let service_pointer = createSVGElement("circle");

  setAttributes(service_pointer, {
    cx: center.x - pointer_dist,
    cy: center.y,
    r: 12,
    class: "pointer" });


  nav_container.appendChild(service_pointer);

  service_pointer = document.querySelector("svg .pointer");

  let pointer_circle = [
  { x: 0, y: 0 },
  { x: pointer_dist, y: pointer_dist },
  { x: pointer_dist * 2, y: 0 },
  { x: pointer_dist, y: -pointer_dist },
  { x: 0, y: 0 }];


  twn_pointer_path.to(service_pointer, pointer_time, {
    bezier: {
      values: pointer_circle,
      curviness: 1.5 },
    ease: Power0.easeNone,
    transformOrigin: "center center" });


}

//Defines behavior for service bubbles
function serviceClick(ev) {

  //There's always an active service
  jQuery(".service.active").removeClass("active");

  let current = jQuery(ev.currentTarget);
  current.addClass("active");

  //There's a "serv-*" class for each bubble
  let current_class = current.attr("class").split(" ")[1];
  let class_index = current_class.split('-')[1];

  //Hides current text of the main bubble
  jQuery(use_copy).addClass("changing");

  //Sets pointer to the right position
  twn_pointer_path.tweenTo(class_index * (pointer_time / (2 * 6)));

  //After it's completely hidden, the text changes and becomes visible
  setTimeout(() => {
    let viewBoxY = 300 * class_index;
    symbol_copy.setAttribute("viewBox", "0 " + viewBoxY + " 300 300");
    jQuery(use_copy).removeClass("changing");
  }, 250);
}

//Array describes points for a whole circle in order to get
//the right curve
let half_circle = [
{ x: -serv_dist, y: 0 },
{ x: 0, y: serv_dist },
{ x: serv_dist, y: 0 },
{ x: 0, y: -serv_dist },
{ x: -serv_dist, y: 0 }];


//A simple object is used in the tween to retrieve its values
var pivot_path = { x: half_circle[0].x, y: half_circle[0].y };

//The object is animated with a duration based on how many bubbles
//should be placed
var twn_pivot_path = TweenMax.to(pivot_path, 12, {
  bezier: {
    values: half_circle,
    curviness: 1.5 },

  ease: Linear.easeNone });


services_data.reduce((count, serv) => {
  addService(serv, count);
  return ++count;
}, 0);

//The variable is modified inside the function
//but its also used later to toggle its class
var twn_pointer_path = new TimelineMax({ paused: true });
createPointer();

//Adding it immediately triggers a bug for the transform
setTimeout(() => jQuery("#service-collection .serv-0").addClass("active"), 200);


$(document).ready(function(){
    animateDiv('.a');
    animateDiv('.b');
    animateDiv('.c');
    animateDiv('.d');
    animateDiv('.e');
    animateDiv('.f');
    animateDiv('.g');
    animateDiv('.h');
    animateDiv('.i');
});

function makeNewPosition(){
    
    // Get viewport dimensions (remove the dimension of the div)
    var h = $(window).height()  -50;
    var w = $(window).width() - 30;
    
    var nh = Math.floor(Math.random() * h);
    var nw = Math.floor(Math.random() * w);
    
    return [nh, nw];    
    
}

function animateDiv(myclass){
    var newq = makeNewPosition();
    $(myclass).animate({ top: newq[0], left: newq[1] }, 1200,   function(){
      animateDiv(myclass);        
    });
    
};


$(function() {
    $('.banner').unslider({
      //  Enable keyboard arrows
      keys: true,               
			// Enable dot nav
      dots: true,
      delay: 7000
    });
});



//* footer *//

let canvas, ctx;
let render, init;
let surface;

class Surface {
  constructor(points = 5) {
    this.stage = document.createElement('canvas');
    this.stage.id = "surfaceCanvas";

    this.initialise();

    this.onMouseMove = this.onMouseMove.bind(this);

    window.addEventListener('pointermove', this.onMouseMove);

    this.numPoints = points;

    this.running = true;
  }

  initialise() {
    this.points = [];
    for (let i = 0; i <= this.numPoints; i++) {
      this.points.push(new SurfacePoint(i, undefined, Math.random() * 2));
    }

    // window.p = this.points[50];
  }

  render(delta) {
    let ctx = this.stage.getContext('2d');

    let y = this.height / 2;
    // ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = 'RGBA(220,220,220,' + (Math.sin(delta * .0001) * .08 + .1) + ')';
    ctx.rect(0, 0, this.width, this.height);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, y);

    // let right = this.points[1];
    this.points.forEach((point, index) => {

      let left1 = this.points[index - 1];
      let right1 = this.points[index + 1];
      let left2 = this.points[index - 2];
      let right2 = this.points[index + 2];

      let left1Height = left1 ? left1.height : 0;
      let right1Height = right1 ? right1.height : 0;
      let left2Height = left2 ? left2.height : 0;
      let right2Height = right2 ? right2.height : 0;

      // acceleration
      point.acceleration = (-0.3 * point.height + (left1Height - point.height) + (right1Height - point.height)) * this.elasticity - point.speed * this.friction;
      point.acceleration += (-0.3 * point.height + (left2Height - point.height) + (right2Height - point.height)) * (this.elasticity / 2) - point.speed * this.friction;

      // speed
      point.speed += point.acceleration * 5;

      // height
      point.height += point.speed * 10;

      let p1 = new Vector(this.segWidth * (index - 1), y + left1Height);
      let p2 = new Vector(this.segWidth * index, y + point.height);
      var xc = (p1.x + p2.x) / 2;
      var yc = (p1.y + p2.y) / 2;
      ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
    });

    let p1 = new Vector(this.segWidth * this.numPoints, y + this.points[this.points.length - 1].height);
    let p2 = new Vector(this.segWidth * this.numPoints + 1, y);
    var xc = (p1.x + p2.x) / 2;
    var yc = (p1.y + p2.y) / 2;
    ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);

    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fillStyle = this.colour;
    ctx.fill();
    // ctx.stroke();

    if (this.running) {
      window.requestAnimationFrame(this.render.bind(this));
    }
  }

  onMouseMove(e) {

    e.preventDefault();

    let mousePos = new Vector(e.clientX + 250, e.clientY); // The 250 here is just to make up for the offset on screen

    let difference = this.oldMousePos.subtractNew(mousePos);
    let offset = this.stage.getBoundingClientRect();

    let normalisedPos1 = mousePos.y - (offset.top + this.height / 2);
    let normalisedPos2 = this.oldMousePos.y - (offset.top + this.height / 2);

    let changed = normalisedPos1 * normalisedPos2 < 0;

    if (changed) {
      let closestPointIndex = Math.round(mousePos.x / (this.width / this.numPoints));
      let closestPoint = this.points[closestPointIndex];
      let power = difference.y * .02;
      if (power > 5) {
        power = 5;
      } else if (power < -5) {
        power = -5;
      }
      closestPoint.speed += -power;
    }

    this.oldMousePos = mousePos;
  }

  set oldMousePos(value) {
    if (value instanceof Vector) {
      this._oldMousePos = value;
    }
  }
  get oldMousePos() {
    return this._oldMousePos instanceof Vector ? this._oldMousePos : new Vector(0, 0);
  }

  set elasticity(value) {
    if (typeof value === 'number') {
      this._elasticity = value;
    }
  }
  get elasticity() {
    return this._elasticity || 0.0001;
  }
  set friction(value) {
    if (typeof value === 'number') {
      this._friction = value;
    }
  }
  get friction() {
    return this._friction || 0.0015;
  }

  set numPoints(value) {
    let oldNumPoints = this._numPoints;
    if (typeof value == 'number' && oldNumPoints != value) {
      this._numPoints = value;
      this.initialise();
    }
  }
  get numPoints() {
    return this._numPoints;
  }

  set running(value) {
    let oldValue = this._running;
    this._running = value === true;
    if (value === true && oldValue !== true) {
      this.render();
    }
  }
  get running() {
    return this._running === true;
  }

  set stage(element) {
    if (element instanceof HTMLElement) {
      this._stage = element;
    }
  }
  get stage() {
    return this._stage;
  }

  get segWidth() {
    return this.width / this.numPoints;
  }

  set width(value) {
    if (typeof value == 'number') {
      this._width = value;
      this.stage.width = this._width;
    }
  }
  get width() {
    return this._width || window.innerWidth;
  }
  set height(value) {
    if (typeof value == 'number') {
      this._height = value;
      this.stage.height = this._height;
    }
  }
  get height() {
    return this._height || window.innerHeight;
  }

  set colour(value) {
    this._colour = value;
  }
  get colour() {
    return this._colour || "#18d618";
  }}


class SurfacePoint {
  constructor(index, acceleration, speed, height) {
    this.index = index;
    this.acceleration = acceleration;
    this.speed = speed;
    this.height = height;
  }

  set height(value) {
    if (typeof value == 'number') {
      this._height = value;
      // this._height = value > 300 ? 300 : (value < -300 ? -300 : value);
    }
  }
  get height() {
    return typeof this._height == 'number' ? this._height : 0;
  }
  set speed(value) {
    if (typeof value == 'number') {
      this._speed = value;
    }
  }
  get speed() {
    return typeof this._speed == 'number' ? this._speed : 0;
  }
  set acceleration(value) {
    if (typeof value == 'number') {
      this._acceleration = value;
    }
  }
  get acceleration() {
    return typeof this._acceleration == 'number' ? this._acceleration : 0;
  }}


surface = new Surface(window.innerWidth / 50);
surface.colour = '#000000';

window.addEventListener('resize', () => {
  surface.width = window.innerWidth + 500;
  surface.height = window.innerHeight;
});

init = function () {
  document.body.appendChild(surface.stage);
  surface.width = window.innerWidth + 500;
  surface.height = window.innerHeight;
};

init();
/* footer end */