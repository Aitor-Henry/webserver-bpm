import React from 'react';
import ReactDom from 'react-dom';
import { Button, Alert, Glyphicon } from 'react-bootstrap';
import { ListGroup,ListGroupItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {hideAlert} from '../actions/canvas.js'


class Infos extends React.Component {
  constructor(props) {
    super(props);

    this.closeClicked= this.closeClicked.bind(this);

  }


 
  closeClicked(){
    this.props.hideAlert();

  }

  render(){

    return (
      <div className="container-fluid">
        <div className="row">
        <div className="col-md-1"></div>
          <div className="col-md-9">
          <h3> Frame {this.props.img_num} | Fwhm {Math.round(this.props.fwhmX*100)/100} x {Math.round(this.props.fwhmY*100)/100} | Intensity={this.props.intensity} bx={Math.round(this.props.bx)} by= {Math.round(this.props.by)}
          <p hidden={!this.props.activeROI}>ROI: x={Math.round(this.props.start_X_display*this.props.calib_x)} y={Math.round(this.props.start_Y_display*this.props.calib_y)} w={Math.round(this.props.width*this.props.calib_x)} h={Math.round(this.props.height*this.props.calib_y)}  </p></h3>
          </div>
        </div>
        <div className="row">
        <div className="col-md-5"></div>
          <div className="col-md-2">
          <Alert bsStyle="success" hidden={this.props.alertHidden}> ROI is apply/reset successfully ... Acquire new image.<Glyphicon onClick={this.closeClicked}  glyph={'remove'} /></Alert>
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
    activeROI:state.video.activeROI,
    calib_x:state.options.calib_x,
    calib_y:state.options.calib_y,
  };
}

 function mapDispatchToProps(dispatch) {
  return {
    hideAlert:bindActionCreators(hideAlert,dispatch)

  };
}


export default connect(mapStateToProps,mapDispatchToProps)(Infos);
