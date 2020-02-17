import React from "react";
import p5 from "p5";
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.play";
import {
  autoSignin,
  doSignout,
} from '../../../store/server'
import {
  closeSession, setAlignment, setAlignmentPos,pause
} from '../../../store/flows'
import { connect } from 'react-redux'

import character01 from "./assets/character01.png";
import character02 from "./assets/character02.png";
import character03 from "./assets/character03.png";
import characterget01 from "./assets/characterget01.png";
import characterget02 from "./assets/characterget02.png";
import characterget03 from "./assets/characterget03.png";
import characterget21 from "./assets/characterget21.png";
import characterget22 from "./assets/characterget22.png";
import characterget23 from "./assets/characterget23.png";
import characterget31 from "./assets/characterget31.png";
import characterget32 from "./assets/characterget32.png";
import characterget33 from "./assets/characterget33.png";
import characterget41 from "./assets/characterget41.png";
import characterget42 from "./assets/characterget42.png";
import characterget43 from "./assets/characterget43.png";

import fanfare from "./assets/fanfare.mp3";
import yay from "./assets/yay.mp3";
import sheepsound from "./assets/sheep.mp3";
import sheepcatched from "./assets/sheepcatched.mp3";
import sheepjump from "./assets/sheepjump.mp3";

import grass from "./assets/grass.png";
import sheepend from "./assets/sheepend.png";
import sheepend1 from "./assets/sheepend1.png";
import sheepend2 from "./assets/sheepend2.png";
import green from "./assets/green.jpg";
import sh_1 from "./assets/sh_1.png";
import finished1 from "./assets/finished_1.png";
import finished2 from "./assets/finished_2.png";
import { browserHistory } from 'react-router'
import Aligner from "../../../components/Aligner";



class SheepView extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {};

    this.cursor;
    this.level = this.props.params.level;
    this.effectsound;
    this.effectsound2;
    this.ended;
    this.triggerend;
    this.sheep;

  }

  render () {

    return (<div id="rootCanvas">
      {this.props.alignOn && <Aligner/>}
    </div>)

  }

  componentDidMount () {
    this.props.socketServer.changeOnMessage(this.onServerMessage)
    this.props.socketEyeServer.changeOnMessage(this.onServerEyeMessage)

    new p5(this.sketch, document.getElementById("rootCanvas"));
    window.onresize = () => {
      this.canvas.resize(window.innerWidth, window.innerHeight);
    };
  }

  //Handle messages coming from the RAILS websocket
  onServerMessage = (e) => {
    const event = JSON.parse(e.data)
    if (event.type != "ping") {
      console.log("CardsView onServerMessage", event);
    }
    const identifier = event.identifier ? JSON.parse(event.identifier) : {};
    const message = event.message ? JSON.parse(event.message) : {};

    switch (event.type) {
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

      case 'START_GAME':
        if(message.data.game){
          switch(message.data.game){
            case "bubbles":
              browserHistory.replace(process.env.BASEURL+'/bubbles/1');
              break;
            case "stars":
              //console.log(message.data);
              browserHistory.replace(process.env.BASEURL+'/stars/'+message.data.level);
              break;
            case "sheeps":
              //console.log(message.data);
              browserHistory.replace(process.env.BASEURL+'/sheeps/'+message.data.level);
              break;
            case "eggs":
              //console.log(message.data);
              browserHistory.replace(process.env.BASEURL+'/eggs/'+message.data.level+"/"+message.data.fixingtime);
              break;
          }
        }
        break;

      case 'SHOW_ALIGN_ON':
        this.props.setAlignment(true);
        break;

      case 'SHOW_ALIGN_OFF':
        this.props.setAlignment(false);
        break;

      case 'LAST_CLIENT':
        this.props.pause(this.props.location.pathname)
        browserHistory.replace(process.env.BASEURL+'/');
        break;

      case 'END_GAME':
        browserHistory.replace(process.env.BASEURL+'/cards');
        break;


      case 'CHANGE_ROUTE':

        if(message.data.name == "cards"){
          browserHistory.push(process.env.BASEURL+'/cards');
        }
        else if(message.data.name == "cognitive"){
          browserHistory.push(process.env.BASEURL+'/cognitive');
        }
        break;

    }
  }

  onServerEyeMessage = (e) => {
    const event = JSON.parse(e.data)
    switch (event.type) {

      case 'fixation':
        break;

      case 'position':
        if(this.props.alignOn){
          this.props.setAlignmentPos(event.data.y);
        }
        break;

      case 'cursor':
        //add data to raw data accumulator, check presence on video play
        if (event.data && event.data.length == 2) {
          let obj = { x_position: event.data[0], y_position: event.data[1], timestamp: Date.now() }
          this.eyex = event.data[0] * window.innerWidth;
          this.eyey = event.data[1] * window.innerHeight;
          if(this.eyetimer) clearTimeout(this.eyetimer);
          this.eyetimer = setTimeout(() => {
            this.eyex = null;
            this.eyey = null;
          },500)

        }
        else {
          this.eyex = null;
          this.eyey = null;
        }
        break;

      default:
        break;
    }
  }

  componentWillUnmount() {
    this.p.remove();
  }

  // reload the entire sketch
  reload = () => {
    this.p.remove();
    new p5(this.sketch, document.getElementById("rootCanvas"));
  };
  // show the toolbar based on mouse movement

  sketch = p => {
    // save the p so we can remove it when we reload
    this.p = p;

    p.update = () => {

    }

    p.preload = () => {
      this.bee = p.loadSound(sheepsound);
      this.sound_catched =  p.loadSound(sheepcatched);
      this.jump =  p.loadSound(sheepjump);
      this.effectsound =  p.loadSound(yay)
      this.effectsound2 =  p.loadSound(fanfare)
      this.effectsound.setVolume(1);
      this.effectsound2.setVolume(1.5);
      this.green = p.loadImage(green);
      this.sheepend = p.loadImage(sheepend);
    };

    p.clean = () => {
      this.player.visible = false;
      this.sheep.visible = false;
      this.chaend.visible = true;
      this.bg.visible = false;
      this.ended = true;
      this.effectsound.play()
      this.effectsound2.play()
      setTimeout(p.reset, 4000);
    }

    p.setup = () => {

      this.ended = false;
      this.triggerend = false;
      p.frameRate(35);
      this.canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      this.bg = new p.Group();
      for (let i = 0; i < 30; i++) {
        let rock = p.createSprite(p.random(100, window.innerWidth - 100), p.random(100, window.innerHeight - 100));
        rock.addAnimation("normal", grass);
        this.bg.add(rock);
      }
      this.player = p.createSprite(400, 200, 0, 0);
      let myAnimation = this.player.addAnimation("floating", character01, character02, character03);
      this.player.addAnimation("collecting", characterget01, characterget02, characterget03);
      this.player.addAnimation("collecting2", characterget21, characterget22, characterget23);
      this.player.addAnimation("collecting3", characterget31, characterget32, characterget33);
      this.player.addAnimation("collecting4", characterget41, characterget42, characterget43);
      this.player.addAnimation("finish", finished1, finished2);
      this.player.scale = 1.5;
      myAnimation.offY = 18;

      this.bgend = p.loadImage(sheepend);

      this.chaend = p.createSprite(950, 600);
      this.chaend.addAnimation("collecting", sheepend1, sheepend2);
      this.chaend.scale = 0.15;
      this.chaend.visible = false;
      p.createSheeps();
    };

    p.getCoin = (player, sh) => {
      sh.remove();
      player.changeAnimation("collecting");
      player.animation.rewind();
      this.score += 1;
      this.sound_catched.play();
    }

    p.createSheeps = () => {
      this.sheep = new p.Group();
      for (let i = 0; i < this.level; i++) {
        let sh = p.createSprite(p.random(100, p.width - 100), p.random(100, p.height - 100));
        sh.addAnimation("normal", sh_1);
        sh.immovable = true;
        sh.scale = 1.1
        this.sheep.add(sh);
      }
    }
      p.reset = () => {
        p.createSheeps();
        this.player.visible = true;
        this.sheep.visible = true;
        this.chaend.visible = false;
        this.bg.visible = true;
        this.triggerend = false;
        this.ended = false;
        this.score = 0;
        this.player.changeAnimation("floating");
      }

      p.draw = () => {
        let me = this;
        if (!this.ended) {
          p.background(this.green);
        }
        else {
          p.background(this.sheepend);
        }

//mouse trailer, the speed is inversely proportional to the mouse distance
        this.player.velocity.x = this.eyex ? (this.eyex - this.player.position.x) / 40 : (p.mouseX - this.player.position.x) / 40;
        this.player.velocity.y = this.eyey ? (this.eyey - this.player.position.y) / 40 : (p.mouseY - this.player.position.y) / 40;

        this.player.overlap(this.sheep, p.getCoin);

        this.sheep.forEach(function(e){
          if(e.velocity.y == -1) e.velocity.y = +10;
          else if(e.velocity.y < 0) e.velocity.y++;
          else if(e.velocity.y > 0) e.velocity.y--;
          else if(e.velocity.y == 0){

            if(Math.random() > 0.993 + me.sheep.length*0.000999) {
              e.velocity.y = -10;
              me.jump.play();
            }
          }
        })

        p.drawSprites();

        //limit the player movements
        if (this.player.position.x < 0)
          this.player.position.x = 0;
        if (this.player.position.y < 0)
          this.player.position.y = 0;
        if (this.player.position.x > window.innerWidth)
          this.player.position.x = window.innerWidth;
        if (this.player.position.y > window.innerHeight)
          this.player.position.y = window.innerHeight;

//get point
        p.fill(0);
        p.noStroke();

        if (this.sheep.length > 0) {
          //text("sheep get :"+score, width/5, height/8);
          this.bee.stop();

        }

        else if (!this.triggerend) {
          this.triggerend = true;
          this.player.changeAnimation("finish");
          //player.velocity.x = 3;

          setTimeout(p.clean, 2000)

        }

        if (this.score == 2) {
          this.player.changeAnimation("collecting2");
          //player.animation.rewind();
        }

        if (this.score == 3) {
          this.player.changeAnimation("collecting3");
          //player.animation.rewind();
        }

        if (this.score == 4) {
          this.player.changeAnimation("collecting4");
          //player.animation.rewind();
        }
      }

    }

}

const mapStateToProps = (state) => {
  return {
    currentUser: state.server.currentUser,
    currentPatient: state.server.currentPatient,
    socketServer: state.server.socketServer,
    socketEyeServer: state.server.nodeSocketServer,
    history: state.flow.history,
    gazeOn: state.flow.gazeOn,
    alignOn: state.flow.alignOn
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    autoSignin: (email, password, onServerMessage, onMobileMessage) => {dispatch(autoSignin(email, password, onServerMessage, onMobileMessage))},
    doSignout: () => {dispatch(doSignout())},
    closeSession: (val) => {dispatch(closeSession())},
    setAlignment: (val) => {dispatch(setAlignment(val))},
    setAlignmentPos: (val) => {dispatch(setAlignmentPos(val))},
    pause: (val) =>{dispatch(pause(val))},

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SheepView)

