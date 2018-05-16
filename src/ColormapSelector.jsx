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
            <option value="cyclic_rainbow_kludge">Kludge Rainbow</option>
          </optgroup>

          <optgroup label="d3 maps">
            <option value="inferno">Inferno</option>
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
