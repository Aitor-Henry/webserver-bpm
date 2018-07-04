//////////////////////////////////////////BUTTON////////////////////////////////////////////////////////
export function setImgDisplay(){

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/img_display_config?color_map='+state.video.temperatureCheckedBool+'&autoscale='+state.video.autoscaleCheckedBool+'&autoscale_option='+state.video.selectedLut)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }

        return response;
      }) .then(response => dispatch(update_calibration_acquire()))
         .catch(() => alert('Error, please check server console, setImgDisplay'))
  }
}


export function update_calibration_acquire(){ // In case if the user doesn't save calibration before acquisition
  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?x='+state.options.calib_x+'&y='+state.options.calib_y)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(getBeamPos())) 
         .catch(() => alert('Error, please check server console, update_calibration_acquire'))
  }
}

export function update_calibration_apply(){ // Set calibration in Bpm device

  return (dispatch,getState) => {
    const state = getState()
    //fetch('/'+state.bpmState.client_id+'/api/update_calibration?x='+state.options.calib_x+'&y='+state.options.calib_y+'&save='+0)
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?x='+state.options.calib_x+'&y='+state.options.calib_y)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(update_calibration_apply_done()))
         .catch(() => alert('Error, please check server console, update_calibration_apply'))
  }
}

/*
export function update_calibration_save(){ // Return calibration saved in Bpm device and save it in web client

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?x='+state.options.calib_x+'&y='+state.options.calib_y+'&save='+1)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(update_calibration_save_done(response)))
         .catch(() => alert('Error, please check server console, update_calibration_save'))
  }
}
*/

export function getBeamPos(){

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/get_beam_position?live='+state.options.liveCheckedBool+'&exp_t='+state.options.exposureTimeValue+'&acq_rate='+state.options.samplingRateValue)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(buttonAcquirePressed()))
         .catch(() => alert('Error,impossible to getBeamPos, please check server console'))
  }
}


export function buttonAcquirePressed(){
  return { type: 'BUTTON_ACQUIRE_PRESSED'}
}


export function update_calibration_apply_done(){
  return { type: 'UPDATE_CALIBRATION_APPLY_DONE'}
}

/*
export function update_calibration_save_done(status){
  return { type: 'UPDATE_CALIBRATION_SAVE_DONE', status}
}
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////textState/////////////////////////////////////////////////////

export function textEnterExposure(text) { //enable est le booleen passe en parametre
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

export function textEnterCalib_X(text) { //enable est le booleen passe en parametre
  return { type: "TEXT_ENTER_X", text} //On informe le reducers qu'on est dans le cas d'un text non vide et on lui passe le texte
}

export function textEmptyX() { //enable est le booleen passe en parametre
  return { type: "TEXT_EMPTY_X"} //On informe le reducers qu'on est dans le cas d'un text vide
}

export function textEnterCalib_Y(text) { //enable est le booleen passe en parametre
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
