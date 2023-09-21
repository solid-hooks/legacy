// import { render } from 'solid-js/web'
import './styles.css'

import { $app } from '../src/utils'
import { StateProvider } from '../src/state/core'
import { I18nProvider } from '../src/i18n/core'
import App from './App'

// render(() => <App />, document.getElementById('root')!)

$app(App)
  .use(StateProvider)
  .use(I18nProvider)
  .mount('#root')