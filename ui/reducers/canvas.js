const initialState = {
  img_num: 0,
  fwhmX :0,
  fwhmY :0,
  intensity :0,
  bx :0,
  by :0,
  profileX : [],
  profileY : [],
  beam_markX: undefined,
  beam_markY: undefined,
  percentMarkX:undefined,
  percentMarkY:undefined,
  start_X:undefined,
  start_Y:undefined,
  prevX:undefined,
  prevY:undefined,
  width:undefined,
  height:undefined,
  alertHidden:true,
  resetDesactivated:true,
  imageMaxWidth:0,
  imageMaxHeight:0,
  start_X_display:undefined,
  start_Y_display:undefined,
  windowWidth:undefined,
  windowHeight:undefined,
  imageRatio:undefined,
 
};



export default function canvas(state = initialState, action) {

  switch (action.type) {
    case 'UPDATE_DATA' :
    { //action.status.framenb
      return Object.assign({}, state, {img_num : action.data.framenb, fwhmX: action.data.fwhm_x,fwhmY: action.data.fwhm_y, intensity : action.data.I, bx: action.data.X,by: action.data.Y, profileX : action.data.profile_x , profileY : action.data.profile_y })
    }

    case 'SET_BEAM_MARK' :
    {
      return Object.assign({}, state, {beam_markX:action.X, beam_markY:action.Y,percentMarkX:action.X/state.windowWidth,percentMarkY:action.Y/state.windowHeight})
    }

    case 'SET_ROI_MARK' :
    {
      return Object.assign({}, state, {start_X:action.X, start_Y:action.Y,prevX:action.X, prevY:action.Y,start_X_display:Math.round((action.X*state.imageMaxWidth/state.windowWidth)*1)/1,start_Y_display:Math.round((action.Y*state.imageMaxHeight/state.windowHeight)*1)/1 })
    }

    case 'SET_PREV_ROI_MARK' :
    {
      return Object.assign({}, state, {prevX:action.X, prevY:action.Y,width:action.W,height:action.H })
    }

    case 'SET_ROI_DONE' :
    {
      return Object.assign({}, state, {alertHidden:false,start_X:undefined, start_Y:undefined,prevX:undefined, prevY:undefined,resetDesactivated:false})
    }
    case 'HIDE_ALERT' :
    {
      return Object.assign({}, state, {alertHidden:true})
    }

    case 'RESET_ROI_DONE' :
    {
      return Object.assign({}, state, {start_X:undefined, start_Y:undefined,prevX:undefined, prevY:undefined,width:undefined,height:undefined,start_X_display:undefined,start_Y_display:undefined,resetDesactivated:true})
    }

    case 'RESET_CROSSHAIR' :
    {
      return Object.assign({}, state, {beam_markX:undefined, beam_markY:undefined})
    }

    case 'GET_STATUS_DONE' :
    {
      //CALCULS ET TESTS A FAIRE
      console.log(action.status.roi)
      if(action.status.roi==true){
        alert('ROI is already set, if you want an acquisition with full image reset ROI (throught button ROI -> Reset ROI or with lima), then restart webserver and actualize web browser.')
      }
      return Object.assign({}, state, {imageMaxWidth:action.status.full_width, imageMaxHeight:action.status.full_height,imageRatio:action.status.full_width/action.status.full_height,windowWidth:((action.windowHeight*0.54)*(action.status.full_width/action.status.full_height)),windowHeight:action.windowHeight*0.54})
    }

    case 'UPDATE_DIMENSIONS' :
    {
      //CALCULS ET TESTS A FAIRE pour le ratio !
      if(state.beam_markX!=undefined && state.beam_markY!=undefined){
        return Object.assign({}, state, {windowWidth:(action.windowHeight*0.54)*state.imageRatio,windowHeight:action.windowHeight*0.54,beam_markX:((action.windowHeight*0.54)*state.imageRatio)*state.percentMarkX,beam_markY:(action.windowHeight*0.54)*state.percentMarkY})
      } else {
        return Object.assign({}, state, {windowWidth:(action.windowHeight*0.54)*state.imageRatio,windowHeight:action.windowHeight*0.54})
      }
      
    }

    case 'SWITCH_DIMENSIONS' :
    {
      //CALCULS ET TESTS A FAIRE
      return Object.assign({}, state, {windowWidth:action.windowWidth,windowHeight:action.windowHeight}) //utilisee pour lq rotation, inversee les dimensiins
    }

    default:
      return state

  }


}
