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

var shapes1 = {
  size: "./targets_svgs/blue_big.svg",
  colour: "./targets_svgs/red_normal.svg",
  sizeColour: "./targets_svgs/red_big.svg",
  default: "./targets_svgs/blue_normal.svg",
};

var shapes2 = {
  size: "./targets_svgs/red_big.svg",
  colour: "./targets_svgs/blue_normal.svg",
  sizeColour: "./targets_svgs/blue_big.svg",
  default: "./targets_svgs/red_normal.svg",
};

var shapes_array = [shapes1, shapes2];
var errorCount = 0;
var lastParticipant = "1";
var tempTrial;
var tempParticipantTestJson = [];
var trialTime;

var nextTrial = function () {

  tempTrial=ctx.trials[ctx.cpt];
  console.log(ctx.trials[ctx.cpt].ParticipantID)
  if (ctx.trials[ctx.cpt].ParticipantID!==lastParticipant) {
    //it understands if the participant number is the same
    console.log("Change of participant detected")
    alert("Experiment finished")   
    lastParticipant = ctx.trials[ctx.cpt].ParticipantID
    downloadCSV(tempParticipantTestJson);
    tempParticipantTestJson = []
    instructions.innerText="FINISHED! DOWNLOAD CSV AND GO TO NEXT PARTICIPANT"
  } 

  ctx.state = state.INTERTITLE;
  var temp_target = document.createElement("img");
  temp_target.setAttribute("id", "target");
  //choose randomly between targets1 or targets2
  temp_shapes = shapes_array[Math.floor(Math.random() * shapes_array.length)];

  console.log(ctx.trials[ctx.cpt]["OC"])
  console.log(ctx.trials[ctx.cpt]["VV"])


  switch (ctx.trials[ctx.cpt]["VV"]) {
    case "Colour":
      temp_target.setAttribute("src", temp_shapes.colour);
      break;
    case "Size":
      temp_target.setAttribute("src", temp_shapes.size);
      temp_target.setAttribute("class", "size");
      break;
    case "Colour_and_Size":
      temp_target.setAttribute("class", "size");
      temp_target.setAttribute("src", temp_shapes.sizeColour);
      break;
  }

  switch (ctx.trials[ctx.cpt]["OC"]) {
    case 'Low':
      makeRows(12, temp_target, temp_shapes);
      container.setAttribute("width", "208px")
      break;
    case 'Medium':
      makeRows(15, temp_target, temp_shapes)
    case 'High':
      makeRows(24, temp_target, temp_shapes)
      break;
  }

}

function makeRows(numberOfElements, temp_target, temp_shapes) {
  container.innerHTML = '';
  var shapes = [];
  shapes.push(temp_target);

  for (c = 0; c < numberOfElements - 1; c++) {

    let cell = document.createElement("img");

    cell.setAttribute("src", temp_shapes.default);
    cell.setAttribute("onmouseover","bigImg(this)");
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



var keyListener = function (event) {
  event.preventDefault();

  if (ctx.state == state.INTERTITLE && event.code == "Enter") {
    
    container.setAttribute("style", "")
    
    ctx.state = state.SHAPES
    
    startTimer()

  } else if (ctx.state == state.SHAPES && event.code == "Space") {
    
    event.preventDefault();
    
    stopTimer();
    trialTime = timerCount;
    
    console.log("Time to complete: " + trialTime);
    
    showPlaceholders();
  }
}

container.addEventListener("click", (event) => {
  if (event.target.id == "target" && ctx.state == state.PLACEHOLDERS) {

    console.log("right! Error count: " + errorCount + "Time to complete: " + trialTime);
    
    //TODO Append the trial in the csv here, before resetting errorcount
    tempTrial.visualSearchTime = trialTime;
    tempTrial.errorCount = errorCount;
    tempParticipantTestJson.push(tempTrial);
    
    errorCount = 0;
    ctx.cpt++
    nextTrial()

  } else if (event.target.id !== "target" && ctx.state == state.PLACEHOLDERS) {
    instructions.innerHTML = "<h1>WROOOOOOOOONG!!! Again</h1>"
    ctx.state = state.INTERTITLE
    errorCount++
    console.log("wrong! Error count: " + errorCount + "Time to complete: " + trialTime);
    nextTrial();
  }
});

var showPlaceholders = function () {
  ctx.state = state.PLACEHOLDERS
  items = document.querySelectorAll('img');
  items.forEach(x => {
    x.setAttribute('src', "./overlay.svg");
  })
}

//timerCount
var timerCount;

var startTimer = function() {
  clearTimer();
  setInterval(setTime, 10);
}

function setTime() {
  timerCount += 10;
}
var stopTimer = function() {
  clearInterval(setTime);
}

var clearTimer = function() {
  timerCount = 0;
}

//append into csv
function convertArrayOfObjectsToCSV(args) {  
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
      return null;
  }

  columnDelimiter = args.columnDelimiter || ',';
  lineDelimiter = args.lineDelimiter || '\n';

  keys = Object.keys(data[0]);

  result = '';
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
      ctr = 0;
      keys.forEach(function(key) {
          if (ctr > 0) result += columnDelimiter;

          result += item[key];
          ctr++;
      });
      result += lineDelimiter;
  });

  return result;
}

function downloadCSV(args) {  
  var data, filename, link;
  var csv = convertArrayOfObjectsToCSV({
      data: tempParticipantTestJson
  });
  if (csv == null) return;

  filename = args.filename || 'export.csv';

  if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
  }
  data = encodeURI(csv);

  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  link.click();
}



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