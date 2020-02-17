import React from 'react'
import './HomeView.scss'
import { connect } from 'react-redux';
import WSService from '../../../services/wsService'
import LoadedService from '../../../services/loadedService'
import { autoSignin, doSignout } from "../../../store/server";
let QRCode = require('qrcode.react');
import {browserHistory} from 'react-router'
import logo from '../assets/logo.png';

class HomeView extends React.Component {

constructor (props) {
    super(props)
  this.state = {
    value: '',
    backloaded:false,
    size: 256,
    fgColor: '#333333',
    bgColor: '#ffffff',
    level: 'L',
    tid:null,
    userPresent:false,
    udpEnabled:false,
    loadedService : null
  };
}

 getIp= () => {
    const getExternalIP = new Promise(function (resolve, reject) {
      console.log("getting external ip")
      var ips = [];
      var ip_dups = {"192.168.99.1": true, "192.168.56.1": true};

      //compatibility for firefox and chrome
      var RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;
      var useWebKit = !!window.webkitRTCPeerConnection;


      //minimal requirements for data connection
      var mediaConstraints = {
        /* optional: [{RtpDataChannels: true}]*/
      };

      var servers = {iceServers: []};

      //construct a new RTCPeerConnection
      var pc = new RTCPeerConnection(servers, mediaConstraints);

      function handleCandidate(candidate) {
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
        var result = ip_regex.exec(candidate);

        if (!result) return;
        var ip_addr = result[1];

        //remove duplicates
        if (ip_dups[ip_addr] === undefined)
          ips.push(ip_addr);

        ip_dups[ip_addr] = true;
      }

      //listen for candidate events
      pc.onicecandidate = (ice) => {

        //skip non-candidate events
        if (ice.candidate)
          handleCandidate(ice.candidate.candidate);
      };

      //create a bogus data channel
      pc.createDataChannel("");

      //create an offer sdp
      pc.createOffer((result) => {

        //trigger the stun server request
        pc.setLocalDescription(result, function () {
        }, function () {
        });

      }, function () {
      });

      //wait for a while to let everything done
      setTimeout(function () {
        console.log(pc, ips);
        if (pc.localDescription) {
          //read candidate info from local description
          var lines = pc.localDescription.sdp.split('\n');

          lines.forEach((line) => {
            //console.log(line);
            if (line.indexOf('a=candidate:') === 0)
              handleCandidate(line);
          });

          resolve(ips.pop());
        }
      }, 2000);
    });
    return getExternalIP;
  }
/*

  getExternalIP = new Promise(function(resolve, reject) {

    var ips =[];
    var ip_dups = {"192.168.99.1":true,"192.168.56.1":true};
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new RTCPeerConnection({iceServers: []}),
      noop = function () {
      };

    pc.createDataChannel("");
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);
    pc.onicecandidate = function (ice) {
      console.log(ice);
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;

      var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];

      console.log(myIP)

      if(ip_dups[myIP] === undefined) {
        ips.push(myIP);
      }
      else return;
      pc.onicecandidate = noop;

    };

    setTimeout(function(){

      console.log(pc);
      console.log(ips);
      resolve(ips[0]);

    },10000)



  })
*/

  componentDidUpdate(){
    console.log(this.state);
  }

  componentDidMount() {
    console.log("mounting HomeView")
      if(this.props.lastScreen) {
        console.log("existing connection");
        this.props.socketServer.changeOnMessage(this.onServerMessage);
        this.setState({
          value: "192.168.1.14:3001",
          loadedService : new LoadedService("192.168.1.14:3001", null)
        })
      }
      else {
        console.log("new connection");
        this.getIp().then((ip) => {

          this.setState({
            value: ip + ":3001",
            loadedService: new LoadedService(ip + ":3001", () => {
              this.props.autoSignin("desktop@pc.it", "cppotksed", this.onServerMessage, console.log, "http://" + ip + ":3001")
            })
          })
        })
      }
  }


   componentWillUnmount(){
     //this.props.doSignout();
  }

  reloadPage = () => {
    window.location.reload();
  }




onServerMessage = (e) => {
    const event = JSON.parse(e.data)
    console.log("HomeView onServerMessage", event);
    const identifier = event.identifier ? JSON.parse(event.identifier) : {};
    const message = event.message ? JSON.parse(event.message) : {};
    //console.log("CardsView onServerMessage content", identifier, message);

    switch( event.type){
      case 'confirm_subscription':
        // Save the channel I'm subscribed t
        this.props.socketServer.subscribedChannel = identifier.channel;
      break;

      case 'ping':
        return;

      default:
        break;
    }

    if(message && message.type == "USER_CONNECTED"){

      //this.props.doSignout();
      if(this.props.lastScreen){
        console.log("back to last screen", this.props.lastScreen)
        browserHistory.replace(process.env.BASEURL+this.props.lastScreen);

      }
      else{
        browserHistory.replace(process.env.BASEURL+'/cards');
      }
    }
  else if(message && message.type == "USER_ON_NETWORK"){
      console.log("user on network");
    this.setState({userPresent:true})
  }
  }


    render(){
    console.log("should I draw", this.state.loadedService && this.state.loadedService.loaded && (this.state.userPresent || !this.state.udpEnabled))

          //{this.state.value.length > 0 && <div className="spinner"></div>}
         if (this.state.loadedService && this.state.loadedService.loaded && (this.state.userPresent || !this.state.udpEnabled)) {
          return (<div className="logo-container">
            <img src={logo}/>
            <div className="qr-section">
          <QRCode
            value={this.state.value}
            size={this.state.size}
            fgColor={this.state.fgColor}
            bgColor={this.state.bgColor}
            level={this.state.level}/>
          <div className="advices">
          <h2>Scansiona il codice QR con l'app per continuare</h2>
            <p>Hai problemi con la connessione?</p>
            <ul>
              <li>assicurati che il telefono e il computer siano collegati alla stessa rete</li>
              <li>assicurati che il telefono abbia inquadrato correttamente il codice QR (dovresti sentire una vibrazione di conferma)</li>
              <li>se hai ancora problemi, prova a ricaricare questa pagina</li>
            </ul>
            <button className="reload-button" onClick={this.reloadPage}>
              RICARICA
            </button>
          </div>
            </div>
            {this.props.lastScreen && <div className={"pauseAdvice"}>
              <p><strong>Amelie è in pausa. </strong>L'app mobile non è attiva sul telefono o è stata chiusa. Riporta l'app Amelie in primo piano, o accedi di nuovo inquadrando il codice QR o premendo il tasto "salta" (se disponibile).</p><p>Se per ora hai finito di usare Amelie, chiudi questa finestra. </p>
            </div>}
          </div>)
          }
          else if(!this.state.userPresent && this.state.udpEnabled){

            return (<div className="logo-container">
                <img src={logo}/>

              <div className="wait-container">
                <div className="lds-ripple">
                  <div></div>
                  <div></div>
                </div>
                <p>Sto cercando dispositivi mobile Amelie. Accertati che computer e telefono siano connessi alla stessa rete Wifi e che l'app sia attiva.</p>
            </div>
            </div>)

          }
         else{
           return(<div className="logo-container">
             <img src={logo}/>
           </div>)
         }
    }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.server.currentUser,
    currentPatient: state.server.currentPatient,
    socketServer: state.server.socketServer,
    socketEyeServer: state.server.nodeSocketServer,
    lastScreen: state.flow.lastScreen,
    serverUrl: state.server.serverUrl
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    autoSignin: (email, password, onServerMessage, onMobileMessage, serverip) => {dispatch(autoSignin(email, password, onServerMessage, onMobileMessage,serverip))},
    doSignout: () => {dispatch(doSignout())},
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
