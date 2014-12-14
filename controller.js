var myApp = angular.module('app', []);

myApp.controller('StatsController', ['$scope', '$http', function($scope, $http) {

    $scope.data = {};

    $http.get('data.json').
      success(function(data, status, headers, config) {
        $scope.data = data;
        //$scope.yScale = d3.scale.log;
        $scope.scatter = data.scatter;

        drawChart(data.scatter);

        // legend colors
        var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

        $scope.legend = data.scatter.map(function(s, i) {
          return {
            name: s.key,
            color: colors[i]
          };
        });

        console.log($scope.legend);

      }).
      error(function(data, status, headers, config) {
        console.error(data, status);
      });
}]);


function drawChart(data) {

      //Width and height
      var w = 800;
      var h = 600;
      var padding = 80;


      //Static dataset
      /*var dataset = [
              [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
              [410, 12], [475, 44], [25, 67], [85, 21], [220, 88],
              [600, 150]
              ];*/

      /*dataset => [
      { [
        key: 'x',
        values: 'y'
        ]
      ]*/

      // all values
      var allValues = [];
      data.forEach(function(d, i) {
        allValues = allValues.concat(
          d.values.map(function(v) {
            return [
              v.x,
              v.y,
              i];
          })
        )});

      //Dynamic, random dataset
      //var dataset = data;         //Initialize empty array


      //Create scale functions
      var xScale = d3.scale.linear()
                 .domain([0, d3.max(allValues, function(d) { return d[0]; })])
                 .range([padding, w - padding * 2]);

      var yScale = d3.scale.linear()
                 .domain([0, d3.max(allValues, function(d) { return d[1]; })])
                 .range([h - padding, padding]);

      //Define X axis
      var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(5);

      //Define Y axis
      var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(5);

      //Create SVG element
      var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

      var color = d3.scale.category10();

      //Create circles
      svg.selectAll("circle")
         .data(allValues)
         .enter()
         .append("circle")
         .attr("cx", function(d) {
            return xScale(d[0]);
         })
         .attr("cy", function(d) {
            return yScale(d[1]);
         })
         .attr("r", function(d) {
            return 3;
         })
         .attr("data-legend", function(d) {
          return allValues[d[2]].key;
        })
         .style("fill", function(d, i) {
            return color(d[2]);
          });

      //Create X axis
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

      //Create Y axis
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);
}
