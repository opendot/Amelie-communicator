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
import _ from 'lodash';

/*ASSETS*/

import star from "./assets/star.mp3";
import mallet from "./assets/mallet.mp3";

import giraffe01 from "./assets/giraffe01.png";
import giraffe12 from "./assets/giraffe12.png";

import bear01 from "./assets/bear01.png";
import bear12 from "./assets/bear12.png";

import horse01 from "./assets/horse01.png";
import horse12 from "./assets/horse12.png";

import cow01 from "./assets/cow01.png";
import cow12 from "./assets/cow12.png";

import sheep01 from "./assets/sheep01.png";
import sheep12 from "./assets/sheep12.png";

import dog01 from "./assets/dog01.png";
import dog12 from "./assets/dog12.png";

import cat01 from "./assets/cat01.png";
import cat12 from "./assets/cat12.png";

import pig01 from "./assets/pig01.png";
import pig12 from "./assets/pig12.png";

import chicken01 from "./assets/chicken01.png";
import chicken12 from "./assets/chicken12.png";

import chick01 from "./assets/chick01.png";
import chick12 from "./assets/chick12.png";

import mouse01 from "./assets/mouse01.png";
import mouse12 from "./assets/mouse12.png";

import butterfly01 from "./assets/butterfly01.png";
import butterfly12 from "./assets/butterfly12.png";

import starend01 from "./assets/constellationend_star1.png";
import starend02 from "./assets/constellationend_star2.png";
import starend03 from "./assets/constellationend_star3.png";

import bg from "./assets/constellationbg2.png";
import bgend from "./assets/constellationend_bg.png";
import endchar from "./assets/constellationend_cha.png";
import { browserHistory } from 'react-router'
import Aligner from "../../../components/Aligner";


class ConstellationView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};

    this.cursor;
    this.centroids=[{x:window.innerWidth/6, y:window.innerHeight/3, busy:false},{x:window.innerWidth*3/6, y:window.innerHeight/3, busy:false},{x:window.innerWidth*5/6, y:window.innerHeight/3, busy:false},
      {x:window.innerWidth/3, y:window.innerHeight*2/3, busy:false},{x:window.innerWidth*2/3, y:window.innerHeight*2/3, busy:false}]

    this.scaling = window.innerWidth / 1920;
    this.spriteGroup;
    this.padding = 10;
    this.available = [];
    this.big = ['horse','bear','giraffe','cow'];
    this.medium = ['dog','cat','pig','sheep'];
    this.small = ['butterfly','mouse','chicken','chick'];
    this.lookables = [];
    this.level = this.props.params.level;
    this.created = false;

    this.ending;
    this.resetting;
    this.setend;
    this.Lookable = class {
      constructor (sup,type, pad) {
        this.sup = sup;
        this.spr = this.sup.p.createSprite(this.sup.p.random(pad,window.innerWidth-pad), this.sup.p.random(pad,window.innerHeight-pad));
        this.pad = pad;
        this.check = 0;
        this.opacity = 0;
        switch(type){
          case 'bear':

            this.spr.addAnimation("normal", bear01)
            this.spr.addAnimation("shining", bear12)
            this.spr.addAnimation("on", bear12)
            this.spr.scale = .65 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            //spriteGroup.add(bear);
            break;

          case 'chicken':
            this.spr.addAnimation("normal", chicken01)
            this.spr.addAnimation("shining", chicken12)
            this.spr.addAnimation("on", chicken12)
            this.spr.scale = .4 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'chick':

            this.spr.addAnimation("normal", chick01)
            this.spr.addAnimation("shining",chick12)
            this.spr.addAnimation("on", chick12)
            this.spr.scale = .7 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'horse':
            this.spr.addAnimation("normal", horse01)
            this.spr.addAnimation("shining", horse12)
            this.spr.addAnimation("on", horse12)
            this.spr.scale = .6 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'giraffe':
            this.spr.addAnimation("normal", giraffe01)
            this.spr.addAnimation("shining", giraffe12)
            this.spr.addAnimation("on", giraffe12)
            this.spr.scale = .6 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'cow':
            this.spr.addAnimation("normal", cow01)
            this.spr.addAnimation("shining", cow12)
            this.spr.addAnimation("on", cow12)
            this.spr.scale = .6 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'sheep':
            this.spr.addAnimation("normal", sheep01)
            this.spr.addAnimation("shining",sheep12)
            this.spr.addAnimation("on", sheep12)
            this.spr.scale = .5 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'cat':
            this.spr.addAnimation("normal", cat01)
            this.spr.addAnimation("shining",cat12)
            this.spr.addAnimation("on", cat12)
            this.spr.scale = .5 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'dog':
            this.spr.addAnimation("normal", dog01)
            this.spr.addAnimation("shining",dog12)
            this.spr.addAnimation("on", dog12)
            this.spr.scale = .5 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'pig':
            this.spr.addAnimation("normal", pig01)
            this.spr.addAnimation("shining", pig12)
            this.spr.addAnimation("on", pig12)
            this.spr.scale = .5 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'butterfly':
            this.spr.addAnimation("normal", butterfly01)
            this.spr.addAnimation("shining", butterfly12)
            this.spr.addAnimation("on", butterfly12)
            this.spr.scale = .5 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;

          case 'mouse':
            this.spr.addAnimation("normal", mouse01)
            this.spr.addAnimation("shining", mouse12)
            this.spr.addAnimation("on", mouse12)
            this.spr.scale = .5 * this.sup.scaling;
            this.spr.setCollider("circle",0,0,pad);
            break;
        }

        /* override sprite draw function */
        this.spr.draw = () => {

          let img = this.spr.animation.images[0];
          if (this.spr.getAnimationLabel() == "normal" || this.spr.getAnimationLabel() == "on") {
            this.sup.p.image(img, 0, 0);
          } else if (this.spr.getAnimationLabel() == "shining") {
            this.sup.p.tint(255, this.opacity);
            this.sup.p.image(img, 0, 0);
            this.sup.p.tint(255, 255);
            if(this.opacity < 255) this.opacity += 12;
          }
        }
        this.checkPosition();

        this.sup.lookables.push(this);
        this.sup.available = this.remove(this.sup.available,type);
        //console.log(lookables.length,type);
        this.sup.spriteGroup.add(this.spr);

      }


      checkCursor(curs){
        let me = this;

        if(curs.overlap(this.spr) && !this.check){
          //console.log(curs,curs.overlap(this.spr), this.check);
          //console.log("i'm over")
          this.spr.changeAnimation("shining");
          this.sup.effectsound.play();
          this.check = 1;
          setTimeout(function(){me.check = 2}, 1500);
        }
      }

      remove(array, element) {
        return array.filter(e => e !== element);
      }

      checkPosition(){
        let ob = _.sample(this.sup.centroids.filter(function(c) {return !c.busy}))

        this.spr.position.x = ob.x + this.sup.p.random(-window.innerWidth/15,window.innerWidth/15);
        this.spr.position.y = ob.y + this.sup.p.random(-window.innerWidth/15,window.innerWidth/15);
        console.log(this.spr.position.x,this.spr.position.y)
        ob.busy = true;


      }

    }
  }

  render() {
    return (
      <div>
      <div id="rootCanvas"></div>
    {this.props.alignOn && <Aligner/>}
      </div>)

  }

  componentDidMount() {
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

      case 'END_GAME':
        browserHistory.replace(process.env.BASEURL+'/cards');
        break;

      case 'LAST_CLIENT':
        this.props.pause(this.props.location.pathname)
        console.log("contellation, pathname", this.props.location.pathname)
        browserHistory.replace(process.env.BASEURL+'/');
        break;

      case 'SHOW_ALIGN_ON':
        this.props.setAlignment(true);
        break;

      case 'SHOW_ALIGN_OFF':
        this.props.setAlignment(false);
        break;

      case 'CHANGE_ROUTE':

        if(message.data.name == "cards"){
          browserHistory.replace(process.env.BASEURL+'/cards');
        }
        else if(message.data.name == "cognitive"){
          browserHistory.replace(process.env.BASEURL+'/cognitive');
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
          },500)

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

    p.update = () => {

    }

    p.preload = () => {
      this.endbg = p.loadSound(mallet)
      this.effectsound = p.loadSound(star)
      this.effectsound.setVolume(0.5);
      this.bg = p.loadImage(bg);
      this.bgend = p.loadImage(bgend);
    };

    p.setup = () => {
      p.frameRate(25);
      this.endGroup = new p.Group();
      this.canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      p.background(255, 243, 243);
      this.girlend = p.createSprite(1400,innerHeight - 200);
      this.girlend.addAnimation("oo", endchar)
      this.girlend.scale = 2;
      this.endGroup.add(this.girlend);
      this.starend = p.createSprite(840, 360);
      this.starend.addAnimation("normal", starend03, starend02,starend01)
      this.starend.scale = 2;
      this.endGroup.add(this.starend);
      this.ending = false;
      this.resetting = false;
      this.setend = false;
      this.spriteGroup = new p.Group();
      this.available = [];
      this.padding = 200;
      this.cursor = p.createSprite(0,0,20, 20);
      this.cursor.visible = false;


    };

    p.draw = () => {
      let me = this;

      p.background(this.bg);
      //bgm.play();

      this.cursor.position.x = this.eyex ? this.eyex : p.mouseX;
      this.cursor.position.y = this.eyey ? this.eyey : p.mouseY;


      if(!this.created) {
        p.fillAvailables();
        p.createSprites();
      }

      if (!this.resetting) {

        let end = true;
        this.lookables.forEach(function (d) {
          //console.log(d);
            d.checkCursor(me.cursor);
            if (d.check != 2) {
              end = false;
            }
        })

        if (end && !this.setend) {
          this.setend = true;
          setTimeout(function () {
            me.ending = true;
            me.endbg.play();
          }, 2000);
          setTimeout(function () {
            p.reset();
          }, 6000);

        }

        if (!this.ending) {
          this.spriteGroup.draw();
        }
        else this.endGroup.draw();
      }


      else {}
    }

    p.reset= () => {
      //console.log("resetting");
      this.resetting = true;
      this.ending = false;
      this.setend = false;
      this.lookables = [];
      this.available = [];
      this.spriteGroup = new p.Group();
      this.created = false;
      this.centroids.forEach(function(el){el.busy = false;})
      //p.createSprites();
    }

    p.createSprites= () => {
      while (this.lookables.length < this.level) {
        new this.Lookable(this,this.available[Math.floor(Math.random() * this.available.length)], this.padding);
      }
      this.resetting = false;
      this.created = true;
      //console.log("reset done");
    }

    p.fillAvailables= () => {

      //console.log("creating clones");
      let _big = _.clone(this.big);
      let _medium = _.clone(this.medium);
      let _small = _.clone(this.small);

      //console.log("checking level", this.level);

      switch(+this.level){
        case 1:
          this.available.push(_big.splice(_.random(_big.length - 1), 1)[0])
          break;

        case 2:
          this.available.push(_big.splice(_.random(_big.length - 1), 1)[0])
          this.available.push(_big.splice(_.random(_big.length - 1), 1)[0])
          break;

        case 3:

          this.available.push(_big.splice(_.random(_big.length - 1), 1)[0])
          this.available.push(_medium.splice(_.random(_medium.length - 1), 1)[0])
          this.available.push(_medium.splice(_.random(_medium.length - 1), 1)[0])
          break;

        case 4:
          this.available.push(_big.splice(_.random(_big.length - 1), 1)[0])
          this.available.push(_medium.splice(_.random(_medium.length - 1), 1)[0])
          this.available.push(_medium.splice(_.random(_medium.length - 1), 1)[0])
          this.available.push(_small.splice(_.random(_small.length - 1), 1)[0])
          break;

        case 5:
          this.available.push(_big.splice(_.random(_big.length - 1), 1)[0])
          this.available.push(_medium.splice(_.random(_medium.length - 1), 1)[0])
          this.available.push(_medium.splice(_.random(_medium.length - 1), 1)[0])
          this.available.push(_small.splice(_.random(_small.length - 1), 1)[0])
          this.available.push(_small.splice(_.random(_small.length - 1), 1)[0])
          break;
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

export default connect(mapStateToProps, mapDispatchToProps)(ConstellationView)

