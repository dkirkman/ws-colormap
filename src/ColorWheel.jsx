import React, { Component } from 'react';
import chroma from 'chroma-js';

class ColorWheel extends Component {
  constructor(props) {
    super(props);

    this.myRef = React.createRef();

    console.log('hey there, this is colorwheel');
    console.log('cwtype = ' + props.cwtype);
    console.log(props);
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.go(), 100);
    }
  }

  componentWillUnmount() {
  }


  go() {

    console.log('actually drawing');
    let cmap = this.myRef.current;
    console.log('cmap = ' + cmap);
    console.log(cmap);

    // typical human sensitivities to different colors
    var s1 = { 'blue': 0.114 / 0.114
              , 'green': 0.587 / 0.114
              , 'red': 0.299 / 0.114
             };

    var s = { 'blue': 0.2 / 0.114
              , 'green': 0.2 / 0.114
              , 'red': 0.2 / 0.114
             };

    var lightness = function(r, g, b) {
        return s.red*r*r + s.green*g*g + s.blue*b*b;
    };

   var arc_coords = function(cent_x, cent_y, radius, theta) {
        var x = cent_x + Math.sin(theta)*radius;
        var y = cent_y - Math.cos(theta)*radius

        return {'x': x, 'y': y};
    };

    var get_gray = function(nval) {
        // nval -- normalized value, [0, 1)
        nval = Math.sqrt(nval);
        var inten = Math.round(nval * 255).toString(16);
        if (inten.length < 2) inten = '0' + inten;
        
        var color = '#' + inten + inten + inten;
        return color;
    };

    function lin_interp(val) {
      return Math.round(val*255);
    }

    function sin_interp(val) {
      let sval = Math.sin(val*Math.PI/2.0);
      return Math.round(sval*255);
    }

    function get_cyclic_rainbow(interp=lin_interp) {
      return function(inten) {
        var red = 0;
        var green = 0;
        var blue = 0;
        
        
        if (inten < 1.0/6.0) {
          red = 255;
          blue = 0;
          
          let frac = inten * 6.0;
          green = interp(frac);
        } else if (inten < 2.0/6.0) {
          green = 255;
          blue = 0;
          
          let frac = (inten-1.0/6.0) * 6.0;
          red = interp(1.0-frac);
        } else if (inten < 3.0/6.0) {
          green = 255;
          red = 0;
          
          let frac = (inten-2.0/6.0) * 6.0;
          blue = interp(frac);
        } else if (inten < 4.0/6.0) {
          blue = 255;
          red = 0;
          
          let frac = (inten-3.0/6.0) * 6.0;
          green = interp(1.0-frac);
        } else if (inten < 5.0/6.0) {
          blue = 255;
          green = 0;
          
          let frac = (inten-4.0/6.0) * 6.0;
          red = interp(frac);
        } else {
          red = 255;
          green = 0;
          
          let frac = (inten-5.0/6.0) * 6.0;
          blue = interp(1.0-frac);
        }
        
        red = red.toString(16);
        green = green.toString(16);
        blue = blue.toString(16);
        
        if (red.length < 2)   red   = '0' + red;
        if (green.length < 2) green = '0' + green;
        if (blue.length < 2)  blue  = '0' + blue;
        
        return '#' + red + green + blue;
      };
    };

    var get_cyclic_grayscale = function(nval) {
      // nval -- normalized value, [0, 1)
      nval = nval * 2;
      if (nval >= 1.0) nval = 2.0-nval;

      var inten = Math.round(nval * 255).toString(16);
      if (inten.length < 2) inten = '0' + inten;
      
      var color = '#' + inten + inten + inten;
      return color;    
    }

    var get_cyclic_demon = function(nval) {
      // nval -- normalized value, [0, 1)
      nval = nval * 2;
      if (nval < 1.0) {
        let scale = chroma.scale(['black','red','white']).correctLightness();
        return scale(nval);
      } else {
        nval = 2.0-nval;
        let scale = chroma.scale(['black','blue','white']).correctLightness();
        return scale(nval);
      }
    }

    var make_arc = function(cent_x, cent_y, radius1, radius2, theta1, theta2) {
      let width = radius2 - radius1;
      radius1 = radius1 + width/2.0;

      var coords1 = arc_coords(cent_x, cent_y, radius1, theta1);
      var coords2 = arc_coords(cent_x, cent_y, radius1, theta2);
      
      var path = document.createElementNS('http://www.w3.org/2000/svg',
                                          'path');
      
      var large_arc = '0'
      if (Math.abs(theta1-theta2) > Math.PI/2) large_arc = 1;
      
      var spec = 'M ' + coords1.x + ' ' + coords1.y + ' ';
      spec += 'A ' + radius1 + ' ' + radius1 + ' 0 ' + large_arc + ' 1 ';
      spec += coords2.x + ' ' + coords2.y;
      
      path.setAttribute('d', spec);
      path.setAttribute('stroke', 'green');
      path.setAttribute('stroke-width', width);
      path.setAttribute('fill', 'none');
      
      return path;
    }


    var make_wheel = function(cmap, f_color, inner=30, outer=100) {
        var narc = 300;
        for (var i=0; i<narc; ++i) {
            var end = i+2;
            if (i == narc-1) end = i+1;
            
            var theta1 = Math.PI*2/narc * i;
            var theta2 = Math.PI*2/narc * end;
            
            var arc = make_arc(100, 100, inner, outer, theta1, theta2);
            var color = f_color(i/narc);
            
            arc.setAttribute('stroke', color);
            cmap.appendChild(arc);
        }
    };

    var make_osc_wheel = function(cmap, f_color, inner=30, outer=100) {
        var narc = 500;
        for (var i=0; i<narc; ++i) {
            var end = i+2;
            if (i == narc-1) end = i+1;
            
            var theta1 = Math.PI*2/narc * i;
            var theta2 = Math.PI*2/narc * end;
            
            var arc = make_arc(100, 100, inner, outer, theta1, theta2);

            var wave = i/narc + Math.sin(i/narc * 2 * Math.PI * 100) * 0.01;
            if (wave < 0) wave = 1.0 + wave;
            if (wave > 1) wave = wave - 1.0;
            var color = f_color(wave);
            

            arc.setAttribute('stroke', color);
            cmap.appendChild(arc);
        }
    };

    if (this.props.type == "gray") {
      make_wheel(cmap, get_gray);
    } else if (this.props.type == "cyclic_grayscale") {
      make_wheel(cmap, get_cyclic_grayscale, 30, 100);
    } else if (this.props.type == "cyclic_rainbow") {
      if (this.props.interp == "sin") {
        make_wheel(cmap, get_cyclic_rainbow(sin_interp), 30, 100);
      } else {
        make_wheel(cmap, get_cyclic_rainbow(), 30, 100);
      }
    } else if (this.props.type == "cyclic_demon") {
      make_wheel(cmap, get_cyclic_demon, 30, 100);
    }
  }

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
