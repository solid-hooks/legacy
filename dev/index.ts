// import { render } from 'solid-js/web'
import './styles.css'

import { useApp } from '../src/hooks'
import { GlobalStateProvider } from '../src/state/core'
import { I18nProvider } from './i18n'
import App from './App'

// render(() => <App />, document.getElementById('root')!)

useApp(App)
  .use(GlobalStateProvider)
  .use(I18nProvider)
  .mount('#root')
