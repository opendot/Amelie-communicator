import React from 'react'
import './CognitiveView.scss'
import { connect } from 'react-redux'
import PageItem from "../../../components/PageItem";
import PresentationItem from "../../../components/PresentationItem";
import VideoItem from "../../../components/VideoItem";
import {
  audioFiles,
  sendRawData,
  autoSignin,
  doSignout,
  patientChoice,
  setPlayVideo,
  setPauseVideo,
  setEndVideo,
  endExtraPage,
  setTransitionToEnd
} from "../../../store/server";
import { formatMessage, setFlow, nextPage, resetSelected, getPage, getFeedbackPage, setReset, setSelected, setGaze, setTrainingSession, shuffle,closeSession, pause, setAlignment, setAlignmentPos } from '../../../store/flows'
import pageTheme from "../../../styles/page-theme";
import $ from 'jquery';
import _ from 'lodash';
import RawDataService from '../../../services/rawDataService';
import AudioService from '../../../services/audioService';
import {browserHistory} from 'react-router'
import {synthetizeAudio} from '../utils/utils'
import softAlert from "../../../assets/soft.wav";
import hardAlert from "../../../assets/hard.wav";
import harderAlert from "../../../assets/harder.wav";
import Aligner from "../../../components/Aligner";

/**
 * Main view that show the tree to the patient.
 * This show a single page at time
 */
class CognitiveView extends React.Component {

  constructor (props) {
    super(props)
    this.voice = window.speechSynthesis
    this.rawDataService = new RawDataService(80,this.props.sendRawData);

    this.state = {
      selected : false,
      selcard: null,
      transitionToPage: null,
      video: false,
      videoCard : null,
      videoState:null,
      presentation:false
    }
  }

  componentDidMount(){
    console.log("mounting CognitiveView")
    this.props.socketServer.changeOnMessage(this.onServerMessage)
    this.props.socketEyeServer.changeOnMessage(this.onServerEyeMessage)

  }

  componentWillUnmount(){
    // Signout
     this.props.setReset(true);
     this.props.closeSession();

     if(this.audioService && this.audioService.recorder && this.audioService.recorder.state == "recording"){
        //this.audioService.signout = this.props.doSignout;
        this.audioService.recorder.stop();
      }
      else {
      //this.props.doSignout();
      }
  }


  componentWillReceiveProps(nextProps){
    let page = this.props.currPage;

    if(nextProps.selectFromApp != 0 && !this.state.selected) {
      let crds = page.cards.filter((c,i)=>{return c.id == nextProps.selectFromApp})
      if(crds.length){
        let i = page.cards.findIndex((c)=>{return c.id == crds[0].id})
        this.selectCard(crds[0],page.hasOwnProperty("links") && page.links.length > i ? page.links[i] : 0)
      }
    }

    //checks for audio recording
    if(nextProps.session_id && nextProps.session_id.indexOf("preview") == -1 && !this.props.session_id) {
      this.audioService = new AudioService(nextProps.session_id, this.props.audioFiles);
    }

    else if(nextProps.session_id && nextProps.session_id.indexOf("preview") == -1 && this.props.session_id && nextProps.session_id != this.props.session_id && this.audioService && this.audioService.recorder) {
      this.audioService.next = nextProps.session_id;
      this.audioService.recorder.stop();
    }

    else if(!nextProps.session_id && this.props.session_id && this.audioService && this.audioService.recorder && this.audioService.recorder.state == "recording") {
      this.audioService.recorder.stop();

    }
  }


//Handle messages coming from NODE websocket
 onServerEyeMessage = (e) => {
    const event = JSON.parse(e.data)
    switch(event.type){

      case 'fixation':
        //check if selection is eligible
        if( this.props.session_id && this.props.gazeOn && !this.state.selected && !this.state.video && !this.state.presentation){
        let x = $(window).width() * event.data[0]
        let y = $(window).height() * event.data[1]
        let el = document.elementFromPoint(x, y)
        let card_id = this.getCardFromElement(el);

        //check if fixation is on a card
        if(card_id) {
          this.props.patientChoice("eye",this.props.currPage.id,this.props.session_id,card_id);
        }
      }
      break;


      case 'position':
        if(this.props.alignOn){
          this.props.setAlignmentPos(event.data.y);
        }
        break;

      case 'cursor':
      //add data to raw data accumulator, check presence on video play
      if(event.data && event.data.length==2) {
        let obj = {x_position:event.data[0], y_position:event.data[1], timestamp:Date.now()}

        if(this.props.session_id && this.props.session_id.indexOf("preview") == -1 && this.props.pro) {
          this.rawDataService.addData(obj,this.props.session_id);
        }
        //check presence during video - commented because pausing was frustrating for children
        //if(this.state.video){
        //  this.checkPresenceOnVideo(obj);
        //}
      }
      break;

      default:
      console.log(event);
      break;
    }
  }

  //check presence during video
  checkPresenceOnVideo = (obj) => {
    if(obj.x_position == 0 && obj.y_position == 0 && this.state.videoState=="play") {
      this.props.setPauseVideo(this.props.currPage.id,this.props.session_id,this.state.videoCard.id)
    }
    else if(obj.x_position > 0 && obj.y_position > 0 && this.state.videoState=="pause") {
      this.props.setPlayVideo(this.props.currPage.id,this.props.session_id,this.state.videoCard.id)
    }
  }

  //get HTML element selected from fixation
 /* getCardFromElement = (el) => {

    let rightEl = null

    if(el.classList.contains("reset") || el.classList.contains("cards-pan") ) {
      return null;
    }
    else if(el.classList.contains("card-item")) {
      rightEl = el;
    }
    else if(el.tagName != "DIV"){
      while ((el = el.parentElement) && !el.classList.contains("card-item"));
      rightEl = el;
    }

    return rightEl.id;

  }*/

  //get HTML element selected from fixation
  getCardFromElement = (el) => {

    let rightEl = null

    if(el.classList.contains("reset") || el.classList.contains("cards-pan") ) {
      return null;
    }
    else if(el.classList.contains("card-item") && !el.classList.contains("card-unselectable")) {
      console.log("card-item");
      rightEl = el;
    }
    else {
      while ((el = el.parentElement) && (!el.classList.contains("card-item") || el.classList.contains("card-unselectable")));
      console.log("while",rightEl);
      rightEl = el;
    }
    console.log(rightEl);
    return rightEl.id;

  }

  //Handle messages coming from the RAILS websocket
  onServerMessage = (e) => {
    const event = JSON.parse(e.data)
    if(event.type!="ping"){
    console.log("CognitiveView onServerMessage", event);
    }
    const identifier = event.identifier ? JSON.parse(event.identifier) : {};
    const message = event.message ? JSON.parse(event.message) : {};


    switch( event.type){
      case 'confirm_subscription':
        // Save the channel I'm subscribed to
        this.props.socketServer.subscribedChannel = identifier.channel;
      break;

      case 'ping':
        return;

      default:
        break;
    }

    switch( message.type){
      case 'TRANSITION_TO_PAGE':
      case 'TRANSITION_TO_FEEDBACK_PAGE':
        // Do the same for TRANSITION_TO_PAGE, TRANSITION_TO_FEEDBACK_PAGE and TRANSITION_TO_END
      case 'TRANSITION_TO_END':

        if(this.state.selected && !this.state.transitionToPage && !this.state.video) {
          // A video or audio is playing
          this.setState({transitionToPage:message})
      }
      else{
        this.loadNextPage(message);
      }

      break;

      case 'TRANSITION_TO_PRESENTATION_PAGE':
        this.loadNextPage(message);
        break;
      //handle patient choice event, distinguish between image and video type
      case 'PATIENT_CHOICE':
        let currcard = this.props.currPage.cards.filter((d)=>{return d.id == message.data.card_id})[0]
        if(currcard.content.type != "Video" && (currcard.selection_action == "nothing" || currcard.selection_action == "synthesize_label")) {
          //read the label
          synthetizeAudio(this.voice, currcard.label);
          //select the card
          this.setState({"selcard":message.data.card_id, "selected":true})
          //wait before going to next page
          setTimeout(()=>{
              if(this.state.transitionToPage){
                  // A TRANSITION_TO_ event arrived while the audio was playing, execute it now
                  this.loadNextPage(this.state.transitionToPage)
                  this.setState({transitionToPage:null})
              }
              else {
                  // The TRANSITION_TO_ event didn't arrived yet, notify that the audio is over
                  this.setState({transitionToPage: {}})
                if(!currcard.next_page_id && this.state.lastClient){
                  //do POST
                  this.props.pause(this.props.location.pathname)
                  this.props.transitionToEnd(this.props.currPage.id,this.props.session_id)
                }
              }
          },3000)
      }
      else if(currcard.selection_action == "play_sound"){
          this.setState({"selcard":message.data.card_id, "selected":true})
          //get audio element and play sound
          this.audioComponent = document.getElementById(currcard.id+"_audio");
          this.audioComponent.play();
          //on end, wait 2 seconds and go to next state
          this.audioComponent.onended = () => {
            setTimeout(()=>{
              if(this.state.transitionToPage){
                  this.audioComponent=null
                  this.loadNextPage(this.state.transitionToPage)
                  this.setState({transitionToPage:null})
              }
          },2000)
          }
      }
      break;

      case 'SET_TRAINING_SESSION_PARAMS':
       break;

      case 'LOCK_EYETRACKER':
        this.props.setGaze(false)
        break;

      case 'UNLOCK_EYETRACKER':
        this.props.setGaze(true)
        break;

      case 'LAST_CLIENT':
        if(!this.props.session_id){
          this.props.pause(this.props.location.pathname)
          browserHistory.replace(process.env.BASEURL+'/');
        }
        else{
          this.setState({lastClient:true})
        }
        break;

      case 'PLAY_VIDEO':
         let videocard = this.props.currPage.cards.filter((d)=>{return d.id == message.data.card_id})[0]
         this.playVideo(videocard);
        break;

      case 'PAUSE_VIDEO':
         this.pauseVideo();
        break;

      case 'END_VIDEO':
         //this.endVideo();
        break;

      case 'SHOW_ALIGN_ON':
        this.props.setAlignment(true);
        break;

      case 'SHOW_ALIGN_OFF':
        this.props.setAlignment(false);
        break;

      //play sound
      case 'PLAY_SOUND':
        //var audio = new Audio(process.env.BASEURL+'/audio/' + message.data.id + '.wav')
        let audio;
        switch(message.data.id){
          case "soft":
            audio = new Audio(softAlert);
            break;
          case "hard":
            audio = new Audio(hardAlert);
            break;
          case "harder":
            audio = new Audio(harderAlert);
            break;
        }
        audio.volume = 0.3
        audio.play()
        break;

      //shuffle cards
      case 'SHUFFLE':
        this.props.shuffle(message.cards)
        let shuffledPage = {
          ...this.props.currPage,
          cards: message.cards
        }

        this.props.socketServer.send(formatMessage("server_to_desktop", {type: "SHOW_PAGE", page: shuffledPage}));
        this.setState({selected:false, selcard:null})
        //this.setState({transitionToPage:null,video:false, videoCard:null, videoState:null, audioComponent:null,selected:false, selcard:null})

      break;

      case 'START_GAME':
        if(message.data.game){
          switch(message.data.game){
            case "bubbles":
              browserHistory.replace(process.env.BASEURL+'/bubbles/1');
              break;
            case "stars":
              console.log(message.data);
              browserHistory.replace(process.env.BASEURL+'/stars/'+message.data.level);
              break;
            case "sheeps":
              console.log(message.data);
              browserHistory.replace(process.env.BASEURL+'/sheeps/'+message.data.level);
              break;
            case "eggs":
              console.log(message.data);
              browserHistory.replace(process.env.BASEURL+'/eggs/'+message.data.level+"/"+message.data.fixingtime);
              break;
          }
        }
        break;


      case 'USER_CONNECTED':
        this.setState({lastClient:false})
        this.props.socketServer.send(formatMessage("server_to_desktop", {type: "CURRENT_PAGE", page: this.props.currPage, session: this.props.session_id, patient: this.props.patient}));
        break;

      case 'CHANGE_ROUTE':

        if(message.data.name == "cards"){
          browserHistory.push(process.env.BASEURL+'/cards');
        }
        break;
    }
  }

  send = ( socket, msg ) => {
    if( socket ){
      socket.send(msg);
    }
  }

  /** Calculate the scale to show the Page full screen */
  getPageItemScale = () => {
    let contentWidth = this.container ? this.container.clientWidth : -1;
    let contentHeight = this.container ? this.container.clientHeight : -1;

    if( contentWidth < 0 || contentHeight < 0){
        // Values not initialized
        return 1;
    }
    if( contentWidth/contentHeight >= pageTheme.ratio){
        // Width is greater than height, use height to calculate scale
        return contentHeight/pageTheme.height;
    }
    else {
        // Height is greater than width, use width to calculate scale
        return contentWidth/pageTheme.width;
    }
  }



  //Handle loading of next page or transition to end
  loadNextPage = (nextPage) =>{
      console.log(nextPage);
      //this.videoEnd();
      if(nextPage.type=="TRANSITION_TO_PAGE" || nextPage.type=="TRANSITION_TO_FEEDBACK_PAGE"){

        //new page incoming

        this.props.setTrainingSession (nextPage.data);
        let callback = (page) => {
          this.setState({presentation:false,video:false, videoCard:null, videoState:null, audioComponent:null,selected:false, selcard:null, transitionToPage:null})
          this.props.setFlow(page);

          //send page id to mobile, reset eyetracker fixation time
          this.props.socketServer.send(formatMessage("server_to_desktop", {type: "SHOW_PAGE", page: page}));
          this.props.socketEyeServer.send({type: "RESET_TIMER"});this.setState({})
        }
        switch(nextPage.type) {
          case "TRANSITION_TO_FEEDBACK_PAGE":
            // Show a feedback page, pass the information about the page after the feedback
            this.props.getFeedbackPage( nextPage.data.page_id, nextPage.data.next_page_id,
              (page) => {
                if( page ) {
                  page.feedback = true
                  callback(page);
                  if( page.cards && page.cards[0].content.type == "Video") {
                    // Automatically start the video
                    this.playVideo(page.cards[0],true);
                  }
                  else {
                    // Change page after a timeout
                    setTimeout(() => {
                      // Go to next page
                      this.setState({videoState:"end"});
                      this.props.setEndVideo(this.props.currPage.id,this.props.session_id,page.cards[0].id)
                    }, 3000)
                  }
                }
              }
            );
            break;
          default:
            this.props.getPage( nextPage.data.page_id, callback);
            break;
        }

     }

       //flow is over, reset store and notify mobile
       else if(nextPage.type=="TRANSITION_TO_END") {
          this.props.setReset(true);
          //this.setState({selected:false, selcard:null})
          this.setState({presentation:false,video:false, videoCard:null, videoState:null, audioComponent:null,selected:false, selcard:null, transitionToPage:null})
          // notify the mobile app
          this.props.socketServer.send(formatMessage("server_to_desktop",
              {type: "SHOW_END",}));

          //wait 10 seconds before definitively close the session
          setTimeout(()=> {
            if(this.props.reset){
              this.props.closeSession();
              this.props.socketServer.send(formatMessage("server_to_desktop", {type: "END_SESSION",}));
              if(this.state.lastClient){
                browserHistory.replace(process.env.BASEURL+'/');
              }
            }
          },1000)
       }

       else if(nextPage.type=="TRANSITION_TO_PRESENTATION_PAGE"){
        this.props.setTrainingSession (nextPage.data);
        let callback = (page) => {
          this.setState({
            video: false,
            videoCard: null,
            videoState: null,
            audioComponent: null,
            selected: false,
            selcard: null,
            transitionToPage: null,
            presentation:true
          })
          this.props.setFlow(page);

          //send page id to mobile, reset eyetracker fixation time
          this.props.socketServer.send(formatMessage("server_to_desktop", { type: "SHOW_PAGE", page: page }));
          this.props.socketEyeServer.send({ type: "RESET_TIMER" });
          setTimeout(()=>{synthetizeAudio(this.voice, page.cards[0].label)},3000)
          setTimeout(()=>{
            this.props.endExtraPage(this.props.currPage.id,this.props.session_id,page.cards[0].id);
          },10000)
          //this.setState({})
        }
        //this.setState({video:false, videoCard:null, videoState:null, audioComponent:null,selected:false, selcard:null, transitionToPage:null})
        this.props.getPage( nextPage.data.page_id, callback);

      }
  }


  // VIDEO CONTROL - play
  playVideo = (vcard,fastplay) => {
    console.log("playing video");
    if(!this.state.video){
      if(!fastplay) synthetizeAudio(this.voice, vcard.label)
      //select the card
      this.setState({"selcard":vcard.id, "selected":true})
      //wait before going to next page
      setTimeout(()=>{
        this.setState({video:true, videoCard:vcard, videoState:"play"})
      },fastplay ? 0 : 3000)


    }
    else{
    this.setState({videoState:"play"})
    }
  }

  // pause
  pauseVideo = () => {
    if(this.state.video){
      this.setState({videoState:"pause"})
    }
  }

  // end
  videoEnd = () => {
    if(this.state.video && this.state.videoState != "end"){
      console.log("ending video", this.state.videoCard);
      this.setState({videoState:"end"});
      if( this.props.currPage.feedback ) {
        this.props.endExtraPage(this.props.currPage.id, this.props.session_id, this.state.videoCard.id);
      }
      else {
        this.props.setEndVideo(this.props.currPage.id,this.props.session_id,this.state.videoCard.id)
      }

    }
  }

  //handle card touch
  onCardClick = (card, cardIndex, page) => {

      if( this.props.gazeOn && !this.state.selected){
        this.props.patientChoice("touch",this.props.currPage.id,this.props.session_id,card.id);
        }
        else {

        }
  }

  render () {
    return (
      <div className='reset'
      ref={(ref) => this.container = ref} >

        {this.props.reset ?
          <div className='redpoint'></div>
        : this.state.video ?
        <VideoItem
         id={"v-"+this.state.videoCard.card_id}
         src={this.state.videoCard.content.content}
         status={this.state.videoState}
         onEnd={this.videoEnd}
         />
        :  this.state.presentation ?
              <PresentationItem
                page={this.props.currPage}
                scale={this.getPageItemScale()}
                hideText={true}
              />

          :  <PageItem
            page={this.props.currPage} selected={this.state.selected ? this.state.selcard : null} hideText={true} scale={this.getPageItemScale()}
            onCardClick={this.onCardClick}
            />}
        {this.props.alignOn && <Aligner/>
        }
      </div>)
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.server.currentUser,
    currentPatient: state.server.currentPatient,
    socketServer: state.server.socketServer,
    socketEyeServer: state.server.nodeSocketServer,
    history: state.flow.history,
    currPage: state.flow.currPage,
    gazeOn: state.flow.gazeOn,
    reset: state.flow.reset,
    session_id: state.flow.session_id,
    selectFromApp: state.flow.selectFromApp,
    alignOn: state.flow.alignOn,
    alignPos: state.flow.alignPos,
    pro: state.flow.pro,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    autoSignin: (email, password, onServerMessage, onMobileMessage) => {dispatch(autoSignin(email, password, onServerMessage, onMobileMessage))},
    sendRawData: (obj,session_id) =>  {dispatch(sendRawData(obj,session_id))},
    audioFiles: (name,audio,session_id) =>  {dispatch(audioFiles(name,audio,session_id))},
    patientChoice: (type,page_id,session_id,card_id) => {dispatch(patientChoice(type,page_id,session_id,card_id))},
    transitionToEnd: (page_id,session_id) => {dispatch(setTransitionToEnd(page_id,session_id))},
    setPlayVideo: (page_id,session_id,card_id) => {dispatch(setPlayVideo(page_id,session_id,card_id))},
    setPauseVideo: (page_id,session_id,card_id) => {dispatch(setPauseVideo(page_id,session_id,card_id))},
    setEndVideo: (page_id,session_id,card_id) => {dispatch(setEndVideo(page_id,session_id,card_id))},
    endExtraPage: (page_id,session_id,card_id) => {dispatch(endExtraPage(page_id,session_id,card_id))},
    doSignout: () => {dispatch(doSignout())},
    setFlow: (pg) => {dispatch(setFlow(pg))},
    nextPage: (pg) => {dispatch(nextPage(pg))},
    setSelected: (cid) => {dispatch(setSelected(cid))},
    setReset: (val) => {dispatch(setReset(val))},
    closeSession: (val) => {dispatch(closeSession())},
    resetSelected: ()=>{dispatch(resetSelected())},
    getPage: (pageId, callback) => {dispatch(getPage(pageId, callback))},
    getFeedbackPage: (pageId, nextPageId, callback) => {dispatch(getFeedbackPage(pageId, nextPageId, callback))},
    setGaze: (val) => {dispatch(setGaze(val))},
    setAlignment: (val) => {dispatch(setAlignment(val))},
    setAlignmentPos: (val) => {dispatch(setAlignmentPos(val))},
    shuffle: (val) => {dispatch(shuffle(val))},
    pause: (val) =>{dispatch(pause(val))},
    setTrainingSession: (val) => {dispatch(setTrainingSession(val))}
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CognitiveView)
