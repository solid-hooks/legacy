// import { render } from 'solid-js/web'
import './styles.css'

import { $app } from '../src/utils'

import { StateProvider } from '../src/state/core'
import App from './App'
import { I18nProvider } from './i18n'

// render(() => <App />, document.getElementById('root')!)

$app(App)
  .use(StateProvider)
  .use(I18nProvider)
  .mount('#root')