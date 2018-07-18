
export function updateData(data){
  return { type: 'UPDATE_DATA',data}
}


export function setROIMark(X,Y){
  return { type: 'SET_ROI_MARK',X,Y}
}

export function setPrevROIMark(X,Y,W,H){
  return { type: 'SET_PREV_ROI_MARK',X,Y,W,H}
}


export function setROI(){

  return (dispatch,getState) => {
    const state = getState()
    if(state.canvas.start_X<0 || state.canvas.start_Y <0 || state.canvas.width<0 || state.canvas.height<0){
      alert('Problem to set ROI, you have to select your roi from the top left corner and go to the the bottom right corner, H and W can\'t be negative');
      return (dispatch) => {dispatch(setROIDone());}
    } else {
      fetch('/'+state.bpmState.client_id+'/api/set_roi?x='+Math.round((state.canvas.start_X*state.canvas.imageMaxWidth/state.canvas.windowWidth)*1)/1+'&y='+Math.round((state.canvas.start_Y*state.canvas.imageMaxHeight/state.canvas.windowHeight)*1)/1+'&w='+Math.round((state.canvas.width*state.canvas.imageMaxWidth/state.canvas.windowWidth)*1)/1+'&h='+Math.round((state.canvas.height*state.canvas.imageMaxHeight/state.canvas.windowHeight)*1)/1)
        .then((response) => {
          if(!response.ok){
            throw Error(response.statusText);
          }
          return response;
        }) .then(response => dispatch(setROIDone()))
          .catch(() => alert('Problem to set ROI, check console server'))
      }
  }
  
}


export function setROIDone(){
  return { type: 'SET_ROI_DONE'}
}

export function hideAlert(){
  return { type: 'HIDE_ALERT'}
}

export function resetRoi(){

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/set_roi?x='+0+'&y='+0+'&w='+0+'&h='+0)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(resetROIDone()))
         .catch(() => alert('Problem to reset ROI, check console server'))
  }
}

export function resetROIDone(){
  return { type: 'RESET_ROI_DONE'}
}


export function resetCrosshair(){

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/lock_beam_mark?x='+0+'&y='+0)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(resetCrosshairDone())) 
         .catch(() => alert('Problem to reset BeamMark, check console server'))
  }

}

export function resetCrosshairDone(){
  return { type: 'RESET_CROSSHAIR'}
}


export function setBeamMark(X,Y){

  return (dispatch,getState) => {
    const state = getState()
      fetch('/'+state.bpmState.client_id+'/api/get_intensity?x='+X+'&y='+Y)
        .then((response) => {
          if(!response.ok){
            throw Error(response.statusText);
          }
          return response;
        }).then(response => response.json())
          .then(response => dispatch(setBeamMarkDone(X,Y,response)))
          .catch(() => alert('Problem to set ROI, check console server'))
  }
  
}

export function setBeamMarkDone(X,Y,status){
  return { type: 'SET_BEAM_MARK',X,Y,status}
}

export function getStatus(windowWidth,windowHeight){
  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/get_status?')
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => response.json())
         .then(response => dispatch(getStatusDone(response,windowWidth,windowHeight)))
         .catch(() => alert('Problem to get status, check console server'))
  }
}

export function getStatusDone(status,windowWidth,windowHeight){
  return { type: 'GET_STATUS_DONE',status,windowWidth,windowHeight}
}

export function updateDimensions(windowWidth,windowHeight){
  return { type: 'UPDATE_DIMENSIONS',windowWidth,windowHeight}
}

export function switchDimensions(windowWidth,windowHeight){
  return { type: 'SWITCH_DIMENSIONS',windowWidth,windowHeight}
}

