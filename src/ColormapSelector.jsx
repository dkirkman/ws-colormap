import React, {Component} from 'react';

class ColormapSelector extends Component {
  select_changed(event) {
    console.log('hey there, select changed ' + event.target.value);
  }

  render() {
    return (
      <div>
        Hey
        <select onChange={this.select_changed}>
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </select>
        Done hey 
      </div>
    );
  }
}

export default ColormapSelector;
