
import React, { Component } from 'react';
import * as d3 from 'd3';

class ColormapRGBPlot extends Component {
  constructor(props) {
    super(props);

    this.myRef = React.createRef();

    this.width = 400;
    this.height = 200;
    this.margin = {top: 20, right: 20, bottom:30, left: 50};

  }
  
  getTrans() {
    let trans = function(x) {
      return x;
    };
    
    if (this.props.trans === 'sin') {
      trans = function(x) {
        return Math.sin(x*Math.PI/2.0);
      };
    }

    return trans;
  }

  getRed() {
    let points = [];
    let trans = this.getTrans();
    
    var x, point;
    for (x=0; x<1.0; x+=0.001) {
      point = [x];

      if      (x < 1.0/6.0) point.push(1.0);
      else if (x < 2.0/6.0) point.push(trans(1.0 - (x-1.0/6.0)*6.0));
      else if (x < 4.0/6.0) point.push(0.0);
      else if (x < 5.0/6.0) point.push(trans((x-4.0/6.0)*6.0));
      else                  point.push(1.0);

      points.push(point);
    }

    return points;
  }

  getGreen() {
    let points = [];
    let trans = this.getTrans();
    
    var x, point;
    for (x=0; x<1.0; x+=0.001) {
      point = [x];

      if      (x < 1.0/6.0) point.push(trans((x-0.0/6.0)*6.0));
      else if (x < 3.0/6.0) point.push(1.0);
      else if (x < 4.0/6.0) point.push(trans(1.0 - (x-3.0/6.0)*6.0));
      else                  point.push(0.0);

      points.push(point);
    }

    return points;
  }

  getBlue() {
    let points = [];
    let trans = this.getTrans();
    
    var x, point;
    for (x=0; x<1.0; x+=0.001) {
      point = [x];

      if      (x < 2.0/6.0) point.push(0.0);
      else if (x < 3.0/6.0) point.push(trans((x-2.0/6.0)*6.0));
      else if (x < 5.0/6.0) point.push(1.0);
      else if (x < 6.0/6.0) point.push(trans(1.0 - (x-5.0/6.0)*6.0));

      points.push(point);
    }

    return points;
  }

  componentDidMount() {
    let red = this.getRed();
    let green = this.getGreen();
    let blue = this.getBlue();

    let svg = d3.select(this.myRef.current)
          .append("svg")
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom)
          .attr("margin", "auto")
          .attr("display", "block")
          .append("g")
          .attr("transform", "translate(" + this.margin.left + "," 
                + this.margin.top + ")");

    let x = d3.scaleLinear()
          .domain([0, 1])
          .range([0, this.width]);

    let y = d3.scaleLinear()
          .domain([0, 1])
          .range([this.height, 0]);

    let line = d3.line()
          .x(d => x(d[0]))
          .y(d => y(d[1]));

    svg.append("path")
      .data([red])
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);


    svg.append("path")
      .data([green])
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    svg.append("path")
      .data([blue])
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line);

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x));

    console.log('svg = ' + svg);
    console.log(svg);
  }

  
  render() {
    return (
      <div ref={this.myRef}
           style={{height: this.height + this.margin.top + this.margin.bottom, 
                   margin: 'auto', 
                   display: 'block'}}>
      </div>
    );
  }
}

export default ColormapRGBPlot;
