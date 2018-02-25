/**
 * Created by Roohy on 8/14/17.
 */
var map_arrays = [];
var svg_area_available = false;
var min_length = 3;
var lineGen;
document.__file_loaded = false;
document.__draw_ready = false;




function calculate_density(data,step){
    var result = [];
    var max = 0;
    var temp= 0;
    for(var i = 0 ; i < data.length-step ; i=i+300){
        temp = min_length/((parseFloat(data[i+step][2])-parseFloat(data[i][2]))/step);
        if(isNaN(temp)){
            temp = 0;
        }
        if(!isFinite(temp)){
            temp = 0;
        }
        result.push({'pos': i, 'density': temp});
    }
    return result;
}
function prepare_svg(handler,yMax){
    if(document.__draw_ready){
        return;
    }
    var vis = d3.select(handler),
        WIDTH = 800,
        HEIGHT = 400,
        MARGINS = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        };
    var xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0,yMax]);
    var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([10,2000]);
    var xAxis = d3.svg.axis()
        .scale(xScale),
        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

    vis.append("svg:g")
        .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
        .call(yAxis);




    lineGen = d3.svg.line()
        .x(function(d) {
            return xScale(d.pos);
        })
        .y(function(d) {
            return yScale(d.density);
        });




    document.__draw_ready = true;


}

function draw(handler, data,stroke_color){
    var vis = d3.select(handler);
    vis.append("svg:path")
        .attr('d', lineGen(data))
        .attr('stroke',stroke_color)
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .attr('id',stroke_color);
}

function erase_svg(){
    d3.selectAll("#visualization > *").remove();
    $('#visualization').remove();
    svg_area_available = false;
    document.__draw_ready = false;
}


function doOpen(evt) {

    map_arrays = [];
    if(!svg_area_available){ //adding an area for visualization
        $('#file-in-div').after('<svg id="visualization" width="800" height="400"> </svg>');
        svg_area_available = true;
    }
    else{
        console.log("erasing previous calculations");
        erase_svg();
        $('#file-in-div').after('<svg id="visualization" width="800" height="400"> </svg>');
        svg_area_available = true;


    }
    var files = evt.target.files,
        reader = new FileReader();
    reader.onload = function() {
        var arraydata = $.csv.toArrays(this.result,{separator:' '});
        map_arrays.push(arraydata); //this.result;
        document.__file_loaded = true;
        prepare_svg('#visualization', map_arrays[0].length);

        checks = $("#snp-checkboxes input");
        for(var i  =  0 ; i < checks.length ; i++){
            if(checks[i].checked){
                var temp_density = calculate_density(map_arrays[0],parseInt(checks[i].value));
                draw('#visualization',temp_density,checks[i].nextElementSibling.classList[1]);
            }
        }


        /*density_50 = calculate_density(map_arrays[0],50);
        density_100 = calculate_density(map_arrays[0],100);


        density_200 = calculate_density(map_arrays[0],200);


        draw('#visualization',density_50,'blue');
        draw('#visualization',density_100,'green');
        draw('#visualization',density_200,'red');*/






    };

    reader.readAsText(files[0]);


}
function checkBoard(e) {
    console.log(e.target);
    if(e.target.checked){
        if(document.__file_loaded){
            if(document.__draw_ready){
                console.log('wow');
            }else{
                prepare_svg("#visualization",map_arrays[0].length);

            }
            var temp_density = calculate_density(map_arrays[0],parseInt(e.target.value));
            draw('#visualization',temp_density,e.target.nextElementSibling.classList[1]);
        }
        else{
            $("#no-file-error").fadeIn('slow',function () {
                setTimeout(function () {
                    $("#no-file-error").fadeOut('slow');
                    e.target.checked = false;
                },1500);
            });
        }
    }
    else{
        $('#'+e.target.nextElementSibling.classList[1]).remove();
    }
}


function computeYScale (width, height, xScale) {
    var xDiff = xScale[1] - xScale[0];
    var yDiff = height * xDiff / width;
    return [-yDiff / 2, yDiff / 2];
}
function draw_prob_plot(){
    var perm_count = parseInt($('.lsh-inputs input')[0].value);
    var bucket_count = parseInt($('.lsh-inputs input')[1].value);
    var bucket_size = perm_count/bucket_count;
    bucket_size = parseInt(bucket_size);
    console.log("Formula is going to be :");
    console.log('1-(1-x^'+bucket_size+')^'+bucket_count);
    var width = 800;
    var height = 400;

// desired xDomain values
    var xScale = [0, 1.0];
    var yScale = [0, 1];
    functionPlot({
        width: width,
        height: height,
        xDomain: xScale,
        yDomain: yScale,//computeYScale(width, height, xScale),
        target: '#plot',
        data: [{
            fn: '1-(1-x^'+bucket_size+')^'+bucket_count,
            /*derivative: {
             fn: '2x',
             updateOnMouseMove: true
             }*/
        }],
        disableZoom: true
    });

    $('#lsh-info-table tbody tr').remove();
    for(var i = 0 ; i <= bucket_count ; i++){
        $('#lsh-info-table tbody').append('<tr><td>'+ i+'</td><td>'+ ((Math.pow(i/bucket_count,1.0/bucket_size))*100).toFixed(0)+'%</td></tr>');
    }

}
$(document).ready(function () {
    console.log("haha");



    // fix menu when passed



    $('#map-inputs').on('change',doOpen);


    $('#min-len').on('change',function (e) {
        min_length = parseInt(e.target.value);
    });
    $('input[type="checkbox"]').on('change',checkBoard);


    $('.message .close').on('click', function() {
        $(this).closest('.message').fadeOut();
    });
    draw_prob_plot();
    $('.lsh-inputs input').on('change',function(){

       draw_prob_plot();
    });
});