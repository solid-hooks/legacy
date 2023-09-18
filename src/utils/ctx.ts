import { DEV, createComponent, createContext, useContext } from 'solid-js'
import type { FlowProps, JSX } from 'solid-js'

type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S

type Provider = (props: FlowProps) => JSX.Element

export type ContextObject<
  N extends string,
  T,
  P extends string = Capitalize<N>,
> = {
  [K in `${P}Provider`]: Provider
} & {
  [K in `use${P}`]: () => T
}

/**
 * Context-Provider builder, if use context outside provider,
 * throw Error when DEV
 */
export function $ctx<T, N extends string>(name: N, fn: () => T): ContextObject<N, T> {
  const _name = name.charAt(0).toUpperCase() + name.slice(1)
  const tag = `$ctx::${name}`
  const ctx = createContext<T>(undefined, { name: tag })
  return {
    [`${_name}Provider`]: (props: FlowProps) => createComponent(ctx.Provider, {
      value: fn(),
      get children() {
        return props.children
      },
    }),
    [`use${_name}`]: () => {
      const _ctx = useContext(ctx)
      if (DEV && !_ctx) {
        throw new Error(`[${tag}]: provider is not set!`)
      }
      return _ctx!
    },
  } as ContextObject<N, T>
}