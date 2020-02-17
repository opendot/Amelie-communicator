import { combineReducers } from 'redux'
import locationReducer from './location'
import flowReducer from './flows'
import serverReducer from './server'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    flow: flowReducer,
    server: serverReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
