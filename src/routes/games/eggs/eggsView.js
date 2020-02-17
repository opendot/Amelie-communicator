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

//assets
import yay from "./assets/yay.mp3";
import fanfare from "./assets/fanfare.mp3";
import clucks from "./assets/clucks.mp3";
import crow from "./assets/crow.mp3";
import shake from "./assets/eggshake.mp3";
import mallet from "./assets/mallet.mp3";
import hatching01 from "./assets/hatching01.png";
import hatching02 from "./assets/hatching02.png";
import hatching03 from "./assets/hatching03.png";
import hatching04 from "./assets/hatching04.png";
import hatching05 from "./assets/hatching05.png";
import chic1 from "./assets/chic01.png";
import chic3 from "./assets/chic03.png";
import chicgrowing1 from "./assets/chicgrowing1.png";
import chicgrowing2 from "./assets/chicgrowing2.png";
import chicken1 from "./assets/chicken01.png";
import chicken3 from "./assets/chicken03.png";
import eggendgirl_1 from "./assets/eggendgirl_1.png";
import hatchery1 from "./assets/hachery_1.png";
import hatchery3 from "./assets/hachery_3.png";
import jumpch1 from "./assets/jumpch_1.png";
import jumpch2 from "./assets/jumpch_2.png";
import jumpch3 from "./assets/jumpch_3.png";
import effect1 from "./assets/effect_1.png";
import effect2 from "./assets/effect_2.png";
import effect3 from "./assets/effect_3.png";
import eggbg from "./assets/eggbg.png";
import eggbgend from "./assets/eggbg_end.png";
import { browserHistory } from 'react-router'
import Aligner from "../../../components/Aligner";




class EggsView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.eggs = []
    this.base = window.innerHeight * 0.8;
    this.timer = 0;
    this.level = this.props.params.level;
    this.fixingTime = this.props.params.fixingtime ? this.props.params.fixingtime : 2000;
    this.ending = false;
    this.added = false;
    this.Egg = class {
      constructor(sup,num, tot) {
        this.sup = sup;
       // console.log(num, tot, window.innerWidth * ((num + 1) / (tot + 1)))
        this.egg = this.sup.p.createSprite(window.innerWidth * ((num + 1) / (+tot + 1)), window.innerHeight * 0.72);
        this.egg.addAnimation("normal", this.sup.startAni);
        this.egg.addAnimation("hatching", this.sup.hatchAni);
        this.egg.addAnimation("hatched", this.sup.chickAni);
        this.egg.addAnimation("chickgrowing", this.sup.growAni);
        this.egg.addAnimation("chicken", this.sup.adultAni);
        //this.egg.scale = .8 + (0.5 - tot/10);
        this.egg.scale =  -0.38*tot +2.76; // derived from linear regression
        this.egg.position.y = window.innerHeight * 0.62 + Math.pow(tot,3);
        this.sup.playgroup.add(this.egg);
        this.check = 0; //boolean swtich 1= 1st egg hatched
        this.check1 = 0;
        this.timer = 0;
        this.hatchTimer = null;
        this.growTimer = null;
        this.rotate = 0;
        this.rotverse = 1;
        this.hatching = false;
        this.growing = false;
        this.che1done = 0;
      }

      hatched() {
        //console.log("HATCHED!!");
        this.egg.changeAnimation("hatched");
        this.egg.scale = -.2*this.sup.level +2;
        this.egg.shapeColor = this.sup.p.color(255, 0, 0);
        this.check = 1;
        this.egg.position.y = window.innerHeight * 0.57 + Math.pow(this.sup.level,3);
        this.sup.mySound.setVolume(0.5);
        this.sup.mySound.play();
      }

      rotating(prob) {
        if(this.hatching) {
          this.rotate = 0;
          this.egg.rotation = 0;
          return;
        }
        else if(!this.rotate){
          if(Math.random() > 0.99 + this.sup.level * 0.0015) {
            this.rotate = 1;
            this.sup.eggshake.play();
          }
        }
        else{
          if(this.rotate % 4 == 0) this.rotverse = 1;
          else if(this.rotate % 4 >= 2) this.rotverse = -1;
          this.egg.rotation += 10 * this.rotverse;
          this.rotate++;

          if(this.rotate >= 13) {
            this.rotate = 0;
            this.egg.rotation = 0;
          }
        }
      }

      grown() {
        this.egg.changeAnimation("chicken");

        this.egg.scale = -.15*this.sup.level +1.5;
        this.egg.position.y = window.innerHeight * 0.52 + Math.pow(this.sup.level,3);

        this.sup.mySound2.play()
        this.check1++;
        this.che1done = 1;
        this.check = 2
      }

      reset() {
        this.check = 0; //boolean swtich 1= 1st egg hatched
        this.check1 = 0;
        this.timer = 0;
        this.che1done = 0;
        this.egg.scale = -0.38*this.sup.level +2.76;
        this.hatching = false;
        this.growing = false;
        this.hatchTimer = null;
        this.growTimer = null;
        this.egg.position.y =  window.innerHeight * 0.62 + Math.pow(this.sup.level,3);
      }
    }
  }

  render() {

    return (  <div id="rootCanvas">
      {this.props.alignOn && <Aligner/>}

    </div>)

  }

  componentDidMount() {
    console.log("changing listeners")
    this.props.socketServer.changeOnMessage(this.onServerMessage)
    this.props.socketEyeServer.changeOnMessage(this.onServerEyeMessage)
    console.log("changed listeners")
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

      case 'END_GAME':
        browserHistory.replace(process.env.BASEURL+'/cards');
        break;

      case 'LAST_CLIENT':
        this.props.pause(this.props.location.pathname)
        browserHistory.replace(process.env.BASEURL+'/');
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
    switch(event.type){

      case 'fixation':
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
          this.eyex = event.data[0] * window.innerWidth;
          this.eyey = event.data[1] * window.innerHeight;

          if(this.eyetimer) clearTimeout(this.eyetimer);
          this.eyetimer = setTimeout(() => {
            this.eyex = null;
            this.eyey = null;
            },100)

        }
        else{
          this.eyex = null;
          this.eyey = null;
        }
        break;

      default:
        //console.log(event);
        break;
    }
  }


  componentWillUnmount() {
    this.p.remove();
    //this.props.doSignout();
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




    p.preload = () => {
      p.soundFormats('mp3', 'ogg');
      this.effectsound = p.loadSound(yay)
      this.effectsound2 = p.loadSound(fanfare)
      this.effectsound.setVolume(1);
      this.effectsound2.setVolume(1.5);
      this.mySound = p.loadSound(clucks);
      this.mySound2 = p.loadSound(crow);
      this.mySound2.setVolume(0.5);
      this.eggshake = p.loadSound(shake);
      this.endingSound = p.loadSound(mallet);
      this.startAni = p.loadAnimation(hatching01);
      this.hatchAni = p.loadAnimation(hatching01,hatching02,hatching03,hatching04,hatching05);
      this.chickAni = p.loadAnimation(chic1, chic3);
      this.growAni = p.loadAnimation(chic1, chicgrowing1, chicgrowing2)
      this.adultAni = p.loadAnimation(chicken1, chicken3);
      this.girlend = p.loadAnimation(eggendgirl_1);
      this.hatchend = p.loadAnimation(hatchery1,hatchery3);
      this.chickend = p.loadAnimation(jumpch1, jumpch2,jumpch3);
      this.effend = p.loadAnimation(effect3, effect2, effect1);
      this.endbg = p.loadImage(eggbgend);
      this.bg = p.loadImage(eggbg);
    };

    p.setup = () => {
      p.frameRate(23);
      this.playgroup = new p.Group();
      this.endgroup = new p.Group();
      this.cursor2 = p.createSprite(0, 0,20,20);
      //this.cursor2.addAnimation("normal", pointer1, pointer2);
      this.cursor2.scale = 1;



      for (var i = 0; i < this.level; i++) {
        this.eggs.push(new this.Egg(this,i, this.level));
      }
      this.canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      p.loadEndAnimations();
    };


    p.clean = () => {
      let me = this;
      if (!this.added) {
        //showEnd();
        setTimeout(function(){
          me.effectsound.play();
          me.effectsound2.play();
        },500)
        setTimeout(p.reset,7000);
        this.added = true;
      }
      this.ending = true;
    }

    p.draw = () => {


      //this.cursor2.draw();
      //console.log(this.eyex,this.eyey);

      if (!this.ending) {
        this.cursor2.position.x = this.eyex ? this.eyex : p.mouseX;
        this.cursor2.position.y = this.eyey ? this.eyey : p.mouseY;
        p.drawChicken();
      }
      else {
        p.background(this.endbg);
        this.endgroup.draw();
      }

      //p.fill("#ff0000");
      //p.ellipse(this.eyex,this.eyey,20,20);

    }

    p.drawChicken = () => {

        p.background(this.bg);
      //console.log(this.eyex, this.eyey);
      //this.cursor2.position.x = this.eyex ? this.eyex : p.mouseX;
      //this.cursor2.position.y = this.eyey ? this.eyey : p.mouseY;
      //p.drawSprite(this.cursor2);


      //Rule text
      for (let egg of this.eggs) {
        if (egg.check == 0) {

          egg.rotating();

          if (this.cursor2.overlap(egg.egg)) {
            if(!egg.hatching){
              egg.egg.changeAnimation("hatching");
              egg.hatching = true;
              console.log("setting timeout for hatch, timer is ", this.fixingTime);
              egg.hatchTimer = setTimeout(() =>{
                egg.check = 1;
                egg.hatched();
                console.log("hatched");
              },this.fixingTime)
            }

            //egg.timer++;

            /*if (egg.timer == 40) {
              //print("1st egg is hatched!");
              egg.check = 1
              egg.hatched();
            }*/

          }

          else {
            egg.egg.changeAnimation("normal");
            //egg.timer = 0;
            if(egg.hatchTimer) {
              console.log("clearing timeout", egg.hatchTimer);
              clearTimeout(egg.hatchTimer)
              egg.hatchTimer = null;
            }
            egg.hatching = false;
          }

        }


        if (egg.check == 1) {

          if (this.cursor2.overlap(egg.egg)) {
            if(!egg.growing) {
              egg.egg.changeAnimation("chickgrowing");
              egg.growing = true;
              console.log("setting timeout for grow, timer is ", this.fixingTime);
              egg.growTimer = setTimeout(() =>{egg.grown()}, this.fixingTime)

            }
            /*egg.check1++;

            if (egg.check1 == 40) {
              //print("1st egg is grown!")
              egg.grown();
            }*/
          }

          else {
            egg.egg.changeAnimation("hatched");
            if(egg.growTimer) {
              console.log("clear grow timeout");
              clearTimeout(egg.growTimer)
              egg.growTimer = null;
            }
            egg.check1 = 0;
            egg.growing = false;
          }
        }

        if (egg.check == 2) {

          egg.egg.changeAnimation("chicken");
        }
      }

      let final = true;
      for (let egg of this.eggs) {
        if (!egg.che1done) {
          final = false;
        }
      }

      if (final) {
        setTimeout(p.clean, 3000);
      }
      this.playgroup.draw();

    }


    p.loadEndAnimations=()=>{
      this.girl = p.createSprite(p.width * 0.8, p.height * 0.55);
      this.girl.addAnimation("collecting", this.girlend);
      this.girl.scale = 0.8
      this.endgroup.add(this.girl);


      this.hatchery = p.createSprite(p.width * 0.47, p.height * 0.55);
      this.hatchery.addAnimation("normal", this.hatchend)
      this.hatchery.scale = .8;
      this.endgroup.add(this.hatchery);

      this.jumpch = p.createSprite(p.width * 0.25, p.height * 0.52);
      this.jumpch.addAnimation("normal", this.chickend)
      this.jumpch.scale = .2;
      this.endgroup.add(this.jumpch);

      this.effect = p.createSprite(p.width * 0.52, p.height * 0.32);
      this.effect.addAnimation("normal", this.effend)
      this.effect.scale = .2;
      this.effect.animation.rewind();
      this.endgroup.add(this.effect);
    }

    p.showEnd=() =>{
      this.added = true;
    }

    p.reset=() =>{
      for (let egg of this.eggs) {
        egg.reset();
      }
      this.ending = false;
      this.added = false;
    }
  //TODO
  //draw, drawchicken, sounds, clean, cursor

  };
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

export default connect(mapStateToProps, mapDispatchToProps)(EggsView)

