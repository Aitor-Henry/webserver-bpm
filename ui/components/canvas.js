import React from 'react';
import ReactDom from 'react-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {setBeamMark,setROIMark,setPrevROIMark,setROI,updateDimensions, resetCrosshair} from '../actions/canvas.js'
import {updateBackground} from '../actions/video.js'
import {setImgDisplay} from '../actions/options.js'


class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.updateImage=this.updateImage.bind(this);
    this.image = new Image();
    this.draw_Beam_Marker = this.draw_Beam_Marker.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.draw_ROI_Marker = this.draw_ROI_Marker.bind(this);
    this.drawing = false;
    this.updateDimensions = this.updateDimensions.bind(this);
    
  }

  componentDidMount(){
    window.addEventListener("resize", this.updateDimensions());
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions());
  }

  componentDidUpdate(prevProps){
    if(prevProps!=this.props){
      this.updateImage(prevProps);
    }
  }
  


  updateImage(prevProps){
    const ctx = this.refs.myCanvas.getContext('2d');
    this.image.src = "data:image/jpg;base64,"+this.props.imageSrc;
    
    this.image.onload = () => {

      if(this.props.rotation === 90 || this.props.rotation === 270){
        ctx.translate(this.props.windowWidth/2,this.props.windowHeight/2);
        ctx.rotate(this.props.rotation * Math.PI / 180);
        ctx.drawImage(this.image, -this.props.windowHeight/2, -this.props.windowWidth/2,this.props.windowHeight,this.props.windowWidth);
      }
      else if(this.props.rotation === 180){
        ctx.translate(this.props.windowWidth/2,this.props.windowHeight/2);
        ctx.rotate(this.props.rotation * Math.PI / 180);
        ctx.drawImage(this.image, -this.props.windowWidth/2, -this.props.windowHeight/2,this.props.windowWidth,this.props.windowHeight);
      }
      else{
        ctx.drawImage(this.image, 0, 0,this.props.windowWidth,this.props.windowHeight);
      }
      if(this.props.beam_markX != undefined && this.props.beam_markY != undefined && !this.props.activeROI && this.props.rotation === 0){
        if(this.props.temperatureCheckedBool===1){
          ctx.strokeStyle = "#ffffff" // white cross
        }else{
          ctx.strokeStyle = "#ef0000" //red cross for beamlock, no color map
        }
        ctx.font = '15px Arial'
        ctx.fillStyle = "#ef0000" 
        ctx.beginPath();
        ctx.moveTo(0, this.props.beam_markY*this.props.windowHeight/this.props.imageMaxHeight);
        ctx.lineTo(this.props.windowWidth, this.props.beam_markY*this.props.windowHeight/this.props.imageMaxHeight);
        ctx.stroke();
        ctx.moveTo(this.props.beam_markX*this.props.windowWidth/this.props.imageMaxWidth, 0);
        ctx.lineTo(this.props.beam_markX*this.props.windowWidth/this.props.imageMaxWidth, this.props.windowHeight);
        ctx.stroke();
        ctx.font = '10px Arial'
        ctx.strokeText("x="+Math.round(this.props.beam_markX*this.props.calib_x)+", y="+Math.round(this.props.beam_markY*this.props.calib_y),(this.props.beam_markX*this.props.windowWidth/this.props.imageMaxWidth)+5, (this.props.beam_markY*this.props.windowHeight/this.props.imageMaxHeight)-5);
        ctx.strokeText("I="+this.props.intensityXY,(this.props.beam_markX*this.props.windowWidth/this.props.imageMaxWidth)+5, (this.props.beam_markY*this.props.windowHeight/this.props.imageMaxHeight)+10)
        ctx.closePath();
      } else {
        if(this.props.beam_markX != undefined && this.props.beam_markY != undefined){ // in order to execute it only once, 
          this.props.resetCrosshair();                                                //not everytime image is updated which will trigger webserver and tango device.
        }
      }
      if(this.props.start_X != undefined && this.props.start_Y != undefined && this.props.rotation===0){
        this.draw_ROI_Marker()
      }
      if(this.props.bx>0 && this.props.by>0 && this.props.rotation===0 && this.props.calib_x===prevProps.calib_x && this.props.calib_y===prevProps.calib_y){ // draw cross on point (x,y) found by bpm
        if(this.props.temperatureCheckedBool===1){
          // in case of colors the green cross won't be visible on green areas.
          ctx.strokeStyle = "#000000"
        }else{
          ctx.strokeStyle = "#00ff00" //green
        }
        ctx.font = '15px Arial'
        ctx.fillStyle = "#00ff00"
        ctx.beginPath();
        ctx.moveTo(0, (this.props.by/this.props.calib_y)*this.props.windowHeight/this.props.imageMaxHeight);
        ctx.lineTo(this.props.windowWidth, (this.props.by/this.props.calib_y)*this.props.windowHeight/this.props.imageMaxHeight);
        ctx.stroke();
        ctx.moveTo((this.props.bx/this.props.calib_x)*this.props.windowWidth/this.props.imageMaxWidth, 0);
        ctx.lineTo((this.props.bx/this.props.calib_x)*this.props.windowWidth/this.props.imageMaxWidth, this.props.windowHeight);
        ctx.stroke();
        ctx.closePath();
      }
      this.image.src=""; // Might avoid caching image.
    }
    
  }

  handleMouseDown(e){
    if(this.props.activeROI){
      this.refs.myCanvas.style.cursor = "crosshair"
      this.drawing = true;
      this.props.setROIMark(e.nativeEvent.offsetX,e.nativeEvent.offsetY)
    }
  }

  handleMouseMove(e){
   if(this.props.activeROI && this.drawing === true){
       if(this.props.start_X != undefined && this.props.start_Y != undefined && this.props.prevY != undefined && this.props.prevY != undefined ){
         this.props.setPrevROIMark(e.nativeEvent.offsetX,e.nativeEvent.offsetY,(e.nativeEvent.offsetX - this.props.start_X),(e.nativeEvent.offsetY - this.props.start_Y));
      }
    }
  }

  draw_ROI_Marker(){
   if(this.props.activeROI){
     const ctx = this.refs.myCanvas.getContext('2d');
     ctx.strokeStyle = "blue";
     ctx.beginPath();
     ctx.rect(this.props.start_X + 0.5, this.props.start_Y + 0.5,  this.props.prevX - this.props.start_X, this.props.prevY - this.start_Y);
     ctx.rect(this.props.start_X + 0.5, this.props.start_Y + 0.5,  this.props.prevX - this.props.start_X, this.props.prevY - this.props.start_Y);
     ctx.stroke();
     ctx.closePath();
   }
  }

  draw_Beam_Marker(e){
    const ctx = this.refs.myCanvas.getContext('2d');
    

    if(!this.props.activeROI){
      if(e != undefined){
        if((this.props.beam_markX != e.nativeEvent.offsetX*this.props.imageMaxWidth/this.props.windowWidth || this.props.beam_markY != e.nativeEvent.offsetY*this.props.imageMaxHeight/this.props.windowHeight) && this.props.crosshair === 0 && this.props.rotation===0){ 
          this.props.setBeamMark(Math.round(e.nativeEvent.offsetX*this.props.imageMaxWidth/this.props.windowWidth),Math.round(e.nativeEvent.offsetY*this.props.imageMaxHeight/this.props.windowHeight));
        }
      } 
    }
      else if(this.props.activeROI){
        this.drawing = false;
        this.refs.myCanvas.style.cursor = "default";
        this.props.setROI();
        if(this.props.activeBkgnd===true){ //if there is a bkg before ROI, then we need to reset it because of changes in dimensions.
          this.props.updateBackground();
        }
        this.props.setImgDisplay();
      }
  }


  updateDimensions(){
    this.props.updateDimensions(window.innerWidth,window.innerHeight);
  }

  render(){
    return <canvas ref="myCanvas" width={this.props.windowWidth} height={this.props.windowHeight} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} onMouseUp={this.draw_Beam_Marker} style={{'verticalAlign': 'middle', background:'#EFEFEF'}} />
  }
}


function mapStateToProps(state) {
  return {
    beam_markX:state.canvas.beam_markX,
    beam_markY:state.canvas.beam_markY,
    crosshair:state.video.crosshair,
    intensity:state.canvas.intensity,
    activeROI:state.video.activeROI,
    start_X:state.canvas.start_X,
    start_Y:state.canvas.start_Y,
    prevX:state.canvas.prevX,
    prevY:state.canvas.prevY,
    imageMaxWidth:state.canvas.imageMaxWidth,
    imageMaxHeight:state.canvas.imageMaxHeight,
    rotation:state.video.rotation,
    windowWidth:state.canvas.windowWidth,
    windowHeight:state.canvas.windowHeight,

    liveRun:state.options.liveRun,
    acqImage:state.options.acqImage,
    intensityXY:state.canvas.intensityXY,
    bx:state.canvas.bx,
    by:state.canvas.by,
    calib_x:state.options.calib_x,
    calib_y:state.options.calib_y,
    imageSrc:state.canvas.imageSrc,
    activeBkgnd: state.video.activeBkgnd,
    temperatureCheckedBool:state.video.temperatureCheckedBool,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setBeamMark : bindActionCreators(setBeamMark, dispatch),
    setROIMark : bindActionCreators(setROIMark, dispatch),
    setPrevROIMark : bindActionCreators(setPrevROIMark, dispatch),
    setROI: bindActionCreators(setROI, dispatch),
    updateDimensions:bindActionCreators(updateDimensions, dispatch),
    resetCrosshair: bindActionCreators(resetCrosshair, dispatch),
    updateBackground: bindActionCreators(updateBackground,dispatch),
    setImgDisplay:bindActionCreators(setImgDisplay,dispatch),
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(Canvas);
