import React from "react";

// styles
import pageTheme from "../styles/page-theme";

export default class VideoItem extends React.Component {


pauseVideo = () => {
    let video = document.getElementById(this.props.id);
    video.pause();
}


resumeVideo = () => {
    let video = document.getElementById(this.props.id);
    video.play();
}

componentDidMount(){
    this.resumeVideo();
}

componentWillReceiveProps(nextProps){

    if(this.props.status != nextProps.status){
        if(nextProps.status=="play"){
            console.log("go video, go");
            this.resumeVideo();
        }
        else if(nextProps.status=="pause"){
            console.log("stop video, stop");
            this.pauseVideo();
        }
    }

}
    
render() {
    return (
        <video width={window.innerWidth} height={window.innerHeight} 
        src={this.props.src}
        id={this.props.id} 
        onEnded={this.props.onEnd} 
        onPause={this.props.onPause} 
        onPlay={this.props.onPlay}>
        </video>)    
}
}