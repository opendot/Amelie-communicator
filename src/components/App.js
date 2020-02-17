import React from 'react'
import { browserHistory, Router, Route } from 'react-router'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import Socket from './Socket.js'
import CardsView from '../routes/Cards/components/CardsView'
import CognitiveView from '../routes/Cognitive/components/CognitiveView'
import HomeView from '../routes/Home/components/HomeView'
import DrawingView from '../routes/games/drawing/DrawingsView'
import eggsView from '../routes/games/eggs/eggsView'
import constellationView from '../routes/games/constellation/constellationView'
import SheepView from '../routes/games/sheeps/sheepView'


class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
  }



  shouldComponentUpdate () {
    return false
  }

  render () {
    return (
      <Provider store={this.props.store}>
        <div style={{ height: '100%' }}>
          <Router history={browserHistory} children={this.props.routes}>
            <Route path={process.env.BASEURL+'/'} component={HomeView} />
            <Route path={process.env.BASEURL+'/cards'} component={CardsView} />
            <Route path={process.env.BASEURL+'/cognitive'} component={CognitiveView} />
            <Route path={process.env.BASEURL+'/bubbles/:level'} component={DrawingView} />
            <Route path={process.env.BASEURL+'/eggs/:level/:fixingtime'} component={eggsView} />
            <Route path={process.env.BASEURL+'/stars/:level'} component={constellationView} />
            <Route path={process.env.BASEURL+'/sheeps/:level'} component={SheepView} />
          </Router>
        </div>
      </Provider>
    )
  }
}

export default App
