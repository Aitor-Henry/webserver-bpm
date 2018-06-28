//////////////////////////////////////////BUTTON////////////////////////////////////////////////////////

export function linearClicked(){
  return { type: 'LINEAR_CLICKED'}
}

export function logarithmicClicked(){
  return { type: 'LOGARITHMIC_CLICKED'}
}

export function updateBackground(){

    return (dispatch,getState) => {
      const state = getState()
      fetch('/'+state.bpmState.client_id+'/api/set_background?set='+state.video.set)
        .then((response) => {
          if(!response.ok){
            throw Error(response.statusText);
          }
          return response;
        }) .then(response => dispatch(backgroundState()))
           .catch(() => alert('Error, please check server console, updateBackground'))
    }
}

export function backgroundState(){
  return { type: 'BACKGROUND_STATE'}
}

export function setCrosshair(){
  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/lock_beam_mark?x='+Math.round((state.canvas.beam_markX*state.canvas.imageMaxWidth/state.canvas.windowWidth)*1)/1+'&y='+Math.round((state.canvas.beam_markY*state.canvas.imageMaxHeight/state.canvas.windowHeight)*1)/1)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(setCrosshairDone())) //Si on a une reponse du server on execute getBeamPos
         .catch(() => alert('Problem to set BeamMark, check console server'))//Sinon il ya un probleme
  }

}



export function setCrosshairDone(){
  return { type: 'SET_CROSSHAIR'}
}

export function setRoi(){
  return { type: 'SET_ROI'}
}

export function rotation(rotation){
  return { type: 'ROTATION',rotation}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////checkbox//////////////////////////////////////////////////////
export function liveChecked() { //enable est le booleen passe en parametre
  return { type: "LIVE_CHECKED"} //On informe le reducers qu'on est dans le cas d'un text vide
}

export function autoscaleChecked(){
  return { type:"AUTOSCALE_CHECKED"}
}

export function temperatureChecked(){
  return { type:"TEMPERATURE_CHECKED"}
}

export function yChecked(){
  return { type:"Y_CHECKED"}
}

////////////////////////////////////////////TEXT/////////////////////////////////////////////////////////
export function textEnterMax(text) { //enable est le booleen passe en parametre
  return { type: "TEXT_ENTER_MAX", text} //On informe le reducers qu'on est dans le cas d'un text non vide et on lui passe le texte
}

export function textEmptyMax() { //enable est le booleen passe en parametre
  return { type: "TEXT_EMPTY_MAX"} //On informe le reducers qu'on est dans le cas d'un text vide
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
