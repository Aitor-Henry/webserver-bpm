import { combineReducers } from 'redux'
import textState from './button.js'
import options from './options.js'
import video from './video.js'
import canvas from './canvas.js'
import bpmState from './navbar.js'

const rootReducer = combineReducers({
  textState,
  bpmState,
  options,
  video,
  canvas,
})

export default rootReducer
