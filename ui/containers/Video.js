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
    this.resetROI = this.resetROI.bind(this);
    this.resetCROSSHAIR = this.resetCROSSHAIR.bind(this);
    this.rotation = this.rotation.bind(this);
    this.graph = this.graph.bind(this);

    this.graph_profilX = undefined;
    this.graph_profilY = undefined;
    
  }


  componentDidUpdate(prevProps){
    if(this.props.profileX.length != 0 && this.props.profileY.length != 0){
      this.graph(prevProps);
    }
    
  }
 
  resetCROSSHAIR(){
    if(this.props.activeCrosshair){
      this.props.setCrosshair();
    }
    this.props.resetCrosshair();

  }

  resetROI(){
    this.props.resetRoi();
    this.props.resetCrosshair();
    if(this.props.activeBkgnd===true){ //if there is a bkg when we reset ROI, then we need to reset it because of changes in dimensions.
      this.props.updateBackground();
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

  graph(prevProps){
    if(this.graph_profilX===undefined && this.graph_profilY===undefined){
      var data = [];
      for(let i=0;i <= this.props.profileX.length;i++){
        data.push([i, this.props.profileX[i]]);
      }
      this.graph_profilX = new Dygraph(document.getElementById("graph1"), data, {drawPoints: false, showRoller: false, legend : 'never',labels: ['Profile_X', 'Intensity'], dateWindow : [0, this.props.profileX.length], width : this.props.windowWidth, height : this.props.windowHeight/3,
                                                                              axes: {
                                                                                y: {
                                                                                  axisLabelFormatter: function(y) {
                                                                                    return '';
                                                                                  }
                                                                                }
                                                                              }}
                                    );
    
    var data2 = [];
    for(let i=0; i < this.props.profileY.length; i++){
      data2.push([this.props.profileY[this.props.profileY.length-(i+1)],i])
    }                                
    this.graph_profilY = new Dygraph(document.getElementById("graph2"), data2, {drawPoints: false, showRoller: false, legend : 'never',labels: ['Intensity', 'Profile_Y'], dateWindow : [Math.min(...this.props.profileY),Math.max(...this.props.profileY)], width : this.props.windowWidth/3, height : this.props.windowHeight,
                                                                              axes: {
                                                                                x: {
                                                                                  axisLabelFormatter: function(x) {
                                                                                    return '';
                                                                                  }
                                                                                }
                                                                              }}
                                    );
    } else {
      var data = [];
      for(let i=0;i <= this.props.profileX.length;i++){
        data.push([i, this.props.profileX[i]]);
      }
      this.graph_profilX.updateOptions({'file' : data,
                                      dateWindow : [0, this.props.profileX.length],
                                      width : this.props.windowWidth,
                                      height : this.props.windowHeight/3,})
      
    var data2 = [];
    for(let i=0; i < this.props.profileY.length; i++){
      data2.push([this.props.profileY[this.props.profileY.length-(i+1)],i])
    }
    this.graph_profilY.updateOptions({'file' : data2,
                                     dateWindow : [Math.min(...this.props.profileY),Math.max(...this.props.profileY)],
                                     width : this.props.windowWidth/3,
                                     height : this.props.windowHeight})
    }
    if(this.props.liveRun===1 && this.props.profileX!==prevProps.profileX){
      this.props.setImgDisplay();
    }
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
                      <SplitButton title='Lock Crosshair'   id="bg-vertical-splitbuttons-1" onClick={this.props.setCrosshair} disabled={this.props.liveRun ===1 || this.props.beam_markX===undefined || this.props.beam_markY===undefined} active={this.props.activeCrosshair}>
                        <MenuItem onClick={this.resetCROSSHAIR} disabled={this.props.liveRun ===1}> Reset <Glyphicon glyph="screenshot" /></MenuItem>
                      </SplitButton>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={background}>
                      <Button onClick={this.props.updateBackground} active={this.props.activeBkgnd} disabled={this.props.liveRun ===1}><Glyphicon glyph="picture" /> Bkgnd</Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={roi}>
                      <SplitButton title='ROI'   id="bg-vertical-splitbuttons-2" onClick={this.props.setRoi} disabled={this.props.liveRun ===1} active={this.props.activeROI}>
                      <MenuItem onClick={this.resetROI} disabled={this.props.liveRun ===1 || this.props.resetDesactivated}><Glyphicon glyph="remove" /> Reset ROI</MenuItem>
                    </SplitButton>
                    </OverlayTrigger>

                    <DropdownButton title={this.props.selectedLut} disabled={this.props.liveRun ===1} id="bg-vertical-dropdown-1">
                      <MenuItem eventKey="1" onClick={this.props.linearClicked}>Linear</MenuItem>
                      <MenuItem eventKey="2" onClick={this.props.logarithmicClicked}>Logarithmic</MenuItem>
                      <MenuItem divider />
                      <Checkbox onChange={this.props.autoscaleChecked}>Autoscale</Checkbox>
                      <Checkbox onChange={this.props.temperatureChecked}>Temperature color</Checkbox>
                    </DropdownButton>

                    {/*<OverlayTrigger placement="top" overlay={rotation}>
                      <DropdownButton id='DropdownRotate' title ='Rotate' disabled={this.props.liveRun ===1}>
                        <MenuItem onClick={()=>{this.rotation(90)}} disabled={this.props.liveRun ===1}><Glyphicon glyph="refresh" /> Rotate 90</MenuItem>
                        <MenuItem onClick={()=>{this.rotation(180)}} disabled={this.props.liveRun ===1}><Glyphicon glyph="refresh" /> Rotate 180</MenuItem>
                        <MenuItem onClick={()=>{this.rotation(270)}} disabled={this.props.liveRun ===1}><Glyphicon glyph="refresh" /> Rotate 270</MenuItem>
                      </DropdownButton>
                    </OverlayTrigger>*/}

                  </ButtonGroup>
                  </div>

              </div>
              <div className="row">
                <div className="col-md-7">
                  <Canvas ref='canvas' />
                </div>
                <div className="col-md-3">
                  <div id='graph2'>{this.props.graph_profilY}</div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div id='graph1'>{this.props.graph_profilX}</div>
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
