import React from 'react';
import ReactDom from 'react-dom';
import { DropdownButton } from 'react-bootstrap';

export default class Dropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = { openDropdown: false };

    this.onDropdownToggle = this.onDropdownToggle.bind(this);
  }

  onDropdownToggle(isOpen, event, src) {

    if (src.source==='select') {
      this.setState({openDropdown: true});
    }
    else {
      this.setState({openDropdown: isOpen});
    }
  }

  render(){
    return <DropdownButton {...this.props} open={this.state.openDropdown} onToggle={this.onDropdownToggle}>{this.props.children}</DropdownButton>
  }
}
