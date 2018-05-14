import React, { Component } from 'react';
import chroma from 'chroma-js';
import * as d3 from 'd3';

class ColormapTestImage extends Component {
  constructor(props) {
    super(props);

    this.set_grayscale = this.set_grayscale.bind(this);
    this.set_rainbow = this.set_rainbow.bind(this);
    this.set_scale1 = this.set_scale1.bind(this);
    this.set_cyclic_demon = this.set_cyclic_demon.bind(this);

    this.myRef = React.createRef();
//    this.scale1 = chroma.scale(['red', 'green', 'blue', 'red'])
    this.scale1 = chroma.scale(['black', 'red', 'white']).correctLightness();
    this.scale2 = chroma.scale(['black', 'blue', 'white']).correctLightness();
  }

  componentDidMount() {
    this.width = 512;
    this.height = 100;
//    if (this.props.type === "sinc") this.height = 200;

    this.center_x = this.width/2.0;
    this.center_y = this.height/2.0;

    let canvas = document.createElement('canvas');
    canvas.style.margin = 'auto';
    canvas.style.display = 'block';
    canvas.width = this.width;
    canvas.height = this.height;

    this.myRef.current.append(canvas);

    this.context = canvas.getContext('2d');
    this.imageData = this.context.getImageData(0, 0, this.width, this.height);
    this.data = this.imageData.data;

    if (this.props.lmap === "true") {
      this.lmap_height = 20;
      this.lmap_padding_top = 10;

      let lmap_canvas = document.createElement('canvas');
      lmap_canvas.style.margin = 'auto';
      lmap_canvas.style.display = 'block';
      lmap_canvas.style['padding-top'] = this.lmap_padding_top + 'px';
      lmap_canvas.width = this.width;
      lmap_canvas.height = this.lmap_height;
      
      this.myRef.current.append(lmap_canvas);
      
      this.lmap_context = lmap_canvas.getContext('2d');
      this.lmap_imageData 
        = this.lmap_context.getImageData(0, 0, this.width, this.lmap_height);
      this.lmap_data = this.lmap_imageData.data;
    } 

    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.go(), 100);
    }
  }

  componentWillUnmount() {
  }

  set_grayscale(nval) {
    return {'red': nval*255,
            'green': nval*255,
            'blue': nval*255
           };
  }

  set_cyclic_grayscale(nval) {
    nval *= 2;
    if (nval > 1) nval = 2.0-nval;

    return {'red': nval*255,
            'green': nval*255,
            'blue': nval*255
           };    
  }

  set_cyclic_demon(nval) {
    nval *= 2;
    var c;

    if (nval <= 1.0) {
      c = this.scale1(nval);
    } else {
      nval = 2.0-nval;
      c = this.scale2(nval);
    }

    return {red: c.get('rgb.r'),
            blue: c.get('rgb.b'),
            green: c.get('rgb.g')
           };
  }

  normalized_rainbow(x) {
    let trans = function(x) {
      return x;
    };
    
    if (this.props.trans === 'sin') {
      trans = function(x) {
        return Math.sin(x*Math.PI/2.0);
      };
    }

    if (x < 1.0/6.0) {
      return {red: 1, green: trans((x-0.0/6.0)*6.0), blue: 0};
    } else if (x < 2.0/6.0) {
      return {red: trans(1.0-(x-1.0/6.0)*6.0), green: 1, blue: 0};
    } else if (x < 3.0/6.0) {
      return {red: 0, green: 1, blue: trans((x-2.0/6.0)*6.0)}; 
    } else if (x < 4.0/6.0) {
      return {red: 0, green: trans(1.0-(x-3.0/6.0)*6.0), blue:1};
    } else if (x < 5.0/6.0) {
      return {red: trans((x-4.0/6.0)*6), green: 0, blue: 1};
    } else {
      return {red: 1, green: 0, blue: trans(1-(x-5.0/6.0)*6.0)};
    }
  }

  set_rainbow(x) {
    let nr = this.normalized_rainbow(x);
    return {red: Math.round(255*nr.red),
            green: Math.round(255*nr.green),
            blue: Math.round(255*nr.blue)
           };
  }

  set_constant_lightness(x) {
    let phase = Math.round(250*x);
    let color = chroma.hcl(phase, 60, 80);

    return {'red': color.get('rgb.r'),
            'green': color.get('rgb.g'),
            'blue': color.get('rgb.b')
            };
  }

  set_scale1(nval) {
    console.log('set_scale1 ' + nval);
    let color = this.scale1(nval);
    console.log('color = ' + color);
    console.log(color);

    return {red: color.get('rgb.r'),
            green: color.get('rgb.g'),
            blue: color.get('rgb.b')
            };
  }

  set_d3(scale, nval) {
    let color = d3.rgb(scale(nval));

    return {'red': color.r,
            'green': color.g,
            'blue': color.b
            };
  }

  initialize_colormap() {
    this.cmap_size = 200;
    this.color_red = new Uint8Array(this.cmap_size);
    this.color_green = new Uint8Array(this.cmap_size);
    this.color_blue = new Uint8Array(this.cmap_size);
    this.color_luminance = new Float32Array(this.cmap_size);

    var cmap_set;
    if      (this.props.cmap === "rainbow") cmap_set = this.set_rainbow;
    else if (this.props.cmap === "constant-lightness") 
      cmap_set = this.set_constant_lightness;
    else if (this.props.cmap === "inferno") 
      cmap_set = nval => this.set_d3(d3.interpolateInferno, nval);
    else if (this.props.cmap === "cubehelix") 
      cmap_set = nval => this.set_d3(d3.interpolateCubehelixDefault, nval);
    else if (this.props.cmap === "bugn") 
      cmap_set = nval => this.set_d3(d3.interpolateBuGn, nval);
    else if (this.props.cmap === "warm") 
      cmap_set = nval => this.set_d3(d3.interpolateWarm, nval);
    else if (this.props.cmap === "cool") 
      cmap_set = nval => this.set_d3(d3.interpolateCool, nval);
    else if (this.props.cmap === "d3rainbow") 
      cmap_set = nval => this.set_d3(d3.interpolateRainbow, nval);
    else if (this.props.cmap === "sinebow")
      cmap_set = nval => this.set_d3(d3.interpolateRainbow, nval);
    else if (this.props.cmap === "cyclic-demon")
      cmap_set = this.set_cyclic_demon;
    else if (this.props.cmap === "cyclic-grayscale") 
      cmap_set = this.set_cyclic_grayscale;
    else cmap_set = this.set_grayscale;

    let luminance = (color, val) => color;
    if (this.props.luminance === 'linear') {
      luminance = (color, val) => color.luminance(val);
    }
    var i, nval;
    for (i=0; i<this.cmap_size; ++i) {
      nval = i/this.cmap_size;

      let color = cmap_set(nval);
      let ccolor = chroma.rgb(color.red, color.green, color.blue);
      ccolor = luminance(ccolor, nval);

      this.color_red[i] = ccolor.get('rgb.r');
      this.color_green[i] = ccolor.get('rgb.g');
      this.color_blue[i] = ccolor.get('rgb.b');

      this.color_luminance[i] = chroma(ccolor).luminance();
      this.color_luminance[i] = ccolor.luminance();
    }
  }

  set_pix(data, pn, val, min, max) {
    let cmap_i = Math.round((val-min)/(max-min)*this.cmap_size);
    if (cmap_i >= this.cmap_size) cmap_i = this.cmap_size - 1;

    data[pn]   = this.color_red[cmap_i];
    data[pn+1] = this.color_green[cmap_i];
    data[pn+2] = this.color_blue[cmap_i];
    data[pn+3] = 255;
  }

  set_lmap_pix(data, pn, val, min, max) {
    let cmap_i = Math.round((val-min)/(max-min)*this.cmap_size);
    if (cmap_i >= this.cmap_size) cmap_i = this.cmap_size - 1;

    let lval = Math.round(this.color_luminance[cmap_i]*255);
    data[pn]   = lval;
    data[pn+1] = lval;
    data[pn+2] = lval;
    data[pn+3] = 255;
  }

  go_rake() {
    this.initialize_colormap();
    let width = this.width;
    let height = this.height;
    let data = this.data;

    let lmap_height = this.height;
    let lmap_data = this.lmap_data;

    let amp = 0.1;
    var i, j, pn, pv, row_amp;
    for (j=0; j<height; ++j) {
      row_amp = (1-j/height) * amp;
      for (i=0; i<width; ++i) {
        pn = (j*width + i) * 4;
        
        pv = i/width*(1.0-2*amp) + Math.sin(Math.PI*2.0*i / 8.0) * row_amp + amp;
        this.set_pix(data, pn, pv, 0.0, 1.0);
      }
    }

    if (this.props.lmap === "true") {
      for (i=0; i<width; ++i) {
        for (j=0; j<lmap_height; ++j) {
          pn = (j*width + i) * 4;
          pv = i/width*(1.0-2*amp) + amp;

          this.set_lmap_pix(lmap_data, pn, pv, 0.0, 1.0);
        }
      }
    }

    this.context.putImageData(this.imageData, 0, 0);
    if (this.props.lmap === "true") { 
      this.lmap_context.putImageData(this.lmap_imageData, 0, 0);
    }
  }

  go_sinc() {
    this.initialize_colormap();

    let height = this.height;
    let width = this.width;
    let center_x = this.center_x;
    let center_y = this.center_y;
    let data = this.data;
    
    var i, j, pn, pv, r, dx, dx2, dy, dy2;
    for (j=0; j<height; ++j) {
      dy = j-center_y;
      dy2 = dy*dy;
      for (i=0; i<width; ++i) {
        pn = (j*width + i) * 4;

        dx = i-center_x;
        dx2 = dx*dx;
        r = Math.sqrt(dx2+dy2);

        if (r > 0) {
          let depress = Math.exp(-r/200);
          pv = Math.sin(Math.PI*2*r / 50.0)*depress;
          if (j == 50) {
            console.log('r = ' + r + '  ' + pv*pv);
          }
          pv = pv*pv;
        } else {
          pv = 0.0;
        }

        this.set_pix(data, pn, pv, 0.0, 1.0);
      }
    }

    this.context.putImageData(this.imageData, 0, 0);
  }

  go() {
    if (this.props.type === 'sinc') {
      return this.go_sinc();
    } else if (this.props.type === 'rake') {
      return this.go_rake();
    }
  }

  render() {
    let total_height = this.height;
    if (this.props.lmap === "true") {
      total_height += this.lmap_height;
      total_height += this.lmap_padding_top;
    }

    total_height = total_height + 'px';
    return (
      <div ref={this.myRef} 
           style={{height: total_height, margin: 'auto', display: 'block'}}>
      </div>
    );
  }
}

export default ColormapTestImage;
