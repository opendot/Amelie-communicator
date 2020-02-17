import { browserHistory } from 'react-router'
import $ from 'jquery'
import store from '../store/createStore';
import { back, getSelected, SETFLOW, setFlow, setGaze, setReset, shuffle } from '../store/flows'

/**
 * Object used to handle a Socket connection
 */
class WSService {

  /**
   * 
   * @param {string} ip address used to contact the server
   * @param {any} firstMessage first message sent after onOpen event
   * @param {boolean} reconnectOnError true if the socket must try to reconnect on error
   */
  constructor ( ip, firstMessage, onMessage, reconnectOnError = true ) {
    this.ip = ip;
    this.firstMessage = firstMessage;
    this.reconnecting = false;
    this.subscribedChannel = null;
    this.onMessage = onMessage;
    this.reconnectOnError = reconnectOnError;
    this.createWebSocket();
  }

  /** Create a new websocket, close the previous if exist */
  createWebSocket = () => {
    if( this.ws ){
      // Close the previous socket with reason 1012:Service Restart
      this.close( 1012 );
      this.logout();
    }
    this.ws = new WebSocket('ws://' + this.ip)

    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;

    this.ws.onerror = this.onError;
    this.ws.onclose = this.logout // function implemented elsewhere
  }

  changeOnMessage = (newListener) => {
    // console.log("changeOnMessage "+this.ip, this);
    if( !this.ws ) {return;}
    this.ws.removeEventListener("message", this.ws.onmessage)
    this.onMessage = newListener;
    this.ws.onmessage = this.onMessage;
  }

  onOpen = (arg) => {
    console.log("WSService onOpen", arg);
    this.reconnecting = false;
    // Send the first message if defined
    if( this.firstMessage ){
      this.send( this.firstMessage );
    }
  }

  onError = (e) => {
    console.log('WSService onError', e);
    this.close(1000);
    if( this.reconnectOnError && !this.reconnecting ){
      this.createWebSocket();
      console.log("reconnecting")
      this.reconnecting = true;
    }
  }

  logout (e) {
    // connection closed
    console.log('onclose', e.code, e.reason)
    this.close();
  }

  send (obj = {}) {
    console.log('send', obj)
    if(this.ws){
      this.ws.send(JSON.stringify(obj))
    }
    else{
      console.log("ws not ready");
    }
  }

  /** Close the socket */
  close ( code, reason){
    console.log(code,reason)
    if( this.ws ){
      this.ws.close( code, reason );
      this.ws = null;
      this.subscribedChannel = null;
    }
  }
}
export default WSService
