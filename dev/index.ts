// import { render } from 'solid-js/web'
import './styles.css'

import { $app } from '../src/utils'
import { GlobalStateProvider } from '../src/state/core'
import { I18nProvider } from '../src/i18n/core'
import App from './App'

// render(() => <App />, document.getElementById('root')!)

$app(App)
  .use(GlobalStateProvider)
  .use(I18nProvider)
  .mount('#root')
