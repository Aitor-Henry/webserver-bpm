import React from 'react';
import ReactDom from 'react-dom';
import { Button, Alert, Glyphicon } from 'react-bootstrap';
import { ListGroup,ListGroupItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import { listClick } from '../actions/button.js'
import {hideAlert} from '../actions/canvas.js'


class Infos extends React.Component {
  constructor(props) {
    super(props);

    //this.listClick = this.listClick.bind(this);
    this.closeClicked= this.closeClicked.bind(this);

  }


 
  closeClicked(){
    this.props.hideAlert();

  }

  render(){

    return (
      <div className="container-fluid">
        <div className="row">
        <div className="col-md-3"></div>
          <div className="col-md-9">
          <h3> Frame {this.props.img_num} | Fwhm {Math.round(this.props.fwhmX*100)/100} x {Math.round(this.props.fwhmY*100)/100} | Intensity={this.props.intensity} bx={Math.round(this.props.bx*1)/1} by= {Math.round(this.props.by*1)/1}
          <p hidden={!this.props.activeROI}>ROI: x={this.props.start_X_display} y={this.props.start_Y_display} w={this.props.width} h={this.props.height}  </p></h3>
          </div>
        </div>
        <div className="row">
        <div className="col-md-5"></div>
          <div className="col-md-2">
          <Alert bsStyle="success" hidden={this.props.alertHidden}> ROI was applied successfully ... <Glyphicon onClick={this.closeClicked}  glyph={'remove'} /></Alert>
          </div>
        </div>
      </div>
   );

}

}

function mapStateToProps(state) {
  return {
    img_num : state.canvas.img_num,
    fwhmX :state.canvas.fwhmX,
    fwhmY :state.canvas.fwhmY,
    intensity :state.canvas.intensity,
    bx :state.canvas.bx,
    by :state.canvas.by,
    alertHidden:state.canvas.alertHidden,
    start_X_display: state.canvas.start_X_display,
    start_Y_display: state.canvas.start_Y_display,
    width: state.canvas.width,
    height: state.canvas.height,
    activeROI:state.video.activeROI
  };
}

 function mapDispatchToProps(dispatch) { //On rend les action accessible a notre object react
  return {
    //listClick: bindActionCreators(listClick, dispatch)
    hideAlert:bindActionCreators(hideAlert,dispatch)

  };
}


export default connect(mapStateToProps,mapDispatchToProps)(Infos);
