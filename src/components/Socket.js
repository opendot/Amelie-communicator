import React from 'react'
import { browserHistory } from 'react-router'

const Socket = React.createClass({
  getInitialState () {
    return { messages: [] }
  },
  componentDidMount () {
    this.connection = new WebSocket('ws://localhost:4000')
    // listen to onmessage event
    this.connection.onmessage = evt => {
      let msg = JSON.parse(evt.data)

      if (msg.type === 'displaycards') {
        browserHistory.push({
          pathname: '/cards',
          state: {
            cards: JSON.parse(evt.data).data
          }
        })
      }

      else if (msg.type === 'displayreset') {
        store.dispatch(setCards(event.data));
      }

      else if (msg.type === 'setFlow') {
        browserHistory.push({
          pathname: '/',
        })
      }

      else if (msg.type === 'playsound') {
        var audio = new Audio('http://localhost:4000/audio/' + msg.data + '.wav')
        audio.volume = 0.1

        //audio.play()
      }
    }

    // for testing purposes: sending to the echo service which will send it back back
  },
  render: function () {
    return null
  }
})

export default Socket
