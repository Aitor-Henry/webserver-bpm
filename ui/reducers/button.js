/*import React from 'react';
import ReactDom from 'react-dom';
import { Button } from 'react-bootstrap';
import { ListGroup,ListGroupItem } from 'react-bootstrap';*/

const initialState = {
  list: [],
  stylesList: [],
  stylesChanged:[],
  taille : 0,
  buttonStartDisabled: true,
  buttonResetDisabled: true,
  buttonWarningDisabled:true,
  nbGenerate: 0,
  textDisabled:true
};


export default function textState(state = initialState, action) {

  const newList = [...state.list];
  const newStylesList = [...state.stylesList];
  const newStylesChanged = [...state.stylesChanged];

  switch (action.type) {
    case 'BUTTON_START_PRESSED':
    {
      for(let i=0 ;i<state.nbGenerate;i++){
        newList.push(Math.random()*51);
        newStylesList.push("default");
        newStylesChanged.push(false);
      }

      return Object.assign({}, state, { list:newList, taille: newList.length, buttonResetDisabled:false, stylesList:newStylesList,textDisabled:false,stylesChanged:newStylesChanged}) //On ajoute le texte saisie dans le array list, on augmente la taille asscociee, on remet a 0 la value du input et on bloque le bouton dajout
    }
    case 'BUTTON_RESET_PRESSED':
      return Object.assign({}, state, { list:[],taille: 0, buttonResetDisabled:true,textDisabled:true,buttonWarningDisabled:true,stylesList:[],stylesChanged:[]}) //On supprime l'element d'indice taille-1 ce qui correspond au dernier du tableau
    case 'RADIO_CLICK':
      return Object.assign({}, state, { buttonStartDisabled:false, nbGenerate:action.nbGenerate}) //On desactive le bouton de suppression
    case 'BUTTON_WARNING_PRESSED':
    {

      if(action.indice-1 < state.taille){
        if(newStylesChanged[action.indice-1] === false){
          newStylesChanged[action.indice-1] = true;
          newStylesList[action.indice-1] = "success";
        }
        else{
            newStylesChanged[action.indice-1] = false;
            newStylesList[action.indice-1] = "default";
        }
      }else {
        alert('The list doesn\'t contains this index, try another one')
      }



      return Object.assign({}, state, { buttonStartDisabled:false,stylesList:newStylesList,stylesChanged:newStylesChanged}) //On desactive le bouton de suppression
    }
    case 'TEXT_ENTER': //Si le texte n'est pas vide
      return Object.assign({}, state, { buttonWarningDisabled: false}) //On reactive le bouton et on met a jour la zone de saisir par ce que lutilisateur a entre
    case 'TEXT_EMPTY':
      return Object.assign({}, state, { buttonWarningDisabled: true}) //Sinon on le desactive
    default:
      return state
  }
}
