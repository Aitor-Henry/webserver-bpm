import React from 'react';
import ReactDom from 'react-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {updateData,setBeamMark,setROIMark,setPrevROIMark,setROI,updateDimensions, resetCrosshair} from '../actions/canvas.js'
import {updateBackground} from '../actions/video.js'


class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.img_socket = null;
    this.registerChannel = this.registerChannel.bind(this);
    this.updateImage=this.updateImage.bind(this);
    this.image = new Image();
    this.updateData = this.updateData.bind(this);
    this.draw_Beam_Marker = this.draw_Beam_Marker.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.draw_ROI_Marker = this.draw_ROI_Marker.bind(this);
    this.drawing = false;
    this.liveState = false;

  }

  componentWillReceiveProps(nextProps){
    if(nextProps.acqImage==0 && nextProps.liveRun==0){
      if(this.liveState==true){
        this.liveState=false
      }
      this.registerChannel();
    } else if((nextProps.acqImage!=0 || nextProps.liveRun!=0) && (nextProps.acqImage!=this.props.acqImage || nextProps.liveRun!=0)){
      if(nextProps.liveRun===1){
        this.liveState=true;
      } else {
        this.liveState=false;
      }
      if(nextProps.liveRun==1 && this.props.liveRun==1){
      } else {
        this.Askimage();
      }      
    };
    
  }

  componentDidMount(){
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentDidUpdate(nextProps){
    if((nextProps.acqImage!=0 || nextProps.liveRun!=0) || (this.props.beam_markX!=nextProps.beam_markX && this.props.beam_markY!=nextProps.beam_markY) || (this.props.rotation!=nextProps.rotation)){
      console.log("COMPONENTDIDUPDATE")
      this.updateImage(nextProps);
    }
    
    
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
    
  



  updateImage(nextProps){
    const ctx = this.refs.myCanvas.getContext('2d');
    let src = this.props.imageSrc;

    this.image.onload = () => {
      ctx.save();

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
        ctx.strokeStyle = "#ef0000" //red, cross for beamlock
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
      if(this.props.bx>0 && this.props.by>0 && this.props.rotation===0 && this.props.calib_x===nextProps.calib_x && this.props.calib_y===nextProps.calib_y){ // draw green cross on point (x,y) found by bpm
        ctx.strokeStyle = "#00ff00" //green
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
      ctx.restore();
    }
    if(this.liveState === true){
      this.closeSocket();
    }
    this.image.src = "data:image/jpg;base64,"+src;
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
      }
  }



  updateData(data){
    this.props.updateData(data);
  }

  updateDimensions(){
    this.props.updateDimensions(window.innerWidth,window.innerHeight);
  }

  registerChannel(){
    if (this.img_socket === null) {
      let ws_address;
      if (window.location.port != "") {
        ws_address = "ws://"+window.location.hostname+":"+window.location.port+"/"+this.props.client_id+"/api/image_channel";
      } else {
        ws_address = "ws://"+window.location.hostname+"/"+this.props.client_id+"/api/image_channel";
      }

      this.img_socket = new WebSocket(ws_address);
      if(this.liveState==true){
        this.img_socket.onopen = () => {
          this.Askimage();
        };
        
      }
    }
  }

  closeSocket(){  
    if(this.img_socket != null){
      this.img_socket.close();
      this.img_socket = null;
      this.registerChannel();
    }
  }
  
  Askimage(){    
    if (this.img_socket != null){
      if(this.props.beam_markY!=undefined && this.props.beam_markX!=undefined){
        this.img_socket.send([this.props.beam_markX,this.props.beam_markY,this.props.client_id]);
      }else{
        this.img_socket.send([false,this.props.client_id]);
      }
    }
    this.img_socket.onmessage = (packed_msg) => {
      this.updateData(JSON.parse(packed_msg.data));
    }
  }



  render(){
    return <canvas ref="myCanvas" width={this.props.windowWidth} height={this.props.windowHeight} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} onMouseUp={this.draw_Beam_Marker} style={{'verticalAlign': 'middle', background:'#EFEFEF'}} />
  }
}


function mapStateToProps(state) {
  return {
    img_num: state.canvas.img_num,
    client_id: state.bpmState.client_id,
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
    imageRatio:state.canvas.imageRatio,

    liveRun:state.options.liveRun,
    acqImage:state.options.acqImage,
    exp_t:state.options.exposureTimeValue,
    intensityXY:state.canvas.intensityXY,
    bx:state.canvas.bx,
    by:state.canvas.by,
    calib_x:state.options.calib_x,
    calib_y:state.options.calib_y,
    imageSrc:state.canvas.imageSrc,
    activeBkgnd: state.video.activeBkgnd,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateData : bindActionCreators(updateData, dispatch),
    setBeamMark : bindActionCreators(setBeamMark, dispatch),
    setROIMark : bindActionCreators(setROIMark, dispatch),
    setPrevROIMark : bindActionCreators(setPrevROIMark, dispatch),
    setROI: bindActionCreators(setROI, dispatch),
    updateDimensions:bindActionCreators(updateDimensions, dispatch),
    resetCrosshair: bindActionCreators(resetCrosshair, dispatch),
    updateBackground: bindActionCreators(updateBackground,dispatch),
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(Canvas);
