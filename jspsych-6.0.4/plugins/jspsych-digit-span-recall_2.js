/*
 * Example plugin template
 */

jsPsych.plugins["digit-span-recall"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'target', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'foil', 'image');
  jsPsych.pluginAPI.registerPreload('visual-search-circle', 'fixation_image', 'image');


  plugin.info = {
    name: 'digit-span-recall',
    description: '',
    parameters: {
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      size_cells: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Size of cells',
        default: 80,
        description: 'Size of each cell of numpad.'
      },
      correct_order: {
        type:jsPsych.plugins.parameterType.INT,
        default: undefined,
        description: 'Record the correct array'
      }
    }
  }


  plugin.trial = function(display_element, trial) {

// making matrix:
var grid = 3;
var recalledGrid = [];
var correctGrid = trial.correct_order
var display = " "

var numbertobutton = {
  "0": "1",
  "1": "2",
  "2": "3",
  "3": "4",
  "4": "5",
  "5": "6",
  "6": "7",
  "7": "8",
  "8": "9",
  "9": "0"
}

function indexOfArray(val, array) {
  var
    hash = {},
    indexes = {},
    i, j;
  for(i = 0; i < array.length; i++) {
    hash[array[i]] = i;
  }
  return (hash.hasOwnProperty(val)) ? hash[val] : -1;
};

recordClick = function(data){
  var tt = data.getAttribute('id')
  var tt = ("#"+tt)
  display_element.querySelector(tt).className = 'jspsych-digit-span-recall';
  var recalledN = (data.getAttribute('data-choice'));
  recalledGrid.push(numbertobutton[recalledN])
  var div = document.getElementById('recall_space');
  display += numbertobutton[recalledN] + " "
  div.innerHTML = display;
//  console.log(recalledGrid)
}

clearSpace = function(data){
  recalledGrid = recalledGrid.slice(0, (recalledGrid.length-1))
  console.log(recalledGrid)
  var div = document.getElementById('recall_space');
  display = display.slice(0, (display.length-2))
  div.innerHTML = display
}

var matrix = [];
for (var i=0; i<grid; i++){
  m1 = i;
  for (var h=0; h<grid; h++){
    m2 = h;
    matrix.push([m1,m2])
  }
};
matrix.push([3,1])

var paper_size = [(grid*trial.size_cells), ((grid+1)*trial.size_cells)+80];

display_element.innerHTML = '<div id="jspsych-html-button-response-btngroup" style= "position: relative; width:' + paper_size[0] + 'px; height:' + paper_size[1] + 'px"></div>';
var paper = display_element.querySelector("#jspsych-html-button-response-btngroup");

paper.innerHTML += '<div class="recall-space" style="position: absolute; top:'+ 0 +'px; left:'+(paper_size[0]/2-300)+'px; width:600px; height:64px" id="recall_space">'+ recalledGrid+'</div>';


var buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

for (var i = 0; i < matrix.length; i++) {
    var str = buttons[i]
    paper.innerHTML += '<div class="jspsych-digit-span-recall" style="position: absolute; top:'+ (matrix[i][0]*(trial.size_cells-3)+80) +'px; left:'+matrix[i][1]*(trial.size_cells-3)+'px; width:'+(trial.size_cells-6)+'px; height:'+(trial.size_cells-6)+'px"; id="jspsych-spatial-span-grid-button-' + i +'" data-choice="'+i+'" onclick="recordClick(this)">'+str+'</div>';
  }


  display_element.innerHTML += '<div class="jspsych-btn-numpad" style="display: inline-block; margin:'+0+' '+-10+'" id="jspsych-html-button-response-button-clear" onclick="clearSpace(this)">Backspace</div>';

  display_element.innerHTML += '<div class="jspsych-btn-numpad" style="display: inline-block; margin:'+20+' '+40+'" id="jspsych-html-button-response-button">Continue</div>';


var start_time = Date.now();

    display_element.querySelector('#jspsych-html-button-response-button').addEventListener('click', function(e){
        var accuracy = 1
        if (correctGrid.length == recalledGrid.length){
          for (var i=0; i<correctGrid.length; i++){
            if (recalledGrid[i] != correctGrid[i]){
              accuracy = 0
            }
          }
        } else {
          accuracy = 0
        }


    after_response(accuracy);
  });

var response = {
  rt: null,
  button: null
};


function after_response(choice) {

  // measure rt
  var end_time = Date.now();
  var rt = end_time - start_time;
  var choiceRecord = choice;
  response.button = choice;
  response.rt = rt;

  // after a valid response, the stimulus will have the CSS class 'responded'
  // which can be used to provide visual feedback that a response was recorded
  //display_element.querySelector('#jspsych-html-button-response-stimulus').className += ' responded';

  // disable all the buttons after a response
  var btns = document.querySelectorAll('.jspsych-html-button-response-button button');
  for(var i=0; i<btns.length; i++){
    //btns[i].removeEventListener('click');
    btns[i].setAttribute('disabled', 'disabled');
  }

  clear_display();
    end_trial();
};

if (trial.trial_duration !== null) {
  jsPsych.pluginAPI.setTimeout(function() {
    clear_display();
    end_trial();
  }, trial.trial_duration);
}

function clear_display(){
    display_element.innerHTML = '';
}


function end_trial() {

  // kill any remaining setTimeout handlers
  jsPsych.pluginAPI.clearAllTimeouts();

  // gather the data to store for the trial
  var trial_data = {
    rt: response.rt,
    recall: recalledGrid,
    stimuli: correctGrid,
    accuracy: response.button
  };

  // move on to the next trial
  jsPsych.finishTrial(trial_data);
}
};

/*
    This is a web-based digit span working memory test.
    It is modelled after the forward digit span test described in Woods et al (2011) [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2978794/].
    However, users can easily customize this test for their own purposes.
    Easily customizable variables have been listed below. For further changes to the test, knowledge of JavaScipt may be required.
    For smooth functioning of the test, make sure all the associated github files within the repository have been downloaded (especially the folder named 'jspsych-6.0.4').
    Results from this test will be automatically downloaded into the downloads folder of your desktop.
    For further details, please refer to the README.
*/


//----- CUSTOMIZABLE VARIABLES -----------------------------------------

  nTrials = 14 // number of trials in the test
  minSetSize = 3 // starting digit length
  stimuli_duration = 1000 // number of miliseconds to display each digit
  recall_duration = null // number of miliseconds to allow recall. If null, there is no time limit.
  file_name = null // file name for data file. if null, a default name consisting of the participant ID and a unique number is chosen.
  local = true // save the data file locally.
              // If this test is being run online (e.g., on MTurk), true will cause the file to be downloaded to the participant's computer.
              // If this test is on a server, and you wish to save the data file to that server, change this to false.
              // If changed to false, ensure that the php file (its in the directory!) and the empty "data" folder has also been appropriately uploaded to the server.
              // Incase of problems, feel free to contact me :)

//----------------------------------------------------------------------

  possibleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]  //possible digits participants can get

  var selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)  //chooses random digits
  var selection_id = -1

  // keeps track of participant's scores:
  var nError = 0
  var highest_span_score = 0
  var consec_error_score = 0

  // first page. identifies participant for data storage
  var p_details = {
    type:"survey-text",
    questions: [{prompt: "Enter participant number, name, or ID"}],
    on_finish:function(){
      partN = jsPsych.data.get().last(1).values()[0].partNum
      partN = partN.replace(/['"]+/g,'')
//      console.log(partN[0])
    }
  }

// instruction page
var instructions = {
    type: 'instructions',
    pages: function(){
      pageOne = "<div style='font-size:20px;'><b>INSTRUCTIONS</b><br><br>This is the digit span task.<br><br>In this task, you will have to remember a sequence of numbers presented on the screen one after the other.<br>At the end of each trial, enter all the numbers into the onscreen number-pad in their correct order.<br><br><u>Example:</u> if the sequence is '7 4 5 1', enter '7 4 5 1' in this exact order.<br><br>You will now be given practice trials to help you understand the task.<br>Press 'Next' to start the practice trials.<br><br></div>"
      return [pageOne]
    },
    allow_backward: false,
    button_label_next: "Next",
    show_clickable_nav: true
  }

  var instructions_node = {
      type: 'instructions',
      pages: function(){
        pageOne = "<div style='font-size:20px;'>You have completed the practice trials. <br><br> If you have further questions about the task, ask the researcher now.<br> If you are clear about the task, click 'Next' to proceed to the main trials.<br><br></div>"
        return [pageOne]
      },
      allow_backward: false,
      button_label_next: "Next",
      show_clickable_nav: true,
      on_finish: function(){
        minSetSize = 3
        selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)
      }
    }

var test_stimuli = {
  type: 'html-keyboard-response',
  stimulus: function(){
    selection_id+=1
    return '<div style="font-size:70px;">'+selection[selection_id]+'</div>'
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: stimuli_duration,
  on_finish: function(){
    if (selection_id + 1 >=selection.length){
      jsPsych.endCurrentTimeline()
    }
  }
}

var recall = {
  type: 'digit-span-recall',
  correct_order: function(){
    return selection
  },
  trial_duration: recall_duration,
  on_finish: function(){
    acc = jsPsych.data.get().last(1).values()[0].accuracy;
    if (acc==1){
      if (highest_span_score < minSetSize){
        highest_span_score = minSetSize
        }
        minSetSize+=1
        nError = 0
    } else if (nError < 1) { // checks for number of consecutive errors
      nError += 1
    } else {
      if (consec_error_score < minSetSize){
        consec_error_score = minSetSize
      }
      minSetSize = Math.max( 3, minSetSize-1)
      }
    if (minSetSize<=8){ // bottom code prevents immediate repition of digits
      selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)
    } else {
      selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, 8)
      var extra = minSetSize-8
      var id = possibleNumbers.indexOf(selection[7])
      possibleNumbers.splice(id, 1);
      var extraNumbers= jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, extra)
      selection = selection.concat(extraNumbers)
      possibleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    }
    selection_id = -1
  }
}

var feedback = {
  type: 'html-keyboard-response',
  stimulus: function(){
    var text = ""
    var accuracy = jsPsych.data.get().last(1).values()[0].accuracy
    if (accuracy==1){
      text += '<div style="font-size:35px; color:rgb(0 220 0)"><b>Correct</div>'
    } else {
      text += '<div style="font-size:35px; color:rgb(240 0 0)"><b>Incorrect</div>'
    }
    //text += '<div style="font-size:30px; color:rgb(0 0 0)"><br><br>New trial starting now.</div>'
    return text
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000
}

var conclusion = {
  type: 'html-keyboard-response',
  stimulus: function(){
    return '<div style="font-size:20px;">You have completed the task.<br>Thank you for your participation in this task.<br><br>Maximum number of digits recalled correctly was ' + highest_span_score +'.<br><br>Maximum number of digits reached before making two consecutive errors was ' +consec_error_score+'.<br><br>Please tell the Research Assistant you have completed the task.</div>'
},
  choices: jsPsych.NO_KEYS
//  trial_duration:1000
}

  var test_stack = {
    timeline: [test_stimuli],
    repetitions: 17
  }

  var test_procedure = {
    timeline: [test_stack, recall, feedback],
    repetitions: nTrials
  }

  var demo_procedure = {
    timeline: [test_stack, recall, feedback],
    repetitions: 3
  }

  var correct_count = jsPsych.data.get().filter({correct: true}).count();

var timeline = [];
timeline.push(p_details)
timeline.push(instructions)
timeline.push(demo_procedure)
timeline.push(instructions_node)
timeline.push(test_procedure)
timeline.push(conclusion)


  return plugin;
})();
