const initialState = {
  client_id: window.location.href.split("/")[window.location.href.split("/").length-2].toString(),
};

export default function bpmState(state = initialState, action) {
  
  return state

}
