// import { render } from 'solid-js/web'
import './styles.css'

import { $app } from '../src'
import App from './App'

// render(() => <App />, document.getElementById('root')!)

$app(App)
  .mount('#root')