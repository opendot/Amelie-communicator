import { fetchFromServer } from "../store/server";
import {browserHistory} from 'react-router'

class AudioService {

  /**
   * AudioService for recording audio during sessions
   */
  constructor (session_id, sendaudio) {
    this.session = session_id;
    this.chunks = [];
    this.audioFiles = sendaudio;

    let me = this;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => { 
        me.recorder = new MediaRecorder(stream);
        me.recorder.ondataavailable = this.addChunk;

        //debugging
        me.recorder.onerror = (e) => {
            console.log("error",e);
        }
        me.recorder.onstop = (e) => {
            console.log("stop",e);
            if(me.next) {
              
              me.session = me.next
              me.next = null
              me.chunks = []
              me.recorder.start(1000);
            }
            if(me.signout) {
                console.log("signing out")
                me.signout();
            }

        }
        me.recorder.onwarning = (e) => {
            console.log("warning",e);
        }
        me.recorder.onpause = (e) => {
            console.log("pause",e);
        }
        me.recorder.start(1000);
        
      });
}


addChunk = (e) => {

 
  //console.log("push new data");
      // if recorder is 'inactive' then recording has finished
      if (this.recorder.state == 'inactive') {
        
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        console.log("stopping",blob);

        //DEBUG: download the audio file
        /*
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "prova.webm";
        a.click();
        */
        let me = this;
        let reader = new window.FileReader();
        reader.readAsDataURL(blob); 
        reader.onloadend = function() {
           let base64 = reader.result;

        me.audioFiles(me.session+".webm", base64, me.session);
           //fetchFromServer()
        }
      }

      else if(this.recorder.state == 'recording') {
         this.chunks.push(e.data);
      }
}


}
  export default AudioService