const initialState = {
  buttonAcquireStyle : 'success',
  buttonAcquireGlyphiconText : "play",
  buttonAcquireText : "Acquire",
  exposureTimeValue: 0.01,
  samplingRateValue: 10,
  liveCheckedBool: 0,
  liveSet: 0,
  liveRun: 0,
  acqImage: 0,
  calib_x: 1,
  calib_y: 1,
  applyDisabled : false,
  saveDisabled : false,
  minExposureTime : 0,
  maxExposureTime : 0,
  minLatencyTime : 0,
  maxLatencyTime : 0,
};



export default function options(state = initialState, action) {
  
  switch (action.type) {
    
    case 'GET_STATUS_DONE':
    {
      return Object.assign({}, state, {minExposureTime:action.status.min_exposure_time, maxExposureTime:action.status.max_exposure_time, minLatencyTime:action.status.min_latency_time, maxLatencyTime:action.status.max_latency_time,liveCheckedBool:Number(action.status.live), exposureTimeValue:action.status.exposure_time, samplingRateValue:action.status.acq_rate , calib_x:action.status.calib_x, calib_y:action.status.calib_y})
    }

    case 'BUTTON_ACQUIRE_PRESSED':
    {
      if(state.buttonAcquireStyle === 'success' && state.liveCheckedBool == 1){ // User start a live mode
        return Object.assign({}, state, {buttonAcquireStyle:'danger',buttonAcquireText:"Stop",buttonAcquireGlyphiconText:"stop",liveCheckedBool: 0, liveRun:1, acqImage: 0})
      }
      else if(state.buttonAcquireStyle === 'danger' && state.liveCheckedBool == 0){ // User stop live mode
        return Object.assign({}, state, {buttonAcquireStyle:'success',buttonAcquireText:"Acquire",buttonAcquireGlyphiconText:"play", liveSet: 0, liveRun: 0, acqImage: 0})
      }
      else { // User start an acquisition of one frame
        return Object.assign({}, state, {buttonAcquireStyle:'success',buttonAcquireText:"Acquire",buttonAcquireGlyphiconText:"play", acqImage: state.acqImage+1, liveRun: 0})
      }

    }

    case 'LIVE_CHECKED':
    {
      if(state.liveCheckedBool == 0){
        return Object.assign({}, state, {liveCheckedBool : 1, liveSet: 1})
      }
      else{
        return Object.assign({}, state, {liveCheckedBool : 0, liveSet : 0})
      }

    }


    case 'TEXT_ENTER_EXPOSURE':
    {
      return Object.assign({}, state, {exposureTimeValue:action.text})
    }

    case 'TEXT_ENTER_SAMPLING':
    {
      return Object.assign({}, state, {samplingRateValue:action.text})
    }

    case 'TEXT_EMPTY_EXPOSURE':
    {
      return Object.assign({}, state, {exposureTimeValue:""})
    }

    case 'TEXT_EMPTY_SAMPLING':
    {
      alert("Acquisition rate can't be null or can't be lower than exposure time. Reminder : Hz = 1/s");
      return Object.assign({}, state, {samplingRateValue:""})
    }

    case 'TEXT_ENTER_X':
    {
      if(state.calib_y === ""){
        return Object.assign({}, state, {calib_x:action.text,applyDisabled:true,saveDisabled:true})
      }
      else{
        return Object.assign({}, state, {calib_x:action.text,applyDisabled:false,saveDisabled:false})
      }
    }

    case 'TEXT_EMPTY_X':
    {
      return Object.assign({}, state, {calib_x:"",applyDisabled:true,saveDisabled:true})
    }

    case 'TEXT_ENTER_Y':
    {
      if(state.calib_x === ""){
        return Object.assign({}, state, {calib_y:action.text,applyDisabled:true,saveDisabled:true})
      }
      else{
        return Object.assign({}, state, {calib_y:action.text,applyDisabled:false,saveDisabled:false})
      }

    }

    case 'TEXT_EMPTY_Y':
    {
      return Object.assign({}, state, {calib_y:"",applyDisabled:true,saveDisabled:true})
    }

    case 'LATENCY_NOT_IN_RANGE':
    {
      alert("You try to create a latency time ((1/AcquisitonRate)-ExposureTime) not in range with the specs of the camera, this value should be in range of ["+state.minLatencyTime+","+state.maxLatencyTime+"]. For further questions call Laurent CLAUTRE (2912). "); 
      return Object.assign({}, state, {samplingRateValue:""});
    }

    case 'EXPOSURE_TIME_NOT_IN_RANGE':
    {
      alert("You try to create a exposure time not in range with the specs of the camera, this value should be in range of ["+state.minExposureTime+","+state.maxExposureTime+"]. For further questions call Laurent CLAUTRE (2912).");
      return Object.assign({}, state, {exposureTimeValue:""});
    }

    case 'UPDATE_CALIBRATION_APPLY_DONE':
    {
       return Object.assign({}, state, {applyDisabled:true, saveDisabled:true, save:0})
    }

    case 'UPDATE_CALIBRATION_SAVE_DONE':
    {
       return Object.assign({}, state, {saveDisabled:true,save:1,calib_x:state.calib_x, calib_y:state.calib_y})
    }
    

    default:
      return state
  }


}
