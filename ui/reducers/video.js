const initialState = {
  selectedLut:"Linear",
  autoscaleCheckedBool: 0,
  temperatureCheckedBool:0,
  yCheckedBool: 0,
  maxValue: "",
  backgroundstate: 1,
  activeBkgnd:false,
  crosshair: 0,
  activeCrosshair: false,
  activeROI:false,
  rotation:0,
};



export default function video(state = initialState, action) {

  switch (action.type) {

    case 'GET_STATUS_DONE':
    {
      if(action.status.background===true){
        alert('A background is already set, you can reset it by clicking on the \'Bkgnd\' button')
        return Object.assign({}, state, {backgroundstate: 0, activeBkgnd:true})
      }
    }

    case 'LINEAR_CLICKED':
    {
      return Object.assign({}, state, {selectedLut:"Linear"})
    }

    case 'LOGARITHMIC_CLICKED':
    {
      return Object.assign({}, state, {selectedLut:"Logarithmic"})
    }

    case 'AUTOSCALE_CHECKED':
    {
      if(state.autoscaleCheckedBool === 0){
        return Object.assign({}, state, {autoscaleCheckedBool : 1})
      }
      else{
        return Object.assign({}, state, {autoscaleCheckedBool : 0})
      }
    }

    case 'TEMPERATURE_CHECKED':
    {
      if(state.temperatureCheckedBool === 0){
        return Object.assign({}, state, {temperatureCheckedBool : 1})
      }
      else{
        return Object.assign({}, state, {temperatureCheckedBool : 0})
      }
    }

    case 'Y_CHECKED':
    {
      if(state.yCheckedBool === 0){
        return Object.assign({}, state, {yCheckedBool : 1})
      }
      else{
        return Object.assign({}, state, {yCheckedBool : 0})
      }
    }

    case 'TEXT_ENTER_MAX':
    {
      return Object.assign({}, state, {maxValue : action.text})
    }

    case 'TEXT_EMPTY_MAX':
    {
      return Object.assign({}, state, {maxValue : ""})
    }

    case 'BACKGROUND_STATE':
    {
      if(state.backgroundstate === 1){
        return Object.assign({}, state, {backgroundstate: 0, activeBkgnd:true})
      }
      else{
        return Object.assign({}, state, {backgroundstate: 1, activeBkgnd:false})
      }
    }

    case 'SET_ROI':
    {
      if(state.activeROI === true){
        return Object.assign({}, state, {activeROI:false})
      }
      else{
        return Object.assign({}, state, {activeROI:true})
      }
    }

    case 'SET_ROI_DONE' :
    {
      return Object.assign({}, state, {activeROI:false})
    }

    case 'SET_CROSSHAIR':
    {
      if(state.activeCrosshair === true){
        return Object.assign({}, state, {crosshair: 0, activeCrosshair:false})
      }
      else{
        return Object.assign({}, state, {crosshair: 1, activeCrosshair:true})
      }
    }

    case 'ROTATION':
    {
      return Object.assign({}, state, {rotation:(state.rotation+action.rotation)%360})
    }

    default:
      return state
  }


}
