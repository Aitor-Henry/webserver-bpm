import React from 'react';
import ReactDom from 'react-dom'
import { connect } from 'react-redux';
{/*import { Image } from 'react-bootstrap';*/}
import { bindActionCreators } from 'redux';
import {updateData,setBeamMark,setROIMark,setPrevROIMark,setROI,updateDimensions, resetCrosshair} from '../actions/canvas.js'




class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = { imageSrc: "" };
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

  componentDidUpdate(nextProps){ //called when imageSrc is updated
    if((nextProps.acqImage!=0 || nextProps.liveRun!=0) || (this.props.beam_markX!=nextProps.beam_markX && this.props.beam_markY!=nextProps.beam_markY) || (this.props.rotation!=nextProps.rotation)){
      this.updateImage(nextProps);
    }
    
    
  }

  componentWillUnmount(){ //On ferme la socket dont on a recupere la src puis on en ouvre une nouvelle pour les prochaines images
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
    
  



  updateImage(nextProps){
    const ctx = this.refs.myCanvas.getContext('2d');
    let src = this.state.imageSrc;

    this.image.onload = () => {
      ctx.save();
      //ctx.clearRect(0,0,this.refs.myCanvas.width,this.refs.myCanvas.height)

      if(this.props.rotation === 90 || this.props.rotation === 270){ //Si il y a une rotation on change de repere on dessine et on revient dans le repere initial
        ctx.translate(this.props.windowWidth/2,this.props.windowHeight/2);
        ctx.rotate(this.props.rotation * Math.PI / 180);
        ctx.drawImage(this.image, -this.props.windowHeight/2, -this.props.windowWidth/2,this.props.windowHeight,this.props.windowWidth); //On dessine l'image
      }
      else if(this.props.rotation === 180){
        ctx.translate(this.props.windowWidth/2,this.props.windowHeight/2);
        ctx.rotate(this.props.rotation * Math.PI / 180);
        ctx.drawImage(this.image, -this.props.windowWidth/2, -this.props.windowHeight/2,this.props.windowWidth,this.props.windowHeight); //On dessine l'image
      }
      else{ //sinon on dessine juste l'image
        ctx.drawImage(this.image, 0, 0,this.props.windowWidth,this.props.windowHeight); //On dessine l'image
      }
      if(this.props.beam_markX != undefined && this.props.beam_markY != undefined && !this.props.activeROI && this.props.rotation === 0){
        ctx.strokeStyle = "#ef0000" //red
        ctx.font = '15px Arial'
        ctx.fillStyle = "#ef0000" 
        ctx.beginPath();
        ctx.moveTo(0, this.props.beam_markY*this.props.windowHeight/this.props.imageMaxHeight);
        ctx.lineTo(this.props.windowWidth, this.props.beam_markY*this.props.windowHeight/this.props.imageMaxHeight);
        ctx.stroke();
        ctx.moveTo(this.props.beam_markX*this.props.windowWidth/this.props.imageMaxWidth, 0);
        ctx.lineTo(this.props.beam_markX*this.props.windowWidth/this.props.imageMaxWidth, this.props.windowHeight);
        ctx.stroke();
        ctx.closePath();
      } else {
        if(this.props.beam_markX != undefined && this.props.beam_markY != undefined){ // in order to execute it only once, 
          this.props.resetCrosshair();                                                //not everytime image is updated which will trigger webserver and tango device.
        }
      }
      if(this.props.start_X != undefined && this.props.start_Y != undefined && this.props.rotation===0){
        this.draw_ROI_Marker()
      }
      ctx.restore();
    }
    if(this.liveState === true){
      this.closeSocket();
    }
    this.image.src = "data:image/jpg;base64,"+src;
    //this.state.imageSrc = "";
  }

  handleMouseDown(e){
    if(this.props.activeROI){
      console.log('Mousedown')
      this.refs.myCanvas.style.cursor = "crosshair"
      this.drawing = true;
      //this.props.setROIMark(e.nativeEvent.offsetX - this.refs.myCanvas.offsetLeft,e.nativeEvent.offsetY - this.refs.myCanvas.offsetTop)
      this.props.setROIMark(e.nativeEvent.offsetX,e.nativeEvent.offsetY)
    }
  }


  handleMouseMove(e){
   if(this.props.activeROI && this.drawing === true){
       if(this.props.start_X != undefined && this.props.start_Y != undefined && this.props.prevY != undefined && this.props.prevY != undefined ){
         this.props.setPrevROIMark(e.nativeEvent.offsetX,e.nativeEvent.offsetY,(e.nativeEvent.offsetX - this.props.start_X),(e.nativeEvent.offsetY - this.props.start_Y)); //Permet de definir les coordonne du point de la souris et la width et height du rectangle
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
    

    if(!this.props.activeROI){//On dessine que si l'utilisateur est pas en train de roi
      if(e != undefined){ //Quand on clique sur l'image
        if((this.props.beam_markX != e.nativeEvent.offsetX*this.props.imageMaxWidth/this.props.windowWidth || this.props.beam_markY != e.nativeEvent.offsetY*this.props.imageMaxHeight/this.props.windowHeight) && this.props.crosshair === 0 && this.props.rotation===0){ 
          this.props.setBeamMark(Math.round(e.nativeEvent.offsetX*this.props.imageMaxWidth/this.props.windowWidth),Math.round(e.nativeEvent.offsetY*this.props.imageMaxHeight/this.props.windowHeight));
        }
      } 
    }
      else if(this.props.activeROI){
        this.drawing = false;
        this.refs.myCanvas.style.cursor = "default";
        this.props.setROI(); //On envoi au serveur le roi etablie
      }
  }



  updateData(data){
    this.props.updateData(data);
  }

  updateDimensions(){
    this.props.updateDimensions(window.innerWidth,window.innerHeight);
  }

  registerChannel(){
    if (this.img_socket === null) { //Si une socket n'est pas deja active
      let ws_address;
      if (window.location.port != "") {
        ws_address = "ws://"+window.location.hostname+":"+window.location.port+"/"+this.props.client_id+"/api/image_channel"; //"ws://localhost:8066/api/image_channel";
      } else {
        ws_address = "ws://"+window.location.hostname+"/"+this.props.client_id+"/api/image_channel"; //"ws://"+window.location.hostname+"/api/image_channel"
      }

      this.img_socket = new WebSocket(ws_address); //on creer la socket
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
      this.img_socket.send(this.props.client_id);
    }
    this.img_socket.onmessage = (packed_msg) => { //des que la socket recoit un message du serveur (elle reste en attente sinon )
      this.setState({imageSrc: JSON.parse(packed_msg.data).jpegData}); //On met a jour la source d limg qui corrspond a la derniere image recu
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
  };
}

function mapDispatchToProps(dispatch) { //On rend les actions accessible a notre object react
  return {
    updateData : bindActionCreators(updateData, dispatch),
    setBeamMark : bindActionCreators(setBeamMark, dispatch),
    setROIMark : bindActionCreators(setROIMark, dispatch),
    setPrevROIMark : bindActionCreators(setPrevROIMark, dispatch),
    setROI: bindActionCreators(setROI, dispatch),
    updateDimensions:bindActionCreators(updateDimensions, dispatch),

    resetCrosshair: bindActionCreators(resetCrosshair, dispatch),
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(Canvas);
