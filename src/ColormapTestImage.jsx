import React, { Component } from 'react';
import chroma from 'chroma-js';

import Colormap from './Colormap.jsx';

class ColormapTestImage extends Component {
  constructor(props) {
    super(props);

    this.state = {cmap: this.props.cmap};

    this.myRef = React.createRef();
    this.colormap = new Colormap();
  }

  componentDidMount() {
    this.is_mounted = true;

    this.width = 512;
    this.height = 100;

    this.center_x = this.width/2.0;
    this.center_y = this.height/2.0;

    let canvas = document.createElement('canvas');
    canvas.style.margin = 'auto';
    canvas.style.display = 'block';
    canvas.width = this.width;
    canvas.height = this.height;

    this.myRef.current.append(canvas);

    this.canvas_context = canvas.getContext('2d');
    this.imageData 
      = this.canvas_context.getImageData(0, 0, this.width, this.height);
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
      window.setTimeout(() => this.go(), 50);
    }
  }

  shouldComponentUpdate(nextPrpos, nextState) {
    return nextState.cmap != this.state.cmap;
  }

  componentDidUpdate(prev_props, prev_state) {
    this.go();
  }

  componentWillUnmount() {
  }

  set_cmap(cmap) {
    this.setState({cmap: cmap});
  }

  initialize_colormap() {
    this.cmap_size = 200;
    this.color_red = new Uint8Array(this.cmap_size);
    this.color_green = new Uint8Array(this.cmap_size);
    this.color_blue = new Uint8Array(this.cmap_size);
    this.color_luminance = new Float32Array(this.cmap_size);

    let cmap_set = this.colormap.get_map(this.state.cmap);

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

    this.canvas_context.putImageData(this.imageData, 0, 0);
    if (this.props.lmap === "true") { 
      this.lmap_context.putImageData(this.lmap_imageData, 0, 0);
    }
  }

  go_expsin() {
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
          pv = pv*pv;
        } else {
          pv = 0.0;
        }

        this.set_pix(data, pn, pv, 0.0, 1.0);
      }
    }

    this.canvas_context.putImageData(this.imageData, 0, 0);
  }

  go() {
    if (this.props.type === 'expsin') {
      return this.go_expsin();
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
