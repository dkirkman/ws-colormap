import React, { Component } from 'react';
import chroma from 'chroma-js';
import * as d3 from 'd3';

class ColormapTestImage extends Component {
  constructor(props) {
    super(props);

    this.set_grayscale = this.set_grayscale.bind(this);
    this.set_scale1 = this.set_scale1.bind(this);
    this.set_d3_scale1 = this.set_d3_scale1.bind(this);

    this.myRef = React.createRef();
    this.scale1 = chroma.scale(['black', 'blue', 'red', 'white']).correctLightness();
    this.scale1 = chroma.scale(['yellow', 'green', 'blue']);

    console.log('d3 = ' + d3);
    console.log(d3);

    this.d3_scale1 = d3.scaleLinear()
      .domain([0, 1])
      .range(["hsl(222,30%,20%)", "hsl(62,100%,90%)"])
//      .range(["hsl(62,100%,90%)", "hsl(222,30%,20%)"])
      .interpolate(d3.interpolateHcl);

    this.d3_scale1 = d3.interpolateInferno;
    this.d3_scale1 = d3.interpolateCubehelixDefault;
    this.d3_scale1 = d3.interpolateWarm;  // Not good
    this.d3_scale1 = d3.interpolateCool;  // Also Not good
    this.d3_scale1 = d3.interpolateBuGn;  // ok
    this.d3_scale1 = d3.interpolateYlOrRd;
    this.d3_scale1 = d3.interpolateSpectral;  // also not great, but a diverging scheme
    this.d3_scale1 = d3.interpolateCubehelixDefault;

     console.log('this.scale1 = ' + this.scale1);
  }

  componentDidMount() {
    this.width = 512;
    this.height = 200;

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

  set_scale1(nval) {
    let color = this.scale1(nval);

    return {'red': color.get('rgb.r'),
            'green': color.get('rgb.g'),
            'blue': color.get('rgb.b')
            };
  }

  set_d3_scale1(nval) {
    let color = d3.rgb(this.d3_scale1(nval));

    return {'red': color.r,
            'green': color.g,
            'blue': color.b
            };
  }

  initialize_colormap() {
    console.log('start init colormap');

    this.cmap_size = 200;
    this.color_red = new Uint8Array(this.cmap_size);
    this.color_green = new Uint8Array(this.cmap_size);
    this.color_blue = new Uint8Array(this.cmap_size);

    let cmap_set = this.set_grayscale;
    cmap_set = this.set_scale1;
    cmap_set = this.set_d3_scale1;

    var i, nval;
    for (i=0; i<this.cmap_size; ++i) {
      nval = i/this.cmap_size;

      let color = cmap_set(nval);
      this.color_red[i] = color.red;
      this.color_green[i] = color.green;
      this.color_blue[i] = color.blue;
    }

    console.log('done init colormap');
  }

  set_pix(data, pn, val, min, max) {
    let cmap_i = Math.round((val-min)/(max-min)*this.cmap_size);
    if (cmap_i >= this.cmap_size) cmap_i = this.cmap_size - 1;

    data[pn]   = this.color_red[cmap_i];
    data[pn+1] = this.color_green[cmap_i];
    data[pn+2] = this.color_blue[cmap_i];
    data[pn+3] = 255;
  }

  go_rake() {
    this.initialize_colormap();
    let width = this.width;
    let height = this.height;
    let data = this.data;

    let amp = 0.05;
    var i, j, pn, pv, row_amp;
    for (j=0; j<height; ++j) {
      row_amp = (1-j/height) * amp;
      for (i=0; i<width; ++i) {
        pn = (j*width + i) * 4;
        
        pv = i/width + Math.sin(Math.PI*2.0*i / 8.0) * row_amp + amp;
        this.set_pix(data, pn, pv, 0.0, 1.0);
      }
    }

    this.context.putImageData(this.imageData, 0, 0);
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
          pv = Math.sin(Math.PI*2*r / 20.0)/r;
          pv = pv*pv;
        } else {
          pv = 1.0;
        }

        this.set_pix(data, pn, pv, 0.0, 0.001);
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
    return (
      <div ref={this.myRef} 
           style={{height: '200px', margin: 'auto', display: 'block'}}>
      </div>
    );
  }
}

export default ColormapTestImage;
