import type { ModelDirective } from '../src/hooks/model'

declare module 'solid-js' {
  namespace JSX {
    interface Directives extends ModelDirective {}
  }
}

export { }
