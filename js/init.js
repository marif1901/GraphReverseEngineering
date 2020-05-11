var columnNames = [];
// var categorical_features = ['Type','Year','City','Rating','Major Size'];
var categorical_features = [];
var numerical_features = ['Label','Legends','Color Fraction','Data-Ink ratio','Chart Title'];

var slider = document.getElementById("theSlider");
var select_list;
var nBin;
var DATA;
var FEATURE_NAME;
var defaultSliderVal = 10;
var maxSlider = 20;
var minSlider = 1;
var delayInMilliseconds = 1000;
var effect_timeout = 500;

$(document).ready(function(){
  hide_loader();
  $("#home_text").hide();
  $("#feature_menu").show();
  populateFeatureMenu(); 
  listeners();
});

function listeners(){
  // Enable sub tasks for task 3
  $("input[name='task_three']").click(function(){
    enable_subtasks(3);
    $("input[name='task_four']").prop("checked",false);
    $("input[name*='subtasks']").prop("checked",false);
  });

  $("input[name='task_four']").click(function(){
    enable_subtasks(4);
    $("input[name='task_three']").prop("checked",false);
    $("input[name*='subtasks']").prop("checked",false);
  });

  $("#task_three_div").click(function(){
    enable_subtasks(3);
    $("input[name='task_four']").prop("checked",false);
    $("input[name*='subtasks']").prop("checked",false);
  });

  $("#task_four_div").click(function(){
    enable_subtasks(4);
    $("input[name='task_three']").prop("checked",false);
    $("input[name*='subtasks']").prop("checked",false);
  });
}

function enable_subtasks(task){
  removeAllHighlight();
  if(task == 3){
    $("#task_2").addClass('highlight-selected');
    $("#subtasks_div").html($("#hidden_sub_3").html());
  } else if(task == 4){
    $("#task_3").addClass('highlight-selected');
    $("#subtasks_div").html($("#hidden_sub_4").html());
  }
}



function populateFeatureMenu(){

  for(var i=0;i<numerical_features.length;i++){
    var content = '<a href="" class="w3-bar-item w3-button w3-padding ">'+numerical_features[i]+'</a>';
    $("#feature_menu").append(content);
    
  }
}


function show_menu(){
  // visible
  if($("#feature_menu").is(":visible")){

    if($(".highlight-selected").length > 0){
      var parent = $(".highlight-selected").parent();
      populateFeatureMenu();
      $($(parent).children()[0]).addClass("highlight-selected");
    } else {
      $("#feature_menu").hide(effect_timeout);
    }
    
  } else {
    //not visible
    $("#feature_menu").show(effect_timeout);
  }
  
}

function hide_other_menu_options(){
  $.each( $(".feature"), function(id, obj){
    if(!$(obj).children()[0].classList.contains("highlight-selected")){
      $(obj).hide(effect_timeout);
    }
  });
}

function display(el){
  
  $("#home_text").hide();
  $("#graph_area").show(effect_timeout);

  FEATURE_NAME = el.getAttribute("value");
  toggleHighlight(el);
  var home_text = document.getElementById("home_text");

  if(home_text !== null && home_text !== undefined)
    home_text.remove();
}

function toggleHighlight(el){
  var highlightedOptions = document.getElementsByClassName("highlight-selected");

  if(highlightedOptions.length > 0){
    highlightedOptions[0].classList.remove("highlight-selected");
  }
  el.classList.add("highlight-selected");
  hide_other_menu_options();
}
