import { ErrorBoundary, For } from 'solid-js'
import type { ParentProps } from 'solid-js'
import ShowI18n from './cards/i18n'
import ShowGlobalState from './cards/globalState'
import Basic from './cards/basic'
import ShowDirective from './cards/directive'
import Drag from './cards/drag'
import { TestSeq } from './cards/TestSeq'

type Prop = ParentProps<{ title: string }>

function Card(props: Prop) {
  return (
    <ErrorBoundary fallback="error">
      <div class="card">
        <h4>{props.title}</h4>
        {props.children}
      </div>
    </ErrorBoundary>
  )
}

function App() {
  const components = {
    'directive': <ShowDirective />,
    'signal / emit / watch(open devtools)': <Basic />,
    'i18n': <ShowI18n />,
    'global state': <ShowGlobalState />,
    'drag': <Drag />,
    'sequence': <TestSeq />,
  }
  return (
    <div class="flex">
      <For each={Object.entries(components)}>
        {([title, component]) => <Card title={title}>{component}</Card>}
      </For>
    </div>
  )
}

export default App
