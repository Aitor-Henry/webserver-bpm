

const initialState = {

  buttonAcquireStyle : 'success',
  buttonAcquireGlyphiconText : "play",
  buttonAcquireText : "Acquire",
  exposureTimeValue: 0.01,
  samplingRateValue: 10,
  liveCheckedBool: 0, //Sert pour les requetes aux serveur si live ou non
  liveSet: 0, //sert pour la checkbox cochee ou non
  liveRun: 0, //pour les bouton de la sidebar disabled ou non
  acqImage: 0,
  Xvalue: 1,
  Yvalue: 1,
  saveValue: 0,
  applyDisabled : true,
  saveDisabled : true,

};



export default function options(state = initialState, action) {
  
  switch (action.type) {
    
    case 'GET_STATUS_DONE':
    { //NOT SRE ABOUT THIS
      return Object.assign({}, state, {liveCheckedBool:Number(action.status.live), exposureTimeValue:action.status.exposure_time, samplingRateValue:action.status.acq_rate , Xvalue:action.status.calib_x, Yvalue:action.status.calib_y})
    } //liveRun:Number(action.status.live)

    case 'BUTTON_ACQUIRE_PRESSED':
    {
      if(state.buttonAcquireStyle === 'success' && state.liveCheckedBool == 1){
        return Object.assign({}, state, {buttonAcquireStyle:'danger',buttonAcquireText:"Stop",buttonAcquireGlyphiconText:"stop",liveCheckedBool: 0, liveRun:1, acqImage: 0})
      }
      else if(state.buttonAcquireStyle === 'danger' && state.liveCheckedBool == 0){
        return Object.assign({}, state, {buttonAcquireStyle:'success',buttonAcquireText:"Acquire",buttonAcquireGlyphiconText:"play", liveSet: 0, liveRun: 0, acqImage: 0})
      }
      else {
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
      alert("Acquisition rate can't be null or can't be inferior to exposure time. reminder : s = 1/Hz");
      return Object.assign({}, state, {samplingRateValue:""})
    }

    case 'TEXT_ENTER_X':
    {
      if(state.Yvalue === ""){
        return Object.assign({}, state, {Xvalue:action.text,applyDisabled:true,saveDisabled:true})
      }
      else{
        return Object.assign({}, state, {Xvalue:action.text,applyDisabled:false,saveDisabled:false})
      }
    }

    case 'TEXT_EMPTY_X':
    {
      return Object.assign({}, state, {Xvalue:"",applyDisabled:true,saveDisabled:true})
    }

    case 'TEXT_ENTER_Y':
    {
      if(state.Xvalue === ""){
        return Object.assign({}, state, {Yvalue:action.text,applyDisabled:true,saveDisabled:true})
      }
      else{
        return Object.assign({}, state, {Yvalue:action.text,applyDisabled:false,saveDisabled:false})
      }

    }

    case 'TEXT_EMPTY_Y':
    {
      return Object.assign({}, state, {Yvalue:"",applyDisabled:true,saveDisabled:true})
    }

    case 'UPDATE_CALIBRATION_APPLY_DONE':
    {
       console.log('UPDATE_CALIBRATION_APPLY_DONE')
       return Object.assign({}, state, {applyDisabled:true,save:0})
    }

    case 'UPDATE_CALIBRATION_SAVE_DONE':
    {
       console.log('UPDATE_CALIBRATION_SAVE_DONE')
       return Object.assign({}, state, {saveDisabled:true,save:1})
    }

    default:
      return state
  }


}
