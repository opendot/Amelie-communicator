/* eslint-disable padded-blocks,no-trailing-spaces */

import WSService from '../services/wsService'
import { fetchFromServer } from "./server";
// ------------------------------------
// Constants
// ------------------------------------
export const SETFLOW = 'SETFLOW'
export const SETPRO = 'SETPRO'
export const BACK = 'BACK'
export const NEXTPAGE = 'NEXTPAGE'
export const SETPATIENT = 'SETPATIENT'
export const SHUFFLE = 'SHUFFLE'
export const TOGGLEGAZE = 'TOGGLEGAZE'
export const SETGAZE = 'SETGAZE'
export const SETALIGNMENT = 'SETALIGNMENT'
export const SETALIGNMENTPOS = 'SETALIGNMENTPOS'
export const INVALIDATEALIGN = 'INVALIDATEALIGN'
export const SETRESET = 'SETRESET'
export const SETSELECTED = 'SETSELECTED'
export const GETSELECTED = 'GETSELECTED'
export const RESETSELECTED = 'RESETSELECTED'
export const SETTRAININGSESSION = 'SETTRAININGSESSION'
export const CLOSESESSION = 'CLOSESESSION'
export const PAUSE = 'PAUSE'
// ------------------------------------
// Actions
// ------------------------------------
export function sendToApp( msg ) {
  console.log("sending something");
    // WSService.send(msg);
}

export function formatMessage( direction, message){
  return {
    "command":"message",
    "identifier":`{"channel":"CableChannel","direction":"${direction}"}`,
    "data": JSON.stringify(message),
  };
}

/**
 * Get a page from the server
 * @param {string} treeId the id of an existing page on the server
 * @param {function} [callback = null] called after the response from the server, it receive the retrieved page
 *  as a parameter, or null if something went wrong
 */
export function getPage( pageId, callback = null ){
  return function( dispatch, getState) {
      return fetchFromServer(
          getState().server.serverUrl,
          `pages/${pageId}`,
          'GET',
          null,
          null
      )
      .then( (response) => {
          // console.log("getPage response", response, callback);
          if( response && response.status < 300 ){
            if( callback ){
                callback( response.data );
            }
          }
          else {
            console.log("getPage failure", response.data);
            if( callback ){callback(null);}
          }
      })
      .catch(error => {
          console.log("getPage error: ", error);
      });
  }
}

export function getFeedbackPage( feedbackPageId, pageAfterFeedbackId, callback = null ){
  return function( dispatch, getState) {
      return fetchFromServer(
          getState().server.serverUrl,
          `feedback_pages/${feedbackPageId}?next_page_id=${pageAfterFeedbackId}`,
          'GET',
          null,
          null
      )
      .then( (response) => {
          // console.log("getFeedbackPage response", response, callback);
          if( response && response.status < 300 ){
            if( callback ){
                callback( response.data );
            }
          }
          else {
            console.log("getFeedbackPage failure", response.data);
            if( callback ){callback(null);}
          }
      })
      .catch(error => {
          console.log("getFeedbackPage error: ", error);
      });
  }
}

export function setFlow (payload) {
  return {
    type    : SETFLOW,
    payload,
  }
}

export function setPatient (payload) {
  return {
    type    : SETPATIENT,
    payload,
  }
}

export function pause (payload) {
  return {
    type    : PAUSE,
    payload,
  }
}

export function back () {
  return {
    type    : BACK
  }
}

export function nextPage (payload) {
  return {
    type    : NEXTPAGE,
    payload,
  }
}

export function setTrainingSession (payload) {
  return {
    type    : SETTRAININGSESSION,
    payload,
  }
}

export function shuffle (payload) {
  return {
    type    : SHUFFLE,
    payload,
  }
}

export function toggleGaze () {
  return {
    type    : TOGGLEGAZE
  }
}

export function setGaze (payload) {
  return {
    type    : SETGAZE,
    payload
  }
}

export function setAlignment (payload) {
  return {
    type    : SETALIGNMENT,
    payload
  }
}

export function setAlignmentPos (payload) {
  return {
    type    : SETALIGNMENTPOS,
    payload
  }
}

export function invalidateAlign () {
  return {
    type    : INVALIDATEALIGN
  }
}

export function setReset (payload) {
  return {
    type    : SETRESET,
    payload
  }
}

export function setSelected (payload) {
  return {
    type    : SETSELECTED,
    payload
  }
}

export function getSelected (payload) {
  return {
    type    : GETSELECTED,
    payload
  }
}

export function resetSelected (payload) {
  return {
    type    : RESETSELECTED,
    payload
  }
}

export function setPro (payload) {
  return {
    type    : SETPRO,
    payload
  }
}

export function closeSession () {
  return {
    type    : CLOSESESSION
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  history:[],
  patient:null,
  currPage:null,
  gazeOn:true,
  alignOn:false,
  alignPos:0,
  alignFresh:false,
  reset:true,
  selectFromApp:0,
  session_id:null,
  lastScreen:null,
  pro:false,
}

export default function flowReducer (state = initialState, action = {}) {
  switch (action.type) {

    case SETFLOW:
      return {
        ...state,
        currPage: action.payload,
        history: [action.payload.id],
        reset:false
      }

    case SETPRO:
      return {
        ...state,
        pro:action.payload
      }

    case PAUSE:
      return {
        ...state,
        lastScreen: action.payload.replace("/dist","")
      }


    case SETTRAININGSESSION:
      return {
        ...state,
        session_id: action.payload.training_session_id
      }

    case SETPATIENT:
      return {
        ...state,
        patient: action.payload
      }

    case NEXTPAGE:
      return {
        ...state,
        currPage: action.payload,
        history:[...state.history, action.payload.id]
      }

    case BACK:
      //console.log("istoria",state.history)
      let newHistory = state.history.length > 1 ? state.history.slice(0,-1) : state.history.slice()
      let newPage = state.flow.filter((e, i) => { return e['_id'] === newHistory[newHistory.length - 1] })[0]
      //console.log("allnew", newHistory, newPage);
      //sendToApp({type:'cardsOnView',data:newPage.cards})

      return {
        ...state,
        currPage: newPage,
        history: newHistory,
        reset:false
      }

    case SHUFFLE:

      let shuffled = { ...state.currPage,
        cards: action.payload

      }

      return {
        ...state,
        reset:false,
        currPage: shuffled
      }

    case TOGGLEGAZE:

      return {
        ...state,
        gazeOn: !state.gazeOn
      }

    case SETGAZE:

      return {
        ...state,
        gazeOn: action.payload
      }

    case SETALIGNMENT:

      return {
        ...state,
        alignOn: action.payload
      }

    case SETALIGNMENTPOS:



      return {
        ...state,
        alignPos: action.payload,
        alignFresh: true
      }

    case INVALIDATEALIGN:

      return {
        ...state,
        alignFresh: false
      }

    case GETSELECTED:

      return {
        ...state,
        selectFromApp: action.payload
      }

    case RESETSELECTED:

      return {
        ...state,
        selectFromApp: 0
      }

    case CLOSESESSION:

      return {
        ...state,
        session_id:null
      }

    case SETRESET:

      //sendToApp({type:'cardsOnView',data:action.payload ? "reset" : state.currPage.cards})

      return {
        ...state,
        reset: action.payload
      }

    case SETSELECTED:
      // Add a flag selcted:true to the selected card
      let newCards = state.currPage.cards.map((d,i)=>{return d.id === action.payload ? {...d, selected:true} : d})
      let newP = {...state.currPage, cards:newCards}
      //console.log(newCards);
      //sendToApp({type:'cardsOnView', data:newCards})

      return {
        ...state,
        currPage: newP
      }

    default:
      return state
  }
}
