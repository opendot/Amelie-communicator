import React from "react";

// third party

// styles
import pageTheme from "../styles/page-theme";

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
export default class PageItem extends React.Component {

    onPageClick = (e) => {
        if( this.props.onPageClick ){
            this.props.onPageClick( this.props.page, this.props.pageIndex );
        }
        else {
            e.preventDefault();
        }
    }

    onPageLongPress = () => {
        if( this.props.onPageLongPress ){
            this.props.onPageLongPress( this.props.page, this.props.pageIndex );
        }
    }


    computeTextScale = (lbl,img) => {

        let splt = img ? [lbl] : lbl.split(" ");

        if(!lbl) {
            // Prevent an empty array
            splt = [""];
        }

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
       //console.log("PageItem render", this.props);
        //const padding = 6*this.props.scale;
      console.log("scale",this.props.scale);
      const padding = 0;
      const sel = this.props.selected;


        // Show the PlusButton on the selected card
        let selectedCard = this.props.selectedCardIndex != null ? this.props.page.cards[this.props.selectedCardIndex] : null;
        return (
            <div>
                <div className="cards-pan" style={{backgroundColor:this.props.page.background_color, width: "100%" /*pageTheme.width*this.props.scale*/, height: /*pageTheme.height*this.props.scale*/ "100%", padding: padding,
                    borderWidth: this.props.selected ? 1 : 0, borderColor: "gray",
                    flexDirection: "row", flexWrap: "wrap",
                    position:"absolute", top:this.props.yPos, left:this.props.xPos}}
                    disabled={this.props.onPageClick || this.props.onPageLongPress ? false : true}
                    onClick={this.onPageClick} >
                    {this.props.page.cards.map((card,index) => {
                        return(
                            <Card card={card} sel={sel? sel==card.id?"true":"false":null} hideText={this.props.hideText} cardIndex={index} textScale={this.computeTextScale} page={this.props.page} ip={this.props.ip}
                                key={index+card.id}
                                pageScale={this.props.scale}
                                pageWidth={pageTheme.width*this.props.scale}
                                pageHeight={pageTheme.height*this.props.scale}
                                selected={this.props.selectedCardIndex && this.props.selectedCardIndex == index}
                                onCardClick={this.props.onCardClick} />
                        )
                    })}

                </div>
            </div>
        );
    }
}

/* A single card, an image with the card text */
function Card( props){
    //console.log("card props", props);
    const totalScale = props.card.scale*props.pageScale;
    const imageWidth = (pageTheme.cardBaseWidth -cardPadding*2)*totalScale;
    return (
        <div
            className={["card-item", props.sel=="true" ? "card-sel" : "", props.sel=="false" ? "card-nosel" : "", props.card.selectable == false ? "card-unselectable" : "" ].join(" ")}
            id={props.card.id}
            style={{padding: cardPadding, background:"white", width: pageTheme.cardBaseWidth*totalScale, height: pageTheme.cardBaseHeight*totalScale,
                position: "absolute", top: props.card.y_pos*window.innerHeight/*props.pageHeight*/, left: props.card.x_pos*window.innerWidth/*props.pageWidth*/,}}
            onClick={() => {
                if( props.onCardClick ){
                    return props.onCardClick(props.card, props.cardIndex, props.page);
                }
            }} >

            {(props.card.selection_action=="play_sound" && props.card.selection_sound) &&
                <audio id={props.card.id+"_audio"} controls="false" style={{display:'none'}}>
                    <source src={props.card.selection_sound}/>
                </audio>
            }

                {props.card.content.type!="Text"  &&
                <div className="card-wrapper">
                <div
                className="card-img-cont"
                style={{width:"100%",height:pageTheme.cardBaseWidth*totalScale,display:"flex"}}>
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
        width:"100%",
        //flex: 1,
        //resizeMode:'contain',
        //alignSelf: 'center',
        //backgroundColor:'white',
        //width: 50,
    },

    cardText: {
        color:'#000',
        textAlign: 'center',
        padding:3,
        //fontSize:10,
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
