import { For } from 'solid-js'
import type { ParentProps } from 'solid-js'
import ShowI18n from './cards/i18n'
import ShowGlobalState from './cards/globalState'
import ShowWatch from './cards/watch'
import ShowDirective from './cards/directive'
import ShowIDB from './cards/idb'

type Prop = ParentProps<{ title: string }>

function Card(props: Prop) {
  return (
    <div class='card'>
      <h4>{props.title}</h4>
      {props.children}
    </div>
  )
}

function App() {
  const components = {
    'directive': <ShowDirective />,
    'watch(open devtools)': <ShowWatch />,
    'i18n': <ShowI18n />,
    'global state': <ShowGlobalState />,
    'IndexedDB': <ShowIDB />,
  }
  return (
    <div class='flex'>
      <For each={Object.entries(components)}>
        {([title, component]) => <Card title={title}>{component}</Card>}
      </For>
    </div>
  )
}

export default App
