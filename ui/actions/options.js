//////////////////////////////////////////BUTTON////////////////////////////////////////////////////////
export function setImgDisplay(){

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/img_display_config?camera_name='+state.bpmState.client_id+'&color_map='+state.video.temperatureCheckedBool+'&autoscale='+state.video.autoscaleCheckedBool+'&autoscale_option='+state.video.selectedLut)
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
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?camera_name='+state.bpmState.client_id+'&x='+state.options.calib_x+'&y='+state.options.calib_y)
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
    fetch('/'+state.bpmState.client_id+'/api/update_calibration?camera_name='+state.bpmState.client_id+'&x='+state.options.calib_x+'&y='+state.options.calib_y)
      .then((response) => {
        if(!response.ok){
          throw Error(response.statusText);
        }
        return response;
      }) .then(response => dispatch(update_calibration_apply_done()))
         .catch(() => alert('Error, please check server console, update_calibration_apply'))
  }
}


export function getBeamPos(){

  return (dispatch,getState) => {
    const state = getState()
    fetch('/'+state.bpmState.client_id+'/api/get_beam_position?camera_name='+state.bpmState.client_id+'&live='+state.options.liveCheckedBool+'&exp_t='+state.options.exposureTimeValue+'&acq_rate='+state.options.samplingRateValue)
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

////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////textState/////////////////////////////////////////////////////

export function textEnterExposure(text) { 
  return { type: "TEXT_ENTER_EXPOSURE", text}
}

export function textEnterSampling(text) {
  return { type: "TEXT_ENTER_SAMPLING", text}
}

export function textEmptyExposure() {
  return { type: "TEXT_EMPTY_EXPOSURE"}
}

export function textEmptySampling() {
  return { type: "TEXT_EMPTY_SAMPLING"}
}

export function textEnterCalib_X(text) {
  return { type: "TEXT_ENTER_X", text}
}

export function textEmptyX() {
  return { type: "TEXT_EMPTY_X"}
}

export function textEnterCalib_Y(text) {
  return { type: "TEXT_ENTER_Y", text}
}

export function textEmptyY() {
  return { type: "TEXT_EMPTY_Y"}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////checkbox////////////////////////////////////////////////////////
export function liveChecked() {
  return { type: "LIVE_CHECKED"}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
