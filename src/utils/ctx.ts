import { DEV, createComponent, createContext, useContext } from 'solid-js'
import type { FlowProps, JSXElement } from 'solid-js'

type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S

export type ContextObject<
  N extends string,
  T,
  Props extends Record<string, unknown> | undefined,
  P extends string = Capitalize<N>,
> = {
  [K in `${P}Provider`]: (props: FlowProps<Props>) => JSXElement
} & {
  [K in `use${P}`]: () => T
}

/**
 * object style {@link https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider createContextProvider}
 *
 * if use context outside provider, throw `Error` when DEV
 * @param name context name
 * @param fn setup context function
 */
export function $ctx<T, N extends string>(
  name: N,
  fn: () => T,
): ContextObject<N, T, undefined>
/**
 * object style {@link https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider createContextProvider}
 *
 * @param name context name
 * @param fn setup context function
 */
export function $ctx<T, Props extends Record<string, unknown>, N extends string>(
  name: N,
  fn: (props: Props) => T,
): ContextObject<N, T | undefined, Props>
/**
 * object style {@link https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider createContextProvider}
 *
 * @param name context name
 * @param fn setup context function
 * @param defaultValue fallback value when context is not provided
 */
export function $ctx<T, Props extends Record<string, unknown>, N extends string>(
  name: N,
  fn: (props: Props) => T,
  defaultValue: T,
): ContextObject<N, T, Props>
export function $ctx<T, Props extends Record<string, unknown>, N extends string>(
  name: N,
  fn: (props?: Props) => T,
  defaultValue?: T,
): ContextObject<N, T, Props> {
  const _name = name.charAt(0).toUpperCase() + name.slice(1)
  const tag = `$ctx-${name}`
  const ctx = createContext(defaultValue, { name: tag })
  return {
    [`${_name}Provider`]: (props: FlowProps<Props>) => createComponent(ctx.Provider, {
      value: fn(props),
      get children() {
        return props.children
      },
    }),
    [`use${_name}`]: () => {
      const _ctx = useContext(ctx)
      if (DEV && !defaultValue && _ctx === undefined) {
        throw new Error(`[${tag}]: provider is not set!`)
      }
      return _ctx!
    },
  } as ContextObject<N, T, Props>
}
