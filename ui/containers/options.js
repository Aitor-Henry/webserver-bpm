import React from 'react';
import ReactDom from 'react-dom';
import { Navbar,Nav,NavItem,NavDropdown,MenuItem,Form,FormGroup,FormControl,Col,ControlLabel,Button,Glyphicon,DropdownButton,} from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {buttonAcquirePressed,textEnterExposure,textEnterSampling,textEmptyExposure,textEmptySampling,liveChecked,textEnterCalib_X,textEnterCalib_Y,textEmptyX,textEmptyY,getBeamPos,setImgDisplay,update_calibration_apply,update_calibration_save } from '../actions/options.js'
import Dropdown from '../components/dropdown.js'

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.buttonAcquirePressed = this.buttonAcquirePressed.bind(this);
    this.textStateExposure = this.textStateExposure.bind(this);
    this.textStateSampling = this.textStateSampling.bind(this);
    this.liveChecked = this.liveChecked.bind(this);
    this.textStateCalib_x = this.textStateCalib_x.bind(this);
    this.textStateCalib_y = this.textStateCalib_y.bind(this);
    this.apply = this.apply.bind(this);

  }


  textStateExposure(){

    if(ReactDom.findDOMNode(this.refs.exposure).value > -0.01){ // if >0, can't write "0,xxx" because of the first 0
      this.props.textEnterExposure(ReactDom.findDOMNode(this.refs.exposure).value);
    }
    else {
      this.props.textEmptyExposure(); 
    }
  }

  textStateSampling(){

    if(ReactDom.findDOMNode(this.refs.sampling).value > -0.01 && ReactDom.findDOMNode(this.refs.sampling).value<=(1.0/this.props.exposureTimeValue)){

      this.props.textEnterSampling(ReactDom.findDOMNode(this.refs.sampling).value);
    }
    else{
      this.props.textEmptySampling();
    }
  }

  textStateCalib_x(){

    if(ReactDom.findDOMNode(this.refs.x).value > 0 ){
      this.props.textEnterCalib_X(ReactDom.findDOMNode(this.refs.x).value);
    }
    else{
      this.props.textEmptyX();
    }
  }


  textStateCalib_y(){

    if(ReactDom.findDOMNode(this.refs.y).value > 0 ){
      this.props.textEnterCalib_Y(ReactDom.findDOMNode(this.refs.y).value);
    }
    else{
      this.props.textEmptyY();
    }
  }

  buttonAcquirePressed(){
    this.props.setImgDisplay();
  }


  liveChecked(){
    this.props.liveChecked();
  }


  apply(){
    this.props.update_calibration_apply();
  }


  render(){
    return (
      <div className="container-fluid">
        <div className="row">
        <div className="col-md-2"></div>
          <div className="col-md-4">
            <Form horizontal>
              <FormGroup controlId="formHorizontalExposure">
                <Col componentClass={ControlLabel} sm={4}>Exposure time (s):</Col>
                <Col sm={4}><FormControl type="number" ref="exposure" value={this.props.exposureTimeValue} placeholder="Value" onChange={this.textStateExposure} readOnly={this.props.liveRun === 1}/></Col>
              </FormGroup>
            </Form>
          </div>
          <div className="col-md-2"></div>
          <div className="col-md-4">
          <input type="checkbox" onChange={this.liveChecked} checked={this.props.liveCheckedBool === 1} disabled={this.props.liveRun === 1} />
          <Col componentClass={ControlLabel} sm={13}>Live</Col>
          </div>
        </div>
        <div className="row">
          <div className="col-md-2"></div>
          <div className="col-md-4">
            <Form horizontal>
              <FormGroup controlId="formHorizontalSampling">
                <Col componentClass={ControlLabel} sm={4}>Sampling rate (Hz):</Col>
                <Col sm={4}><FormControl type="number" value={this.props.samplingRateValue} ref="sampling" placeholder="Value" onChange={this.textStateSampling} readOnly={this.props.liveRun === 1}/></Col>
              </FormGroup>
            </Form>
          </div>
          <div className="col-md-2"></div>
          <div className="col-md-4">
          <Button bsStyle={this.props.buttonAcquireStyle} onClick={this.buttonAcquirePressed}><Glyphicon glyph={this.props.buttonAcquireGlyphiconText} /> {this.props.buttonAcquireText}</Button>
          {" "}
          <Dropdown title="Pixel Size" id="bg-vertical-dropdown-Set-Pixel-Size">
            <Form horizontal>
              <FormGroup controlId="formHorizontalPixelSizeX">
                <Col componentClass={ControlLabel} sm={2}>X: </Col>
                <Col sm={8}><FormControl type="number" ref='x' value={this.props.calib_x} onChange={this.textStateCalib_x} placeholder="Value required" readOnly={this.props.liveRun === 1}/></Col>
              </FormGroup>
              <FormGroup controlId="formHorizontalPixelSizeY">
                <Col componentClass={ControlLabel} sm={2}>Y: </Col>
                <Col sm={8}><FormControl type="number" ref='y' value={this.props.calib_y} onChange={this.textStateCalib_y} placeholder="Value required" readOnly={this.props.liveRun === 1}/></Col>
              </FormGroup>
            </Form>
            <MenuItem divider />
            <Button disabled={this.props.applyDisabled || this.props.liveRun === 1 } onClick={this.apply} >Apply</Button>
            {" "}
          </Dropdown>
          </div>
        </div>
      </div>
   );

  }

}

function mapStateToProps(state) {
  return {
    buttonAcquireStyle: state.options.buttonAcquireStyle,
    buttonAcquireText: state.options.buttonAcquireText,
    buttonAcquireGlyphiconText: state.options.buttonAcquireGlyphiconText,
    exposureTimeValue: state.options.exposureTimeValue,
    samplingRateValue: state.options.samplingRateValue,
    liveCheckedBool:state.options.liveCheckedBool,
    calib_x: state.options.calib_x,
    calib_y: state.options.calib_y,
    applyDisabled:state.options.applyDisabled,
    liveRun: state.options.liveRun,
    beam_markX:state.canvas.beam_markX,
    beam_markY:state.canvas.beam_markY,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    buttonAcquirePressed: bindActionCreators(buttonAcquirePressed, dispatch),
    textEnterExposure: bindActionCreators(textEnterExposure, dispatch),
    textEnterSampling: bindActionCreators(textEnterSampling, dispatch),
    textEmptyExposure: bindActionCreators(textEmptyExposure, dispatch),
    textEmptySampling: bindActionCreators(textEmptySampling, dispatch),
    liveChecked:bindActionCreators(liveChecked, dispatch),
    textEnterCalib_X:bindActionCreators(textEnterCalib_X, dispatch),
    textEnterCalib_Y:bindActionCreators(textEnterCalib_Y, dispatch),
    textEmptyX:bindActionCreators(textEmptyX, dispatch),
    textEmptyY:bindActionCreators(textEmptyY, dispatch),
    getBeamPos:bindActionCreators(getBeamPos,dispatch),
    setImgDisplay:bindActionCreators(setImgDisplay,dispatch),
    update_calibration_apply : bindActionCreators(update_calibration_apply,dispatch),

  };
}

export default connect(mapStateToProps,mapDispatchToProps)(Options);
