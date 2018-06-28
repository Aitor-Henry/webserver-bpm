import React from 'react';
import ReactDom from 'react-dom';
import { Navbar,Nav,NavItem,NavDropdown,MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LinkContainer } from 'react-router-bootstrap';
import {getStatus} from '../actions/canvas.js'

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.getStatus = this.getStatus.bind(this);
  }


  getStatus(windowWidth,windowHeight){
    this.props.getStatus(windowWidth,windowHeight);
  }


  render(){
    return (
        <Navbar inverse fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <LinkContainer to={'/bcu_basler/'} onClick={this.getStatus(window.innerWidth,window.innerHeight)}><NavItem>{this.props.client_id}</NavItem></LinkContainer>
            </Navbar.Brand>
          </Navbar.Header>
      </Navbar>
   );

  }

}

function mapStateToProps(state) {
  return {
    client_id: state.bpmState.client_id,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getStatus: bindActionCreators(getStatus, dispatch),
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(NavBar);
