import React from "react";

// third party

// styles
import pageTheme from "../styles/page-theme";
import girl from '../routes/Cognitive/assets/bambina-03.png';
const colorAccent = "#f44262";
const cardPadding = 2;
const maxTextScale = 14;
const minTextScale = 2;
const startTextScale = 17;
const maxTextImgScale = 9
const minTextImgScale = 3.5;
const startTextImgScale = 20;

/**
 * A single page element, containing any number of cards
 * This item is seen full screen on a PC, so it has a fixed aspect ratio of 1280x720
 * @param {any} page
 * @param {any[]} page.cards
 * @param {string} ip the ip address where to find the image
 * @param {float} scale default is 1.0
 */
export default class PresentationItem extends React.Component {

  computeTextScale = (lbl,img) => {

    let splt = img ? [lbl] : lbl.split(" ");

    let min = img ? minTextImgScale : minTextScale;
    let max = img ? maxTextImgScale : maxTextScale;
    let start = img ? startTextImgScale : startTextScale;

    let longest = splt.length > 1 ? splt.reduce(function (a, b) { return a.length > b.length ? a.length : b.length; }) : splt[0].length;
    let currScale = start - longest;

    function lerp (val, in_min, in_max, out_min, out_max) {
      return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    return lerp(longest,2,start,max,min);

  }

  render() {
    console.log("PresentationItem render", this.props);
    const padding = 6*this.props.scale;

    // Show the PlusButton on the selected card
    let selectedCard = this.props.selectedCardIndex != null ? this.props.page.cards[this.props.selectedCardIndex] : null;
    return (
      <div>
        <div className="cards-pan" style={{backgroundColor:this.props.page.background_color, width: "100%" /*pageTheme.width*this.props.scale*/, height: /*pageTheme.height*this.props.scale*/ "100%", padding: padding,
          borderWidth: 0, borderColor: "gray",
          flexDirection: "row", flexWrap: "wrap",
          position:"absolute", top:this.props.yPos, left:this.props.xPos}}>
          {this.props.page.cards.map((card,index) => {
            return(
              <Card card={card} hideText={this.props.hideText} cardIndex={index} textScale={this.computeTextScale} page={this.props.page} ip={this.props.ip}
                    key={index+card.id}
                    pageScale={this.props.scale}
                    pageWidth={pageTheme.width*this.props.scale}
                    pageHeight={pageTheme.height*this.props.scale}
                    />
            )
          })}
          <img
            style={{...styles.girlImage /*width:'${imageWidth}px'*/}}
            src={girl}
          />
        </div>
      </div>
    );
  }
}

/* A single card, an image with the card text */
function Card( props){
  console.log("card props", props);
  const totalScale = props.card.scale*props.pageScale;
  const imageWidth = (pageTheme.cardBaseWidth -cardPadding*2)*totalScale;
  return (
    <div
      className={["card-item","pres-item"].join(" ")}
      id={props.card.id}
      style={{padding: cardPadding, background:"white", width: pageTheme.cardBaseWidth*totalScale, height: pageTheme.cardBaseHeight*totalScale,
        position: "absolute", top: props.card.y_pos*window.innerHeight/*props.pageHeight*/, left: props.card.x_pos*window.innerWidth/*props.pageWidth*/,}}
       >


      {props.card.content.type!="Text"  &&
      <div className="card-wrapper">
        <div
          className="card-img-cont pres-img"
          style={{width:"100%",height:pageTheme.cardBaseWidth*totalScale,display:"flex", alignItems:"center",justifyContent:"center"}}>
          <img
            style={{...styles.cardImage /*width:'${imageWidth}px'*/}}
            src={ totalScale > 2 && props.card.content.type != "Video" ? props.card.content.content : props.card.content.content_thumbnail}
          />

        </div>
        { !props.hideText && <p className="card-title"
                                style={{lineHeight:(pageTheme.cardBaseHeight - pageTheme.cardBaseWidth)*totalScale+"px",fontWeight:"bold",fontSize: props.textScale(props.card.label,true)*totalScale, textAlign:"center"}}
        >
          {props.card.label.toUpperCase()}
        </p>}
      </div>
      }

      {(props.card.content.type=="Text") &&

      <div className="card-text-cont">
        <p className="card-text-title"
           style={{fontWeight:"bold",fontSize: props.textScale(props.card.label, false)*totalScale, textAlign:"center"}}
        >
          {props.card.label.toUpperCase()}
        </p>
      </div>
      }


    </div>
  );
}

const styles = {

  cardImage: {
    //width:"100%",
    pointerEvents:"none"
    //flex: 1,
    //resizeMode:'contain',
    //alignSelf: 'center',
    //backgroundColor:'white',
    //width: 50,
  },
  girlImage:{
    position:'absolute',
    right:'50px',
    bottom:'0',
    width:'auto',
    height:'50vh',
    pointerEvents:"none"
  },

  cardText: {
    color:'#000',
    textAlign: 'center',
    padding:3,
    //fontSize:10,
  },
  presItem:{
    pointerEvents:"none"
  },

  iconButtonContainer: {
    flexDirection : "row",
    justifyContent : "space-around",
    position : 'relative',
    top : -1,
    backgroundColor : colorAccent,
    borderRadius : 4,
  }

};
