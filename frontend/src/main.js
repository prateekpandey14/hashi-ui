import React from 'react'
import ReactDOM from 'react-dom'

import { createHistory } from 'history'
import { useRouterHistory } from 'react-router'

const browserHistory = useRouterHistory(createHistory)({
  // attempt to remove host+port from NOMAD_ENDPOINT
  // long term this could be done by splitting on "/" and take chunk "1..."
  basename: window['NOMAD_ENDPOINT'].replace(/^[-.a-zA-Z0-9]+:?[0-9]*/, '')
})

import { Provider } from 'react-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'

// import Perf from 'react-addons-perf'

import AppRouter from './router'
import configureStore from './store'

import '../assets/hashi-ui.css'
import '../assets/data-table.css'
import ErrorApp from './components/error_app'

// Perf.start()

let retries = 0;
let retryInterval;
let tapsEventInjected = false;

function injectTapEvents() {
  if (!tapsEventInjected) {
    injectTapEventPlugin();
    tapsEventInjected = true;
  }
}

function renderApp(store) {
  clearInterval(retryInterval);
  retryInterval = undefined;
  retries = 0;

  injectTapEvents();

  ReactDOM.render(
    <Provider store={ store }>
      <AppRouter history={ browserHistory } />
    </Provider>,
    document.getElementById('app')
   )
}

function bootApp() {
  configureStore()
    .then((store) => {
      renderApp(store)
    })
    .catch((err) => {
      injectTapEvents();

      // Start a retry loop if none exist
      if (!retryInterval) {
        retryInterval = window.setInterval(bootApp, 5000);
      }

      retries++;

      ReactDOM.render(
        <ErrorApp uncaughtException={ err } retryCount={ retries } />,
        document.getElementById('app')
      )
    })
}

bootApp();

// window.Perf = Perf
