import React from 'react';
import ReactDom from 'react-dom';
import { Navbar,Nav,NavItem,NavDropdown,MenuItem,Form,FormGroup,FormControl,Col,ControlLabel,Button,Tab,Tabs,Radio,dropdown,DropdownButton,ButtonGroup,Checkbox,Glyphicon,Image,OverlayTrigger,Overlay,Tooltip,SplitButton } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {linearClicked,logarithmicClicked,autoscaleChecked,temperatureChecked,updateBackground,setCrosshair,setRoi,rotation} from '../actions/video.js'
import {resetRoi,resetCrosshair,switchDimensions} from '../actions/canvas.js'
import {setImgDisplay} from '../actions/options.js'
import Dropdown from '../components/dropdown.js'
import Canvas from '../components/canvas.js'
import Dygraph from 'dygraphs'

class Video extends React.Component {
  constructor(props) {
    super(props);

    this.linearClicked=this.linearClicked.bind(this);
    this.logarithmicClicked=this.logarithmicClicked.bind(this);
    this.autoscaleChecked=this.autoscaleChecked.bind(this);
    this.temperatureChecked=this.temperatureChecked.bind(this);
    this.crosshair = this.crosshair.bind(this);
    this.background = this.background.bind(this);
    this.roi = this.roi.bind(this);
    this.resetROI = this.resetROI.bind(this);
    this.resetCROSSHAIR = this.resetCROSSHAIR.bind(this);
    this.rotation = this.rotation.bind(this);
    this.graph = this.graph.bind(this);
    
  }


  componentDidUpdate(){
    if(this.props.profileX.length != 0 && this.props.profileY.length != 0){
      this.graph();
    }
    
  }

  linearClicked(){
    this.props.linearClicked();
  }

  logarithmicClicked(){
    this.props.logarithmicClicked();
  }

  autoscaleChecked(){
    this.props.autoscaleChecked();
  }

  temperatureChecked(){
    this.props.temperatureChecked();
  }

  crosshair(){
    this.props.setCrosshair();
  }

  resetCROSSHAIR(){
    if(this.props.activeCrosshair){
      this.crosshair();
    }
    this.props.resetCrosshair();

  }

  background(){
    this.props.updateBackground();
  }

  roi(){
    this.props.setRoi();
  }

  resetROI(){
    this.props.resetRoi();
    this.props.resetCrosshair();
    if(this.props.activeBkgnd===true){ //if there is a bkg when we reset ROI, then we need to reset it because of changes in dimensions.
      this.background();
    }
    this.props.setImgDisplay();
  }

  rotation(rotate){
    if(this.props.rotate % 90 ===0 || this.props.rotate % 270 === 0){
      this.props.rotation(rotate);
    }
    else {
      this.props.switchDimensions(Math.abs(this.props.windowWidth),Math.abs(this.props.windowHeight));
      this.props.rotation(rotate);
    }
  }

  graph(){
    
    var data = [];
    for(let i=0;i <= this.props.profileX.length;i++){
      data.push([i, this.props.profileX[i]]);
    }
    
    var g = new Dygraph(document.getElementById("graph1"), data,
            {
              drawPoints: false,
              showRoller: false,
              legend : 'never',
              dateWindow : [0, this.props.profileX.length],
              labels: ['Time', 'Random'],
              width : this.props.windowWidth,
              height : this.props.windowHeight/2,
              axes: {
                y: {
                  axisLabelFormatter: function(y) {
                    return '';
                  }
                }
              }
            });
            


    var data2 = [];

    for(let i=0; i < this.props.profileY.length; i++){
      data2.push([this.props.profileY[this.props.profileY.length-(i+1)],i])
    }

    var g2 = new Dygraph(document.getElementById("graph2"), data2,
            {
              drawPoints: false,
              showRoller: false,
              legend : 'never',
              dateWindow : [Math.min(...this.props.profileY),Math.max(...this.props.profileY)],
              labels: ['Time', 'Random'],
              height : this.props.windowHeight,
              width : this.props.windowWidth/2,
              
              axes: {
                x: {
                  axisLabelFormatter: function(x) {
                    return '';
                  }
                },
              }
            });

  }

  

  

  render(){
    const crosshair = (
        <Tooltip id="tooltip">Click here to set/lock crosshair data :
                              X={this.props.beam_markX} Y={this.props.beam_markY}</Tooltip>
    );

    const background = (
        <Tooltip id="tooltip">Click here to take/reset background</Tooltip>
    );

    const roi = (
        <Tooltip id="tooltip">Click here to activate/desactivate ROI mod</Tooltip>
    );

    const rotation = (
        <Tooltip id="tooltip">Click here to rotate the image of 90 degrees</Tooltip>
    );

    return (
      <div className="container-fluid">
        <div className="row">
         <div className="col-md-1"></div>
          <div className="col-md-9">
            <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
              <div className="row">
                <div className="col-md-12">
                  <ButtonGroup>

                    <OverlayTrigger placement="left" overlay={crosshair}>
                      <SplitButton title='Lock Crosshair'   id="bg-vertical-splitbuttons-1" onClick={this.crosshair} disabled={this.props.liveRun ===1 || this.props.rotate!=0 || this.props.beam_markX===undefined || this.props.beam_markY===undefined} active={this.props.activeCrosshair}>
                        <MenuItem onClick={this.resetCROSSHAIR} disabled={this.props.liveRun ===1}> Reset <Glyphicon glyph="screenshot" /></MenuItem>
                      </SplitButton>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={background}>
                      <Button onClick={this.background} active={this.props.activeBkgnd} disabled={this.props.liveRun ===1}><Glyphicon glyph="picture" /> Bkgnd</Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={roi}>
                      <SplitButton title='ROI'   id="bg-vertical-splitbuttons-2" onClick={this.roi} disabled={this.props.liveRun ===1 || this.props.rotate!=0} active={this.props.activeROI}>
                      <MenuItem onClick={this.resetROI} disabled={this.props.liveRun ===1 || this.props.resetDesactivated}><Glyphicon glyph="remove" /> Reset ROI</MenuItem>
                    </SplitButton>
                    </OverlayTrigger>

                    <DropdownButton title={this.props.selectedLut} disabled={this.props.liveRun ===1} id="bg-vertical-dropdown-1">
                      <MenuItem eventKey="1" onClick={this.linearClicked}>Linear</MenuItem>
                      <MenuItem eventKey="2" onClick={this.logarithmicClicked}>Logarithmic</MenuItem>
                      <MenuItem divider />
                      <Checkbox onChange={this.autoscaleChecked}>Autoscale</Checkbox>
                      <Checkbox onChange={this.temperatureChecked}>Temperature color</Checkbox>
                    </DropdownButton>

                    <OverlayTrigger placement="top" overlay={rotation}>
                      <DropdownButton id='DropdownRotate' title ='Rotate' disabled={this.props.liveRun ===1}>
                        <MenuItem onClick={()=>{this.rotation(90)}} disabled={this.props.liveRun ===1}><Glyphicon glyph="refresh" /> Rotate 90</MenuItem>
                        <MenuItem onClick={()=>{this.rotation(180)}} disabled={this.props.liveRun ===1}><Glyphicon glyph="refresh" /> Rotate 180</MenuItem>
                        <MenuItem onClick={()=>{this.rotation(270)}} disabled={this.props.liveRun ===1}><Glyphicon glyph="refresh" /> Rotate 270</MenuItem>
                      </DropdownButton>
                    </OverlayTrigger>

                  </ButtonGroup>
                  </div>

              </div>
              <div className="row">
                <div className="col-md-7">
                  <Canvas ref='canvas' />
                </div>
                <div className="col-md-3">
                  <div id='graph2'/>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div id='graph1'/>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
   );

  }

}

function mapStateToProps(state) {
  return {
    selectedLut:state.video.selectedLut,
    activeBkgnd: state.video.activeBkgnd,
    liveRun: state.options.liveRun,
    activeCrosshair: state.video.activeCrosshair,
    beam_markX: state.canvas.beam_markX,
    beam_markY: state.canvas.beam_markY,
    activeROI:state.video.activeROI,
    resetDesactivated: state.canvas.resetDesactivated,
    rotate: state.video.rotation,
    windowWidth:state.canvas.windowWidth,
    windowHeight:state.canvas.windowHeight,
    profileX : state.canvas.profileX,
    profileY : state.canvas.profileY,
    windowWidth:state.canvas.windowWidth,
    windowHeight:state.canvas.windowHeight,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    linearClicked: bindActionCreators(linearClicked, dispatch),
    logarithmicClicked: bindActionCreators(logarithmicClicked, dispatch),
    autoscaleChecked: bindActionCreators(autoscaleChecked, dispatch),
    temperatureChecked: bindActionCreators(temperatureChecked, dispatch),
    updateBackground: bindActionCreators(updateBackground,dispatch),
    setCrosshair: bindActionCreators(setCrosshair,dispatch),
    setRoi: bindActionCreators(setRoi, dispatch),
    resetRoi: bindActionCreators(resetRoi, dispatch),
    resetCrosshair: bindActionCreators(resetCrosshair, dispatch),
    rotation: bindActionCreators(rotation,dispatch),
    switchDimensions: bindActionCreators(switchDimensions,dispatch),
    setImgDisplay:bindActionCreators(setImgDisplay,dispatch),

  };
}

export default connect(mapStateToProps,mapDispatchToProps)(Video);
