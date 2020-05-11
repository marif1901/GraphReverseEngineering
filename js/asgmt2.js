var elbow_img_count = 0;
function get_random_samples(){
    removeAllHighlight();
    $("#task_1a").addClass('highlight-selected');
    $("#subtasks_div").html('');

    $.ajax({
        url: "get_random_sample", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
         
            var table = '<h5>Random Sample with 25% rows of the original</h5>' +
            '<table class="table" id="dataset_table_random" style="margin-left:18%">';
            '</table>' +
            '</div>';
           
            $("#graph_area").html(table);
            var table = document.getElementById('dataset_table_random');

            // Insert table header
            var header = table.createTHead();
            var rowH = header.insertRow(0);   
            var cell = rowH.insertCell(0);
                cell.innerHTML = 'S.No.';

            var col_count = 0;
            $.each(data, function(key, value){
                col_count = col_count + 1;
                cell = rowH.insertCell(col_count);
                cell.innerHTML = key;
            });
        
            var rowCount = 0;
            $.each(data.Price, function(key, value){    
                rowCount = rowCount + 1;
                var row = table.insertRow(rowCount);
                var cell = row.insertCell(0);
                cell.innerHTML = rowCount;
            });

           var col = 0;
            $.each(data, function(key, value){
                col = col + 1;
                var rcount = 1;
                $.each(value, function(key, val){
                    var row = table.rows[rcount];
                    var cell = row.insertCell(col);
                    cell.innerHTML = val;
                    rcount = rcount + 1;
                });
            });
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    }); 
}

function get_elbow(){
    $("input[name='task_three']").prop("checked",false);
    $("input[name='task_four']").prop("checked",false);
    $("input[name*='subtask']").prop("checked",false);

    removeAllHighlight();
    $("#task_1b").addClass('highlight-selected');
    $("#subtasks_div").html('');
            
    elbow_img_count += 1;
    $.ajax({
        url: "get_elbow", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            var img = '<h5>Elbow Plot</h5>' +
            '<img id="elbow_graph" src="./static/image/elbow/elbow.png"/>';
            
            var selectK = '<br/><br/><label style="padding: 0 15px" for="cluster_k">Choose a Cluster Size</label>'+
               '<select id="cluster_k">';

            for(var i = 1;i<=9;i++){
                selectK += '<option value="' + i + '">'+i+'</option>';
            }

            selectK += '</select>';
            reset_graph_area();


            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);
            $("#stratified_section_left").append(selectK);

            $("#graph_area").html($("#stratified_section").html());

            line_chart(data,'Distortion','Cluster K', 'The Elbow Method for Optimal K','left','numeric','non-scatter');


            // Listener for the select tag
            $("#cluster_k").change(
                function(){
                    var cluster_size = "";
                    $( "#cluster_k option:selected" ).each(function() {
                        cluster_size = $( this ).text();
                    });
                    mark_dot(cluster_size);
                    get_stratified_samples(cluster_size);
                }
            );
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function mark_dot(cluster_num){
    // add_line_chart_ref_line(cluster_num);
    $($(".dot")[cluster_num-1]).css("fill","red");
    $($(".dot")[cluster_num-1]).css("r","8");
}

function get_stratified_samples(cluster_size){
    $.ajax({
        url: "get_stratified_sample", 
        cache: false, 
        data : {size : cluster_size},
        dataType: "json",
        type : "POST",
        success: function(data) { 
            var table = '<h5>Stratified Sample with 25% size of the original</h5>' +
            '<table class="table" id="dataset_table_strat">';
            '</table>' +
            '</div>';
           
            $("#stratified_section_right").html(table);

            var table = document.getElementById('dataset_table_strat');

            // Insert table header
            var header = table.createTHead();
            var rowH = header.insertRow(0);   
            var cell = rowH.insertCell(0);
                cell.innerHTML = 'S.No.';

            var col_count = 0;
            $.each(data, function(key, value){
                col_count = col_count + 1;
                cell = rowH.insertCell(col_count);
                cell.innerHTML = key;
            });
            
            var rowCount = 0;
            $.each(data.Price, function(key, value){    
                rowCount = rowCount + 1;
                var row = table.insertRow(rowCount);
                var cell = row.insertCell(0);
                cell.innerHTML = rowCount;
            });

           var col = 0;
            $.each(data, function(key, value){
                col = col + 1;
                var rcount = 1;
                $.each(value, function(key, val){
                    var row = table.rows[rcount];
                    var cell = row.insertCell(col);
                    cell.innerHTML = val;
                    rcount = rcount + 1;
                });
            });
            
        }
    })
}



//  -----------------------  Task 2 ---------------------------------

function get_three_intrinsic(){
    removeAllHighlight();
    $("#task_2").addClass('highlight-selected');

    which_data = get_data_source();
    switch(which_data){
        case "org":
            get_intrinsic_dimensionality_org();
            break;
        case "random":
            get_intrinsic_dimensionality_random();
            break;
        case "stratified":
            get_intrinsic_dimensionality_strat();
            break;
            default:
    }
}

function get_three_bias(){
    $("input[name='task_three']").prop("checked",false);
    $("input[name='task_four']").prop("checked",false);

    get_intrinsic_dimensionality_comparison();
}


function get_data_source(){
    if($("#three_org").prop("checked")){
        return "org";
    } else if($("#three_random").prop("checked")){
        return "random";
    } else if($("#three_strat").prop("checked")){
        return "stratified";
    }
}

function get_data_source_viz(){
    if($("#four_org").prop("checked")){
        return "org";
    } else if($("#four_random").prop("checked")){
        return "random";
    } else if($("#four_strat").prop("checked")){
        return "stratified";
    }
}

function get_intrinsic_dimensionality_org(){
    removeAllHighlight();
    $("#task_2").addClass('highlight-selected');

    var max = $('.feature-cell').length - 1;
    $($('.feature-cell')[max]).addClass('highlight-selected');
    
    $.ajax({
        url: "get_intrinsic_dimensionality_org", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            
            var img = '<h5>PCA Plot</h5>' +
            '<img id="scree_graph" src="./static/image/elbow/elbow_eigen_org.png"/>';
            
            var selectK = '<br/><label style="padding: 0 15px" for="feature_k">Select number of Principal Components</label>'+
               '<select id="feature_k">';

            for(var i = 1;i<=9;i++){
                selectK += '<option value="' + i + '">'+i+'</option>';
            }

            selectK += '</select>';
                        reset_graph_area();

            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);
            $("#stratified_section_left").append(selectK);

            $("#graph_area").html($("#stratified_section").html());

            bar_plot_chart(data,'Variance Explained (%)','Principal Component', 'PCA of 9 Avocado Features (Original Data)');
            add_bar_plot_ref_line_75();

            // Listener for the select tag
            $("#feature_k").change(
                function(){
                    var num_PCA = "";
                    $( "#feature_k option:selected" ).each(function() {
                        num_PCA = $( this ).text();
                    });
                    get_three_highest_PCA_org(num_PCA);
                }
            );
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function reset_graph_area(){
    $("#graph_area").html('');
    $("#stratified_section_left").html('');
    $("#stratified_section_right").html('');
    $("#stratified_section_top").html('');
    $("#stratified_section_bottom").html('');
}

function get_intrinsic_dimensionality_random(){
    removeAllHighlight();
    $("#task_2").addClass('highlight-selected');

    $.ajax({
        url: "get_intrinsic_dimensionality_random", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            var img = '<h5>PCA Plot</h5>' +
            '<img id="scree_graph" src="./static/image/elbow/elbow_eigen_random.png"/>';
           
            var selectK = '<br/><label style="padding: 0 15px" for="feature_k">Select number of Principal Components</label>'+
               '<select id="feature_k">';

            for(var i = 1;i<=9;i++){
                selectK += '<option value="' + i + '">'+i+'</option>';
            }

            selectK += '</select>';
            
             // append svg
             var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
             $("#stratified_section_left").html(svg);
             $("#stratified_section_left").append(selectK);
 
             $("#graph_area").html($("#stratified_section").html());
 
             bar_plot_chart(data,'Variance Explained (%)','Principal Component', 'PCA of 9 Avocado Features (Random Sample)');
             add_bar_plot_ref_line_75();
            // Listener for the select tag
            $("#feature_k").change(
                function(){
                    var num_PCA = "";
                    $( "#feature_k option:selected" ).each(function() {
                        num_PCA = $( this ).text();
                    });
                    get_three_highest_PCA_random(num_PCA);
                }
            );
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_intrinsic_dimensionality_strat(){
    removeAllHighlight();
    $("#task_2").addClass('highlight-selected');

    $.ajax({
        url: "get_intrinsic_dimensionality_strat", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            var img = '<h5>PCA Plot</h5>' +
            '<img id="scree_graph" src="./static/image/elbow/elbow_eigen_stratified.png"/>';
            
            var selectK = '<br/><label style="padding: 0 15px" for="feature_k">Select number of Principal Components</label>'+
               '<select id="feature_k">';

            for(var i = 1;i<=9;i++){
                selectK += '<option value="' + i + '">'+i+'</option>';
            }

            selectK += '</select>';
              // append svg
              var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
              $("#stratified_section_left").html(svg);
              $("#stratified_section_left").append(selectK);
  
              $("#graph_area").html($("#stratified_section").html());
  
              bar_plot_chart(data,'Variance Explained (%)','Principal Component', 'PCA of 9 Avocado Features (Stratified Sample)');
              add_bar_plot_ref_line_75();
            // Listener for the select tag
            $("#feature_k").change(
                function(){
                    var num_PCA = "";
                    $( "#feature_k option:selected" ).each(function() {
                        num_PCA = $( this ).text();
                    });
                    get_three_highest_PCA_stratified(num_PCA);
                }
            );
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}



function get_three_highest_PCA_org(numPCA){
    $("input[name='task_four']").prop("checked",false);
    $.ajax({
        url: "get_top_square_loadings_org", 
        cache: false, 
        dataType: "json",
        data : {num_PCA: numPCA},
        type : "POST",
        success: function(data) { 
            
            var img = '<h5>Scree Plot Square Loadings for '+ numPCA +' Principal Components</h5>' +
            '<img id="scree_graph" src="./static/image/elbow/square_loading_org.png"/>';
            $("#stratified_section_right").html(img);
            
             // append svg
             var svg = "<div id='right_part'><svg id='right_svg'></svg></div>";
             $("#stratified_section_right").html(svg);
 
            line_chart(data,'Squared Loadings','Avocado Features', 'Variable Significance - Square Loadings '+numPCA+' PCA (Original)','right','non-numeric','non-scatter');

            var top_3_org = '<br/><p>Three attributes with highest PCA loadings are : '; 
            data = JSON.parse(data)
            
            for(var i=0;i<3;i++){
                top_3_org +='<span style="color:orange">' + data.x[i] + '</span>&nbsp&nbsp&nbsp';
            }

            top_3_org += "</p>";
            $("#stratified_section_bottom").html(top_3_org);
            $("#footer_bottom").show();
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_three_highest_PCA_random(numPCA){
    $("input[name='task_four']").prop("checked",false);
  
    $.ajax({
        url: "get_top_square_loadings_random", 
        cache: false, 
        dataType: "json",
        data : {num_PCA: numPCA},
        type : "POST",
        success: function(data) { 
            var img = '<h5>Scree Plot Square Loadings for '+ numPCA +' Principal Components</h5>' +
            '<img id="scree_graph" src="./static/image/elbow/square_loading_random.png"/>';
            
             // append svg
            var svg = "<div id='right_part'><svg id='right_svg'></svg></div>";
            $("#stratified_section_right").html(svg);
            
            line_chart(data,'Squared Loadings','Avocado Features', 'Variable Significance - Square Loadings '+numPCA+' PCA (Random)','right','non-numeric',"non-scatter");

            var top_3_random = '<br/><p>Three attributes with highest PCA loadings are : '; 
            data = JSON.parse(data)
            
            for(var i=0;i<3;i++){
                top_3_random +='<span style="color:orange">' + data.x[i] + '</span>&nbsp&nbsp&nbsp';
            }

            top_3_random += "</p>";
            
            $("#stratified_section_bottom").html(top_3_random);
            $("#footer_bottom").show();
           
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_three_highest_PCA_stratified(numPCA){
    $("input[name='task_four']").prop("checked",false); 
    $.ajax({
        url: "get_top_square_loadings_stratified", 
        cache: false, 
        dataType: "json",
        data : {num_PCA: numPCA},
        type : "POST",
        success: function(data) { 
            var img = '<h5>Scree Plot Square Loadings for '+ numPCA +' Principal Components</h5>' +
            '<img id="scree_graph" src="./static/image/elbow/square_loading_stratified.png"/>';
            
             // append svg
             var svg = "<div id='right_part'><svg id='right_svg'></svg></div>";
             $("#stratified_section_right").html(svg);
             
            line_chart(data,'Squared Loadings','Avocado Features', 'Variable Significance - Square Loadings '+numPCA+' PCA (Stratified)','right','non-numeric','non-scatter');

            var top_3_stratified = '<br/><p>Three attributes with highest PCA loadings are : '; 
            data = JSON.parse(data)
            
            for(var i=0;i<3;i++){
                top_3_stratified +='<span style="color:orange">' + data.x[i] + '</span>&nbsp&nbsp&nbsp';

            }

            top_3_stratified += "</p>";
            
            $("#stratified_section_bottom").html(top_3_stratified);
            $("#footer_bottom").show();
           
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}



function get_intrinsic_dimensionality_comparison(){
    removeAllHighlight();
    $("#task_2").addClass('highlight-selected');

    $.ajax({
        url: "get_intrinsic_dimensionality_comparison", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            reset_graph_area();
            data = JSON.parse(data)
            // Header
            $("#stratified_section_top").html("<h3>Comparison between Original, Random and Stratified Data and Bias Introduced</h3>")
            $("#header_top").show();
            
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);
           
             // Right Image
            svg = "<div id='right_part'><svg id='right_svg'></svg></div>";
            $("#stratified_section_right").html(svg);
            
            data1 = {};
            data1["x"] = data["x"];
            data1["y_org"] = data["y_org"];
            data1["y_random"] = data["y_random"];
            data1["y_strat"] = data["y_strat"];
            line_chart_comparison_1(data1,'Eigen Value','Principal Component', 'Eigen Values vs Principal Components','left','numeric','line_comp_1');

            data1 = {};
            data1["x"] = data["x"];
            data1["y_cum_org"] = data["y_cum_org"];
            data1["y_cum_random"] = data["y_cum_random"];
            data1["y_cum_strat"] = data["y_cum_strat"];
            data1["y_var_org"] = data["y_var_org"]
            data1["y_var_random"] = data["y_var_random"]
            data1["y_var_strat"] = data["y_var_strat"]
            line_chart_comparison_2(data1,'Variance Explained (%)','Principal Component', 'Variance vs Principal Components','right','numeric','line_comp_2');


            // Bottom Calculations 
            var content = '<span>Mean Bias for Random Sampling: &nbsp&nbsp' + data['rand_mean_bias'][0].toFixed(2) + '%</span>'
            + '&nbsp&nbsp&nbsp&nbsp<span>Mean Bias for Stratified Sampling: &nbsp&nbsp' + data['strat_mean_bias'][0].toFixed(2) + '%</span><br/>'
            + '<span>Standard Deviation Bias for Random Sampling: &nbsp&nbsp' + data['rand_std_bias'][0].toFixed(2) + '%</span>'
            + '&nbsp&nbsp&nbsp&nbsp<span>Standard Deviation Bias for Stratified Sampling: &nbsp&nbsp' + data['strat_std_bias'][0].toFixed(2) + '%</span>';
            
            $("#stratified_section_bottom").html(content);
            $("#stratified_section_bottom").css("color","orange");
            $("#stratified_section_bottom").css("margin-top","2em");

            $("#footer_bottom").show();
            $("#graph_area").html($("#stratified_section").html());

        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function removeAllHighlight(){
    var max = $('.feature-cell').length - 1;
    for(var index = 0; index <= max; index++){
        $($('.feature-cell')[index]).removeClass('highlight-selected');
    }
}


// Task 3

function get_four_top_2PCA(){
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    which_data = get_data_source_viz();
    switch(which_data){
        case "org":
            get_four_top_2PCA_org();
            break;
        case "random":
            get_four_top_2PCA_random();
            break;
        case "stratified":
            get_four_top_2PCA_stratified();
            break;
            default:
    }
}


function get_four_top_2PCA_org(){
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_four_top_2PCA_org", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            reset_graph_area();

            // Header
            $("#stratified_section_top").html("<h3>Data projected into the top two PCA vectors via 2D scatterplot (Original Data)</h3>")
            $("#header_top").show();
           
            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);

            $("#graph_area").html($("#stratified_section").html());
            moveToCenter();
            line_chart(data,'Second Component','First Component', '2 PCA (Original Data)','left','numeric','scatter');
            
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_four_top_2PCA_random(){
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_four_top_2PCA_random", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
                        reset_graph_area();

            // Header
            $("#stratified_section_top").html("<h3>Data projected into the top two PCA vectors via 2D scatterplot (Random Sample)</h3>")
            $("#header_top").show();
           
             // append svg
             var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
             $("#stratified_section_left").html(svg);
 
             $("#graph_area").html($("#stratified_section").html());
             moveToCenter();
             line_chart(data,'Second Component','First Component', '2 PCA (Random Sample)','left','numeric','scatter');
             

        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_four_top_2PCA_stratified(){
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_four_top_2PCA_strat", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            reset_graph_area();

            // Header
            $("#stratified_section_top").html("<h3>Data projected into the top two PCA vectors via 2D scatterplot (Stratified Sample)</h3>")
            $("#header_top").show();
           
            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);

            $("#graph_area").html($("#stratified_section").html());
            moveToCenter();
            line_chart_scatter_strat(data,'Second Component','First Component', '2 PCA (Stratified Sample)','left','numeric','scatter_stratified');
            
        },
        error: function(jqXHR) {
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}


function get_MDS(){
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    which_data = get_data_source_viz();
    switch(which_data){
        case "org":
            get_MDS_org();
            break;
        case "random":
            get_MDS_random();
            break;
        case "stratified":
            get_MDS_stratified();
            break;
            default:
    }
}

function get_MDS_org(){

    show_loader();
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_mds_org", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            hide_loader();
            reset_graph_area();
            data = JSON.parse(data);

            // Header
            $("#stratified_section_top").html("<h3>Scatter Plot for MDS (Original Sample)</h3>")
            $("#header_top").show();
           
            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);
           
            // Right Image
            svg = "<div id='right_part'><svg id='right_svg'></svg></div>";
            $("#stratified_section_right").html(svg);
            $("#graph_area").html($("#stratified_section").html());
            
            data1 = {};
            data1["x"] = data["x_euc"];
            data1["y"] = data["y_euc"];
            line_chart(data1,'Second Component','First Component', 'MDS via Euclidean Distance','left','numeric','scatter_euc_mds');
            
            data2 = {};
            data2["x"] = data["x_corr"];
            data2["y"] = data["y_corr"];
            line_chart(data2,'Second Component','First Component', 'MDS via Correlation Distance','right','numeric','scatter_corr_mds');

        },
        error: function(jqXHR) {
            hide_loader();
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_MDS_random(){
    show_loader();
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_mds_random", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) {
            hide_loader();
            reset_graph_area();
            data = JSON.parse(data);

            // Header
            $("#stratified_section_top").html("<h3>Scatter Plot for MDS (Random Sample)</h3>")
            $("#header_top").show();
           
            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);
           
            // Right Image
            svg = "<div id='right_part'><svg id='right_svg'></svg></div>";
            $("#stratified_section_right").html(svg);
            $("#graph_area").html($("#stratified_section").html());

            data1 = {};
            data1["x"] = data["x_euc"];
            data1["y"] = data["y_euc"];
            line_chart(data1,'Second Component','First Component', 'MDS via Euclidean Distance','left','numeric','scatter_euc_mds');
            
            data2 = {};
            data2["x"] = data["x_corr"];
            data2["y"] = data["y_corr"];
            line_chart(data2,'Second Component','First Component', 'MDS via Correlation Distance','right','numeric','scatter_corr_mds');

        },
        error: function(jqXHR) {
            hide_loader(); 
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_MDS_stratified(){
    show_loader();
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_mds_stratified", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            hide_loader(); 
            reset_graph_area();

            data = JSON.parse(data);
            numCluster = Object.keys(data).length / 4;

            // Header
            $("#stratified_section_top").html("<h3>Scatter Plot for MDS (Stratified Sample)</h3>")
            $("#header_top").show();
           
            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";
            $("#stratified_section_left").html(svg);
           
            // Right Image
            svg = "<div id='right_part'><svg id='right_svg'></svg></div>";
            $("#stratified_section_right").html(svg);
            $("#graph_area").html($("#stratified_section").html());

            data1 = {}
            for(var i=0;i<numCluster;i++){
                data1["x_"+i] = data["x_euc_"+i];
                data1["y_"+i] = data["y_euc_"+i];
            }
            line_chart_scatter_strat(data1,'Second Component','First Component', 'MDS via Euclidean Distance','left','numeric','scatter_stratified_mds_euc');

            data1 = {}
            for(var i=0;i<numCluster;i++){
                data1["x_"+i] = data["x_corr_"+i];
                data1["y_"+i] = data["y_corr_"+i];
            }
            line_chart_scatter_strat(data1,'Second Component','First Component', 'MDS via Correlation Distance','right','numeric','scatter_stratified_mds_corr');

        },
        error: function(jqXHR) {
            hide_loader(); 
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_top_3PCA(){
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    which_data = get_data_source_viz();
    switch(which_data){
        case "org":
            get_four_top3PCA_org();
            break;
        case "random":
            get_four_top3PCA_random();
            break;
        case "stratified":
            get_four_top3PCA_stratified();
            break;
            default:
    }
}

function get_four_top3PCA_org(){
    show_loader();
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_four_top3PCA_org", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            hide_loader(); 
            reset_graph_area();
            data = JSON.parse(data);

            // Header
            $("#stratified_section_top").html("<h3>Scatter Plot Matrix Top 3 PCA (Original Data)</h3>")
            $("#header_top").show();
           
             // append svg
            var svg = "<div id='left_part'><svg id='left_svg_plot'></svg></div>";
            $("#stratified_section_left").html(svg);
            scatter_plot_matrix(data);
            $("#graph_area").html($("#stratified_section").html());
        },
        error: function(jqXHR) {
            hide_loader(); 
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_four_top3PCA_random(){
    show_loader();
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_four_top3PCA_random", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            hide_loader(); 
            reset_graph_area();
            data = JSON.parse(data);

            // Header
            $("#stratified_section_top").html("<h3>Scatter Plot Matrix Top 3 PCA (Random Sample)</h3>")
            $("#header_top").show();
           
             // append svg
             var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";

             $("#stratified_section_left").html(svg);
             $("#graph_area").html($("#stratified_section").html());
             scatter_plot_matrix(data, false, 'plot data');
        },
        error: function(jqXHR) {
            hide_loader(); 
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}

function get_four_top3PCA_stratified(){
    show_loader();
    removeAllHighlight();
    $("#task_3").addClass('highlight-selected');

    $.ajax({
        url: "get_four_top3PCA_stratified", 
        cache: false, 
        dataType: "json",
        type : "POST",
        success: function(data) { 
            hide_loader(); 
            reset_graph_area();

            // Header
            $("#stratified_section_top").html("<h3>Scatter Plot Matrix Top 3 PCA (Stratified Sample)</h3>")
            $("#header_top").show();

            // append svg
            var svg = "<div id='left_part'><svg id='left_svg'></svg></div>";

            $("#stratified_section_left").html(svg);
            $("#graph_area").html($("#stratified_section").html());
            scatter_plot_matrix(data, true, 'plot data');

        },
        error: function(jqXHR) {
            hide_loader(); 
            alert("error: " + jqXHR.status);
            console.log(jqXHR);
        }
    });
}


function show_loader(){
    $(".loader").show();
    $("body").css("opacity",0.3);
}
function hide_loader(){
    $(".loader").hide();
    $("body").css("opacity",1);

}