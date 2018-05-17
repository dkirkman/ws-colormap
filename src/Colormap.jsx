import chroma from 'chroma-js';
import {rgb as d3_rgb} from 'd3-color';
import * as d3 from 'd3-scale-chromatic';

class Colormap {
  constructor() {
    this.cyclic_demon = this.cyclic_demon.bind(this);
    this.scale1 = chroma.scale(['black', 'red', 'white']).correctLightness();
    this.scale2 = chroma.scale(['black', 'blue', 'white']).correctLightness();
  }

  get_map(scalename) {
    switch (scalename) {
      case "rainbow":
         return this.rainbow(scalename);
      case "kludge-rainbow":
         return this.rainbow(scalename);
      case "constant-lightness":
         return this.constant_lightness(scalename);
      case "cyclic-demon":
         return this.cyclic_demon(scalename);
      case "cyclic-grayscale":
         return this.cyclic_grayscale(scalename);
      case "blues":
      case "greens":
      case "greys":
      case "oranges":
      case "purples":
      case "reds":
      case "viridis":
      case "inferno":
      case "magma":
      case "plasma":
      case "warm":
      case "cool":
      case "cubehelix":
      case "bugn":
      case "bupu":
      case "gnbu":
      case "orrd":
      case "pubugn":
      case "pubu":
      case "purd":
      case "rdpu":
      case "ylgnbu":
      case "ylgn":
      case "ylorbr":
      case "ylorrd":
      case "d3rainbow":
         return this.d3(scalename);
      default:
         return this.grayscale(scalename);
    };
  }

  grayscale(scalename) {
    return function(nval) {
      return{red: nval*255,
             green: nval*255,
             blue: nval*255
            };
    };
  }

  cyclic_grayscale(scalename) {
    return function(nval) {
      nval *= 2;
      if (nval > 1) nval = 2.0-nval;
      
      return {'red': nval*255,
              'green': nval*255,
              'blue': nval*255
             };    
    };
  }

  cyclic_demon(scalename) {
    return nval => {
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
    };
  }

  constant_lightness(scalename) {
    return function(x) {
      let phase = Math.round(250*x);
      let color = chroma.hcl(phase, 60, 80);
      
      return {'red': color.get('rgb.r'),
              'green': color.get('rgb.g'),
              'blue': color.get('rgb.b')
             };
    };
  }

  rainbow(scalename) {
    let trans = function(x) {
      return x;
    };
    if (scalename === 'kludge-rainbow') {
      trans = function(x) {
        return Math.sin(x*Math.PI/2.0);
      };      
    }

    let normalized_rainbow = function(x) {
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
    };

    return function(nval) {
      let nr = normalized_rainbow(nval);
      return {red: Math.round(255*nr.red),
              green: Math.round(255*nr.green),
              blue: Math.round(255*nr.blue)
             };
    };
  }

  d3(scalename) {
    var scale;
    switch (scalename) {
      case "blues":
         scale = d3.interpolateBlues;
         break;
      case "greens":
         scale = d3.interpolateGreens;
         break;
      case "greys":
         scale = d3.interpolateGreys;
         break;
      case "oranges":
         scale = d3.interpolateOranges;
         break;
      case "purples":
         scale = d3.interpolatePurples;
         break;
      case "reds":
         scale = d3.interpolateReds;
         break;
      case "viridis":
         scale = d3.interpolateViridis;
         break;
      case "inferno":
         scale = d3.interpolateInferno;
         break;
      case "magma":
         scale = d3.interpolateMagma;
         break;
      case "plasma":
         scale = d3.interpolatePlasma;
         break;
      case "warm":
         scale = d3.interpolateWarm;
         break;
      case "cool":
         scale = d3.interpolateCool;
         break;
      case "cubehelix":
         scale = d3.interpolateCubehelixDefault;
         break;
      case "bugn":
         scale = d3.interpolateBuGn;
         break;
      case "bupu":
         scale = d3.interpolateBuPu;
         break;
      case "gnbu":
         scale = d3.interpolateGnBu;
         break;
      case "orrd":
         scale = d3.interpolateOrRd;
         break;
      case "pubugn":
         scale = d3.interpolatePuBuGn;
         break;
      case "pubu":
         scale = d3.interpolatePuBu;
         break;
      case "purd":
         scale = d3.interpolatePuRd;
         break;
      case "rdpu":
         scale = d3.interpolateRdPu;
         break;
      case "ylgnbu":
         scale = d3.interpolateYlGnBu;
         break;
      case "ylgn":
         scale = d3.interpolateYlGn;
         break;
      case "ylorbr":
         scale = d3.interpolateYlOrBr;
         break;
      case "ylorrd":
         scale = d3.interpolateYlOrRd;
         break;
      case "d3rainbow":
         scale = d3.interpolateRainbow;
         break;
      default:
         scale = d3.interpolateInferno;
    }

    return function(nval) {      
      let color = d3_rgb(scale(nval));

      return {red: color.r,
              green: color.g,
              blue: color.b};
    };
  }
}

export default Colormap;
