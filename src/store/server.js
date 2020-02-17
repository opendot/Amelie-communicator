import axios from "axios";
import WSService from "../services/wsService";

// ------------------------------------
// Constants
// ------------------------------------

// Current version of the application
export const DESKTOP_APP_VERSION = "0.6.0";

export const SERVER = {
    SIGNIN: 'SIGNIN',
    SIGNOUT: 'SIGNOUT',
    SETCURRENTPATIENT: 'SETCURRENTPATIENT',
    SERVERURL: 'SERVERURL',
    SOCKETSERVER: 'SOCKETSERVER',
    NODESOCKETSERVER: 'NODESOCKETSERVER',
};

/* Authentication */
let loginCredentials = null;
let currentUser = null;

// ------------------------------------
// Actions
// ------------------------------------

export function getLoginCredentials() {
    return loginCredentials;
}

/**
 * Wrapper for the fetch function that automatically handle the tokens for authentication
 * @param {string} serverUrl
 * @param {string} relativePath
 * @param {string} method GET, PUT, DELETE, ...
 * @param {any} header extra headers
 * @param {any} body
 * @param {boolean} noLoginCredentials if true, don't add the user credential to this request. Default is false
 */
export function fetchFromServer(serverUrl, relativePath, method, header, body, noLoginCredentials = false) {
    return axios.request({
        url: `${serverUrl}/${relativePath}`,
        method: method,
        headers: Object.assign({},{
                    'Accept': 'application/airett.v1',
                    'Content-Type': 'application/json',
                    'pragma': 'no-cache',
                    'cache-control': 'no-store',
                    'desktop-version': `${DESKTOP_APP_VERSION}`
                },
                noLoginCredentials?null:getLoginCredentials(),
                header),
        data: body,
        validateStatus: function (status) {
            return status < 500; // Reject only if the status code is greater than or equal to 500
        }
    })
}


/* Authentication */

export function autoSignin(email, password, onServerMessage, onServerEyeMessage,serverip){
    return function( dispatch, getState) {
        // Get current server url, it's the same of this computer
        let url = "http://localhost:3001";
        dispatch( setServerUrl(url));

        // Do signin
        authenticateUser(email,password,serverip)(dispatch, getState)
        .then( () => {
            // After login connect to websocket
            let credentials = getLoginCredentials();
            let socketUrl = `${getState().server.serverUrl.substring(7)}/cable`// Remove http:// from socketUrl
                +`?uid=${credentials.uid}&access-token=${credentials["access-token"]}&client=${credentials.client}`;

            // Socket for the server
            let socketServer = new WSService( socketUrl, {
                "command":"subscribe",
                "identifier":"{\"channel\":\"CableChannel\",\"direction\":\"server_to_desktop\"}",
                "data":"{\"some\":\"something\"}"
            }, onServerMessage );
            let socketEyeTracker = new WSService( 'localhost:4000', {type: "connection"}, onServerEyeMessage);
            dispatch( setSocketServer(socketServer) );
            dispatch( setNodeSocketServer(socketEyeTracker) );

        });

    };
}

/**
 * Log the user to the server
 * @param {string} email
 * @param {string} password
 */
export function authenticateUser(email, password,serverip){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().server.serverUrl,
            `auth/sign_in`,
            'POST',
            null,
            {
                'email': email,
                'password': password,
              ...(serverip && {'server_ip':serverip})
            },
            true)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Error on login
                    console.log("authenticateUser Error Login", response.data);
                    return;
                }

                // Save authentication tokens received from server
                loginCredentials = {
                    'access-token':response.headers['access-token'],
                    'client':response.headers['client'],
                    'expiry':response.headers['expiry'],
                    'token-type':response.headers['token-type'],
                    'uid':response.headers['uid']
                };

                // Save user informations on redux store
                let details = null;
                details = getUserDetails(response);
                currentUser = details;
                dispatch({
                    type: SERVER.SIGNIN,
                    payload: details
                })
            })
            .catch(error => {
                console.log("Authentication error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}


export function patientChoice(type,page_id,session_id,card_id) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().server.serverUrl,
            type=="eye" ?  "patient_eye_choice_events" : "patient_touch_choice_events",
            'POST',
            null,
            {
                'training_session_id': session_id,
                'page_id': page_id,
                'card_id': card_id,
            },
            false)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Error on login
                    console.log("authenticateUser Error Login", response.data);
                    return;
                }

                console.log("patient choice received");


            })
            .catch(error => {
                console.log("event error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}

export function setTrainedParams(patient_id, data) {
  return function( dispatch, getState) {
    return fetchFromServer(
      getState().server.serverUrl,
      '/patients/'+patient_id+'/tracker_calibration_parameters/last',
      'PUT',
      null,
      {
        'transition_matrix': data.transition_matrix,
        'trained_fixation_time': data.trained_fixation_time,
      },
      false)
      .then( (response) => {
        // console.log("authenticateUser "+email, response);
        if(response.status >= 300) {
          // Error on login
          console.log("authenticateUser Error Login", response.data);
          return;
        }

        console.log("patient choice received");


      })
      .catch(error => {
        console.log("event error: ", error);
        dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
      })
  }
}


export function setPlayVideo(page_id,session_id,card_id) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().server.serverUrl,
            "play_video_events",
            'POST',
            null,
            {
                'training_session_id': session_id,
                'page_id': page_id,
                'card_id': card_id,
            },
            false)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Error on login
                    console.log("playvideo Error", response.data);
                    return;
                }

                console.log("playvideo received");


            })
            .catch(error => {
                console.log("event error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}

export function setPauseVideo(page_id,session_id,card_id) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().server.serverUrl,
            "pause_video_events",
            'POST',
            null,
            {
                'training_session_id': session_id,
                'page_id': page_id,
                'card_id': card_id,
            },
            false)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Error on login
                    console.log("pausevideo Error", response.data);
                    return;
                }

                console.log("pausevideo received");


            })
            .catch(error => {
                console.log("event error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}


export function setTransitionToEnd(page_id,session_id) {
  return function( dispatch, getState) {
    return fetchFromServer(
      getState().server.serverUrl,
      "transition_to_end_events",
      'POST',
      null,
      {
        'training_session_id': session_id,
        'page_id': page_id,
      },
      false)
      .then( (response) => {
        // console.log("authenticateUser "+email, response);
        if(response.status >= 300) {
          // Error on login
          console.log("transition to end Error", response.data);
          return;
        }

        console.log("transition to end received");


      })
      .catch(error => {
        console.log("event error: ", error);
        dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
      })
  }
}


export function setEndVideo(page_id,session_id,card_id) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().server.serverUrl,
            "end_video_events",
            'POST',
            null,
            {
                'training_session_id': session_id,
                'page_id': page_id,
                'card_id': card_id,
            },
            false)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Error on login
                    console.log("endvideo Error", response.data);
                    return;
                }

                console.log("endvideo received");


            })
            .catch(error => {
                console.log("event error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}

/*
export function changeSocketOnmesage(listener) {
  return function(getState){
    return getState().server.socketServer.changeOnMessage(listener)
  }
}
*/

export function endExtraPage(page_id,session_id,card_id) {
  return function( dispatch, getState) {
    return fetchFromServer(
      getState().server.serverUrl,
      "end_extra_page_events",
      'POST',
      null,
      {
        'training_session_id': session_id,
        'page_id': page_id,
        'card_id': card_id,
      },
      false)
      .then( (response) => {
        // console.log("authenticateUser "+email, response);
        if(response.status >= 300) {
          // Error on login
          console.log("endExtraPage Error", response.data);
          return;
        }

        console.log("endExtraPage received");


      })
      .catch(error => {
        console.log("event error: ", error);
        dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
      })
  }
}


export function audioFiles(name,audio,session_id) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().server.serverUrl,
            `audio_files`,
            'POST',
            null,
            {
                'training_session_id': session_id,
                'name': name,
                'audio_file': audio,
            },
            false)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Error on login
                    console.log("audio_files error", response.data);
                    return;
                }

                console.log("response",response);


            })
            .catch(error => {
                console.log("event error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}


export function sendRawData(arr,session_id){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().server.serverUrl,
            'training_sessions/'+session_id+'/tracker_raw_data?return_full_objects=true',
            'POST',
            null,
            {
                'tracker_data':arr
            },
            false)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Error on login
                    console.log("sendRawData Error Login", response.data);
                    return;
                }

                //console.log("response",response);


            })
            .catch(error => {
                console.log("event error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}


/** Given a response from the server create a json with the informations about the user */
function getUserDetails(response) {
    switch (response.data.type){
        case "Researcher":
        return {
            id: response.data.id,
            name: response.data.name,
            surname: response.data.surname,
            email: response.data.email,
            bithdate: response.data.bithdate,
            type: response.data.type,
        };

        default:
        return {
            id: response.data.id,
            name: response.data.name,
            surname: response.data.surname,
            email: response.data.email,
            bithdate: response.data.bithdate,
            type: response.data.type,
        };
    }
}

/** Signout from server and clear data on current device */
export function doSignout() {
    return function(dispatch, getState) {
        fetchFromServer(getState().server.serverUrl,'auth/sign_out',"DELETE",{},{}).then(response => {
            loginCredentials = null;
            currentUser = null;
            dispatch ({
                type: SERVER.SIGNOUT,
                payload: null
            });
        }).catch(error => {
            console.log("Error performing logout. User has been logged out only on client side.", error);
            loginCredentials = null;
            currentUser = null;
            dispatch ({
                type: SERVER.SIGNOUT,
                payload: null
            });
        })
    }
}

/**
 * Define the patient we are currently working with
 * @param {any} patient
 */
export function setCurrentPatient( patient ){
    return {
        type: SERVER.SETCURRENTPATIENT,
        payload: patient,
    };
}

/**
 * Define the url of the server
 * @param {string} newUrl url of the server, including both https, ip and port
 */
export function setServerUrl( newUrl ){
    return {
        type: SERVER.SERVERURL,
        payload: newUrl,
    }
}

/**
 * Define the socket used to communicate with the rails server
 * @param {WSService} socketServer
 */
export function setSocketServer( socketServer ){
    return {
        type: SERVER.SOCKETSERVER,
        payload: socketServer,
    };
}

export function setNodeSocketServer( nodeSocket ) {
    return {
        type: SERVER.NODESOCKETSERVER,
        payload: nodeSocket
    }
}





// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
    loggedIn: false,
    currentUser:{
        email: "",
        type: "",
    },
    currentPatient: null,   // The current patient the currentUser is working with
    serverUrl: null,    //  The url of the local server, defined by the user
    socketServer: null, //  Socket used to communicate with the server, used the receive the page to show
    nodeSocketServer: null,
};

export default function serverReducer (state = initialState, action) {
    switch (action.type) {

        case SERVER.SIGNIN:
            return {
                ...state,
                loggedIn: true,
                currentUser: action.payload,
                currentPatient: null,
                socketServer: null,
            };

        case SERVER.SIGNOUT:
            if( state.socketServer ){
                state.socketServer.close(1000);
            }

            if( state.nodeSocketServer ){
                state.nodeSocketServer.close(1000);
            }
            return {
                ...state,
                loggedIn: false,
                currentUser: null,
                currentPatient: null,
                socketServer: null,
                socketMobile: null,
                nodeSocketServer: null
            };

        case SERVER.SETCURRENTPATIENT:
            return {
                ...state,
                currentPatient: action.payload,
            };

        case SERVER.SERVERURL:
            return {
                ...state,
                serverUrl: action.payload,
            };

        case SERVER.SOCKETSERVER:
            return {
                ...state,
                socketServer: action.payload,
            };

        case SERVER.NODESOCKETSERVER:
            return {
                ...state,
                nodeSocketServer: action.payload
            }

        default:
            return state
    }
}
