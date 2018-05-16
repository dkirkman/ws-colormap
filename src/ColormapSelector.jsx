import React, {Component} from 'react';
import ColormapTestImage from './ColormapTestImage.jsx';

class ColormapSelector extends Component {
  constructor(props) {
    super(props);
    this.rake_ref = React.createRef();
    this.expsin_ref = React.createRef();
    this.select_changed = this.select_changed.bind(this);
  }

  select_changed(event) {
    this.rake_ref.current.set_cmap(event.target.value);
    this.expsin_ref.current.set_cmap(event.target.value);
  }

  render() {
    this.expsin = <ColormapTestImage ref={this.expsin_ref} type="sinc"/>;
    this.rake = <ColormapTestImage ref={this.rake_ref} type="rake" lmap="true"/>;

    return (
      <div>
        <select onChange={this.select_changed}>
          <optgroup label="David maps">
            <option value="grayscale">Grayscale</option>
            <option value="rainbow">Rainbow</option>
            <option value="kludge-rainbow">Kludge Rainbow</option>
            <option value="constant-lightness">Constant Lightness</option>
            <option value="cyclic-grayscale">Cyclic Grayscale</option>
            <option value="cyclic-demon">Cyclic Demon</option>
          </optgroup>

          <optgroup label="d3 maps">
            <option value="inferno">Inferno</option>
            <option value="cubehelix">CubeHelix</option>
            <option value="bugn">BuGn</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="d3rainbow">Rainbow</option>
          </optgroup>
        </select>
        {this.expsin}
        <br/>
        {this.rake}
      </div>
    );
  }
}

export default ColormapSelector;
