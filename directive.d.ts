import type { ModelParam } from "./dist/index/index";

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      model: ModelParam
    }
  }
}

export {}