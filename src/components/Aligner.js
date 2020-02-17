import React from "react";
import connect from "react-redux/es/connect/connect";


class Aligner extends React.Component {


  constructor(props) {
    super(props)
    this.timeout = false;

    this.state = {
      active: false,
      timer: 350
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.alignPos != this.props.alignPos) {

      this.setState({active: true});

      if (this.timeout) clearTimeout(this.timeout)

      this.timeout = setTimeout(() => {
        this.setState({active: false})
      }, this.state.timer)
    }
  }


  render() {
    return (
      <div className={"aligner " + (this.state.active ? 'a-on' : 'a-off')}
           style={{'top': this.props.alignPos * window.innerHeight + window.innerHeight / 2}}></div>
    )
  }
}

  const mapStateToProps = (state) => {
    return {
      alignPos: state.flow.alignPos
    };
  };
  const mapDispatchToProps = (dispatch) => {
    return {};
  };

export default connect(mapStateToProps, mapDispatchToProps)(Aligner)


