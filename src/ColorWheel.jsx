import React, { Component } from 'react';
import chroma from 'chroma-js';
import Colormap from './Colormap.jsx';

class ColorWheel extends Component {
  constructor(props) {
    super(props);

    this.myRef = React.createRef();
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.go(), 100);
    }
  }

  componentWillUnmount() {
  }


  go() {
    let colormap = new Colormap();

    let gen_colormap = function(scalename) {
      let map = colormap.get_map(scalename);
      return function(nval) {
        let c = map(nval);

        let red = Math.round(c.red).toString(16);
        let green = Math.round(c.green).toString(16);
        let blue = Math.round(c.blue).toString(16);

        if (red.length < 2)   red   = '0' + red;
        if (green.length < 2) green = '0' + green;
        if (blue.length < 2)  blue  = '0' + blue;
        
        let result = '#' + red + green + blue;        
        return result;
      };
    };

    let svg = this.myRef.current;

    let arc_coords = function(cent_x, cent_y, radius, theta) {
      let x = cent_x + Math.sin(theta)*radius;
      let y = cent_y - Math.cos(theta)*radius;
      
      return {'x': x, 'y': y};
    };
      
    var make_arc = function(cent_x, cent_y, radius1, radius2, theta1, theta2) {
      let width = radius2 - radius1;
      radius1 = radius1 + width/2.0;
      
      var coords1 = arc_coords(cent_x, cent_y, radius1, theta1);
      var coords2 = arc_coords(cent_x, cent_y, radius1, theta2);
      
      var path = document.createElementNS('http://www.w3.org/2000/svg',
                                          'path');
      
      var large_arc = '0';
      if (Math.abs(theta1-theta2) > Math.PI/2) large_arc = 1;
      
      var spec = 'M ' + coords1.x + ' ' + coords1.y + ' ';
      spec += 'A ' + radius1 + ' ' + radius1 + ' 0 ' + large_arc + ' 1 ';
      spec += coords2.x + ' ' + coords2.y;
      
      path.setAttribute('d', spec);
      path.setAttribute('stroke', 'green');
      path.setAttribute('stroke-width', width);
      path.setAttribute('fill', 'none');
      
      return path;
    };
    
    
    var make_wheel = function(svg, f_color, inner=30, outer=100) {
      var narc = 300;
      for (var i=0; i<narc; ++i) {
        var end = i+2;
        if (i == narc-1) end = i+1;
        
        var theta1 = Math.PI*2/narc * i;
        var theta2 = Math.PI*2/narc * end;
        
        var arc = make_arc(100, 100, inner, outer, theta1, theta2);
        var color = f_color(i/narc);
        
        arc.setAttribute('stroke', color);
        svg.appendChild(arc);
      }
    };
    
    make_wheel(svg, gen_colormap(this.props.type));
  };
  
  render() {
    return (
      <div style={{display: 'block', margin: 'auto'}}>
        <svg width="200" height="200" 
             style={{display: 'block', margin: 'auto'}}
             ref={this.myRef}/>
      </div>
    );
  }
}

export default ColorWheel;
