var state = {
  NONE: 0,
  INTERTITLE: 1,
  SHAPES: 2,
  PLACEHOLDERS: 3,
};

var ctx = {
  w: 1400,
  h: 600,

  trials: [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,

  participantIndex: "ParticipantID",
  blockIndex: "Block1",
  trialIndex: "TrialID",
  objectsCountIndex: "OC",
  vvIndex: "VV",

};

const container = document.getElementById("scene");
var instructions = document.getElementById('instructions');
/* var state = {
  none :false,
  intertitle : true,
  shapes : false,
  placeholder : false,

} */
var targets = {
  size: "./blue_big.svg",
  colour: "./red_normal.svg",
  sizeColour: "./red_big.svg"
}

var nextTrial = function () {
  ctx.state = state.INTERTITLE;
  var temp_target = document.createElement("img");
  temp_target.setAttribute("id", "target");

  console.log(ctx.trials[ctx.cpt]["OC"])
  console.log(ctx.trials[ctx.cpt]["VV"])


  switch (ctx.trials[ctx.cpt]["VV"]) {
    case "Colour":
      temp_target.setAttribute("src", targets.colour);
      break;
    case "Size":
      temp_target.setAttribute("src", targets.size);
      temp_target.setAttribute("class", "size");
      break;
    case "Colour_and_Size":
      temp_target.setAttribute("class", "size");
      temp_target.setAttribute("src", targets.sizeColour);
      break;
  }

  switch (ctx.trials[ctx.cpt]["OC"]) {
    case 'Low':
      makeRows(12, temp_target);
      container.setAttribute("width", "208px")
      break;
    case 'Medium':
      makeRows(15, temp_target)
    case 'High':
      makeRows(24, temp_target)
      break;
  }

}

function makeRows(numberOfElements, target) {
  container.innerHTML = '';
  var shapes = [];
  shapes.push(target);

  for (c = 0; c < numberOfElements - 1; c++) {

    let cell = document.createElement("img");

    cell.setAttribute("src", "./blue_normal.svg");
    shapes.push(cell);


  }

  shuffle(shapes)

  shapes.forEach((shape) => {

    if (shape.id == "target") {
      container.appendChild(shape).className = "size"
    } else {
      container.appendChild(shape).className = "grid-item";

    }

    container.style.visibility = "hidden";
    instructions.innerHTML = "Multiple shapes will get displayed. <br> Only <b>one shape</b> is different from all other shapes.<br><br> 1. Spot it as fast as possible and press <i>Space</i> bar;<br> 2. Click on the placeholder over that shape.<br> 3. Press <i>Enter</i> key when ready to start.<br>"
  });

};

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}


var startExperiment = function (event) {
  event.preventDefault();

  for (var i = 0; i < ctx.trials.length; i++) {
    if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if (parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if (parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
          ctx.cpt = i;
        }
      }
    }
  }

  console.log("start experiment at " + ctx.cpt);
  nextTrial();
}

var keyListener = function(event) {
  event.preventDefault();

  if(ctx.state == state.INTERTITLE && event.code == "Enter") {
    console.log("Enterpressed")
    container.setAttribute("style", "")
    ctx.state = state.SHAPES
    //TODO Starttimer
    
  } else if(ctx.state == state.SHAPES && event.code == "Space") {
    console.log("Spacepressed")
    //TODO stoptimer 
    //TODO hide table and show placeholders
  }
}



var createScene = function () {
  loadData();
};

/****************************************/
/******** STARTING PARAMETERS ***********/
/****************************************/

var setTrial = function (trialID) {
  ctx.startTrial = parseInt(trialID);
}

var setBlock = function (blockID) {
  ctx.startBlock = parseInt(blockID);

  var trial = "";
  var options = [];

  for (var i = 0; i < ctx.trials.length; i++) {
    if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if (parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if (!(ctx.trials[i][ctx.trialIndex] === trial)) {
          trial = ctx.trials[i][ctx.trialIndex];
          options.push(trial);
        }
      }
    }
  }

  var select = d3.select("#trialSel");

  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) {
      return d;
    });

  setTrial(options[0]);

}

var setParticipant = function (participantID) {
  ctx.participant = participantID;

  var block = "";
  var options = [];

  for (var i = 0; i < ctx.trials.length; i++) {
    if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if (!(ctx.trials[i][ctx.blockIndex] === block)) {
        block = ctx.trials[i][ctx.blockIndex];
        options.push(block);
      }
    }
  }

  var select = d3.select("#blockSel")
  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) {
      return d;
    });

  setBlock(options[0]);

};

var loadData = function () {

  d3.csv("experiment.csv").then(function (data) {
    ctx.trials = data;

    var participant = "";
    var options = [];

    for (var i = 0; i < ctx.trials.length; i++) {
      if (!(ctx.trials[i][ctx.participantIndex] === participant)) {
        participant = ctx.trials[i][ctx.participantIndex];
        options.push(participant);
      }
    }

    var select = d3.select("#participantSel")
    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
      .text(function (d) {
        return d;
      });

    setParticipant(options[0]);

  }).catch(function (error) {
    console.log(error)
  });
};

function onchangeParticipant() {
  selectValue = d3.select('#participantSel').property('value');
  setParticipant(selectValue);
};

function onchangeBlock() {
  selectValue = d3.select('#blockSel').property('value');
  setBlock(selectValue);
};

function onchangeTrial() {
  selectValue = d3.select("#trialSel").property('value');
  setTrial(selectValue);
};