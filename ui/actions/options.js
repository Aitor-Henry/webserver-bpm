//////////////////////////////////////////BUTTON////////////////////////////////////////////////////////
export function setImgDisplay(){ //actions qui va definir si les options temperature,autoscale et lut sont selectionne

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/img_display_config?color_map='+state.video.temperatureCheckedBool+'&autoscale='+state.video.autoscaleCheckedBool+'&autoscale_option='+state.video.selectedLut)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }

        return response;
      }) .then(response => dispatch(update_calibration_acquire())) //Si on a une reponse du server on execute getBeamPos
         .catch(() => alert('Error, please check server console, setImgDisplay'))//Sinon il ya un probleme
  }
}


export function update_calibration_acquire(){ //actions qui va definir si les options temperature,autoscale et lut sont selectionne

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?x='+state.options.Xvalue+'&y='+state.options.Yvalue+'&save='+state.options.saveValue)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(getBeamPos())) //Si on a une reponse du server on execute getBeamPos
         .catch(() => alert('Error, please check server console, update_calibration_acquire'))//Sinon il ya un probleme
  }
}

export function update_calibration_apply(){ //actions qui va etre appeler des quon clique sur apply (differentre de update_calibration car elle nappelle pas getBeamPos)

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?x='+state.options.Xvalue+'&y='+state.options.Yvalue+'&save='+0)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(update_calibration_apply_done())) //Si on a une reponse du server on execute getBeamPos
         .catch(() => alert('Error, please check server console, update_calibration_apply'))//Sinon il ya un probleme
  }
}

export function update_calibration_save(){ //actions qui va etre appeler des quon clique sur apply (differentre de update_calibration car elle nappelle pas getBeamPos)

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?x='+state.options.Xvalue+'&y='+state.options.Yvalue+'&save='+0)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(update_calibration_save_done())) //Si on a une reponse du server on execute getBeamPos
         .catch(() => alert('Error, please check server console, update_calibration_save'))//Sinon il ya un probleme
  }
}


export function getBeamPos(){ //actions qui va revoyer les infos des images de la cam

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/get_beam_position?live='+state.options.liveCheckedBool+'&exp_t='+state.options.exposureTimeValue+'&acq_rate='+state.options.samplingRateValue)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        //console.log("response",response)
        return response;
      }) .then(response => dispatch(buttonAcquirePressed()))
         .catch(() => alert('Error,impossible to getBeamPos, please check server console'))
  }
}


export function buttonAcquirePressed(){
  return { type: 'BUTTON_ACQUIRE_PRESSED'}
}


export function update_calibration_apply_done(){ //On informe le reducer qu'on a applique de nouveau parametre, il faut donc remettre save a 0
  return { type: 'UPDATE_CALIBRATION_APPLY_DONE'}
}

export function update_calibration_save_done(){ //On informe le reducer qu'on a applique de nouveau parametre, il faut donc remettre save a 1
  return { type: 'UPDATE_CALIBRATION_SAVE_DONE'}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////textState//////////////////////////////////////////////////////// was in actions/options.js

export function textEnterExposure(text) { //enable est le booleen passe en parametre
  console.log("exp_t : ", text)
  return { type: "TEXT_ENTER_EXPOSURE", text} //On informe le reducers qu'on est dans le cas d'un text non vide et on lui passe le texte
}

export function textEnterSampling(text) { //enable est le booleen passe en parametre
  return { type: "TEXT_ENTER_SAMPLING", text} //On informe le reducers qu'on est dans le cas d'un text non vide et on lui passe le texte
}

export function textEmptyExposure() { //enable est le booleen passe en parametre
  return { type: "TEXT_EMPTY_EXPOSURE"} //On informe le reducers qu'on est dans le cas d'un text vide
}

export function textEmptySampling() { //enable est le booleen passe en parametre
  return { type: "TEXT_EMPTY_SAMPLING"} //On informe le reducers qu'on est dans le cas d'un text vide
}

export function textEnterX(text) { //enable est le booleen passe en parametre
  return { type: "TEXT_ENTER_X", text} //On informe le reducers qu'on est dans le cas d'un text non vide et on lui passe le texte
}

export function textEmptyX() { //enable est le booleen passe en parametre
  return { type: "TEXT_EMPTY_X"} //On informe le reducers qu'on est dans le cas d'un text vide
}

export function textEnterY(text) { //enable est le booleen passe en parametre
  return { type: "TEXT_ENTER_Y", text} //On informe le reducers qu'on est dans le cas d'un text non vide et on lui passe le texte
}

export function textEmptyY() { //enable est le booleen passe en parametre
  return { type: "TEXT_EMPTY_Y"} //On informe le reducers qu'on est dans le cas d'un text vide
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////checkbox////////////////////////////////////////////////////////
export function liveChecked() { //enable est le booleen passe en parametre
  return { type: "LIVE_CHECKED"} //On informe le reducers qu'on est dans le cas d'un text vide
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
