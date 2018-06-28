
export function buttonStartPressed(){
  return { type: 'BUTTON_START_PRESSED'}
}

export function buttonResetPressed(){
  return { type: 'BUTTON_RESET_PRESSED'}
}

export function radioClick(nbGenerate){
  return { type: 'RADIO_CLICK',nbGenerate}
}


export function listClick(indice){
  return { type: 'LIST_CLICK',indice}
}


export function textEnter() { //enable est le booleen passe en parametre
  return { type: "TEXT_ENTER",} //On informe le reducers qu'on est dans le cas d'un text non vide et on lui passe le texte
}

export function textEmpty() { //enable est le booleen passe en parametre
  return { type: "TEXT_EMPTY"} //On informe le reducers qu'on est dans le cas d'un text vide
}

export function buttonWarningPressed(indice){
  return { type: 'BUTTON_WARNING_PRESSED',indice}
}
