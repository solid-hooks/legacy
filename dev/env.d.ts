import type { ModelDirective } from '../src/utils/model'

declare module 'solid-js' {
  namespace JSX {
    interface Directives extends ModelDirective {}
  }
}

export { }
