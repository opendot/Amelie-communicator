import React from "react";
import p5 from "p5";
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.play";
import {
  autoSignin,
  doSignout,
} from '../../../store/server'
import {
  closeSession, setAlignment, setAlignmentPos, pause
} from '../../../store/flows'
import { connect } from 'react-redux'
import $ from 'jquery'
import { browserHistory } from 'react-router'
import pop from "./assets/bubblepop.mp3"
import pop2 from "./assets/bubblepop3_2.mp3"
import Aligner from "../../../components/Aligner";


class DrawingsView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.MAX_PARTICLES = 100;
    this.COLORS = [ '#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423' ];
    this.xcoord,this.ycoord;
    this.lastx,this.lasty;
    this.lerpdist = 10;

//SOUNDS
    this.pop;
    this.pop2;

//ARRAYS
    this.particles = [];
    this.pool = [];

//VARIABLES
    this.wander1 = 0.5;
    this.wander2 = 2.0;
    this.drag1 = .9;
    this.drag2 = .99;
    this.force1 = 2;
    this.force2 = 8;
    this.theta1 = -0.5;
    this.theta2 = 0.5;
    this.size1 = 5;
    this.size2 = 180;
    this.sizeScalar = 0.97;
    this.effect = 0;

    this.Particle = class {
      constructor (sup, x, y, size) {
        this.alive = true;
        this.sup = sup;
        this.size = size || 10;
        this.wander = 0.15;
        this.theta = this.sup.p.random(this.sup.p.TWO_PI);
        this.drag = 0.92;
        this.color = '#fff';
        this.location = this.sup.p.createVector(x || 0.0, y || 0.0);
        this.velocity = this.sup.p.createVector(0.0, 0.0);

      }

      move() {
        this.location.add(this.velocity);
        this.velocity.mult(this.drag);
        this.theta += this.sup.p.random(this.sup.theta1, this.sup.theta2) * this.wander;
        this.velocity.x += this.sup.p.sin(this.theta) * 0.1;
        this.velocity.y += this.sup.p.cos(this.theta) * 0.1;
        this.size *= this.sup.sizeScalar;
        this.alive = this.size > 0.5;
      }

      show() {
        //arc( this.location.x, this.location.y, this.size, 0, TWO_PI );
        this.sup.p.fill(this.color);
        this.sup.p.noStroke();
        this.sup.p.ellipse(this.location.x, this.location.y, this.size, this.size);
      }
    }
  }

  render() {

    return ( <div>
      <div id="rootCanvas"></div>

        {this.props.alignOn && <Aligner/>}
      </div>
      )

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
        console.log(event.data);
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
        console.log(event);
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


    p.spawn = (x,y) =>{
      var particle, theta, force;
      if ( this.particles.length >= this.MAX_PARTICLES ) {
        this.pool.push( this.particles.shift() );
      }
      particle = new this.Particle(this,this.xcoord, this.ycoord, p.random(this.size1,this.size2));
      particle.wander = p.random( this.wander1, this.wander2 );
      particle.color = p.random( this.COLORS );
      particle.drag = p.random( this.drag1, this.drag2 );
      theta = p.random( p.TWO_PI );
      force = p.random( this.force1, this.force2 );
      particle.velocity.x = p.sin( theta ) * force;
      particle.velocity.y = p.cos( theta ) * force;
      this.particles.push( particle );
      //effect = 0
      if(particle.color == "#F38630" && Math.random()>0.8)
      {
        this.popsound.play()
        this.effect = 1
      }

      else if(particle.color == "#E0E4CC"&& Math.random()>0.8)
      {
        this.popsound2.play()
        this.effect = 3
      }

      else
        this.effect =0
    }

    p.update = () =>{
      var i, particle;

      for ( i = this.particles.length - 1; i >= 0; i-- ) {
        particle = this.particles[i];
        if ( particle.alive ) {
          particle.move();

        } else {
          this.pool.push( this.particles.splice( i, 1 )[0] );
        }
      }
    }

    p.moved = () =>{

      var interpolated = [];
      var v1 = p.createVector(this.lastx, this.lasty);
      var v2 = p.createVector(this.xcoord, this.ycoord);

      if(this.xcoord || this.ycoord) {
        var dst = p.dist(this.lastx,this.lasty,this.xcoord,this.ycoord);

        if(dst>=this.lerpdist) {
          var steps = Math.trunc(dst/this.lerpdist);
          for(var j = 1; j < steps; j++){
            var point = v1.lerp(v2,j/steps+1);
            interpolated.push(point);
          }
        }

        var particle, max, i;
        max = p.random( 1, 2 );

        for ( let k = 0; i < interpolated.length; k++ ) {
          p.spawn( interpolated[k].x, interpolated[k].y );
        }

        for ( i = 0; i < max; i++ ) {
          p.spawn( this.xcoord, this.ycoord );
        }
      }
    }

    p.preload = () => {

        this.popsound = p.loadSound(pop)
        this.popsound2 = p.loadSound(pop2)

      this.popsound.playMode('sustain');
      this.popsound.setVolume(0.5);
      this.popsound2.setVolume(0.1);
        //popbg.setVolume(0.9);

    };

    p.setup = () => {

      this.canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      p.background(255,243,243);
    };

    p.draw = () => {

      this.lastx = this.xcoord;
      this.lasty = this.ycoord;
      this.xcoord = this.eyex!=null ? this.eyex : p.mouseX;
      this.ycoord = this.eyey!=null ? this.eyey : p.mouseY;

//      console.log(this.eyex,this.eyey)


      p.update();
      p.drawingContext.globalCompositeOperation = 'normal';
      p.background(0);
      p.drawingContext.globalCompositeOperation = 'lighter';
      for (var i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].show();
      }
      p.moved();
    }
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
    alignOn: state.flow.alignOn,
    alignPos: state.flow.alignPos
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

export default connect(mapStateToProps, mapDispatchToProps)(DrawingsView)

