import { DEV, createComponent, createContext, useContext } from 'solid-js'
import type { Accessor, FlowProps, JSXElement } from 'solid-js'

type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S

export type ContextObject<
  N extends string,
  T,
  Props extends Record<string, unknown> = {},
  P extends string = Capitalize<N>,
> = {
  [K in `${P}Provider`]: (props: FlowProps<Props>) => JSXElement
} & {
  [K in `use${P}Context`]: () => T
}

/**
 * object style useContext and Provider
 *
 * if use context outside provider, throw `Error` when DEV
 * @param name context name
 * @param fn setup context function
 * @see https://github.com/subframe7536/solid-dollar#usecontextprovider
 */
export function useContextProvider<T, N extends string>(
  name: N,
  fn: Accessor<T>,
): ContextObject<N, T>
/**
 * object style {@link https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider createContextProvider}
 *
 * @param name context name
 * @param fn setup context function
 * @see https://github.com/subframe7536/solid-dollar#usecontextprovider
 */
export function useContextProvider<T, Props extends Record<string, unknown>, N extends string>(
  name: N,
  fn: (props: Props) => T,
): ContextObject<N, T | undefined, Props>
/**
 * object style {@link https://github.com/solidjs-community/solid-primitives/tree/main/packages/context#createcontextprovider createContextProvider}
 *
 * @param name context name
 * @param fn setup context function
 * @param value fallback value when context is not provided
 * @see https://github.com/subframe7536/solid-dollar#usecontextprovider
 */
export function useContextProvider<T, Props extends Record<string, unknown>, N extends string>(
  name: N,
  fn: (props: Props) => T,
  value: T,
): ContextObject<N, T, Props>
export function useContextProvider<T, Props extends Record<string, unknown>, N extends string>(
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
    [`use${_name}Context`]: DEV
      ? () => {
          const _ctx = useContext(ctx)
          if (!defaultValue && _ctx === undefined) {
            throw new Error(`[${tag}]: provider is not set!`)
          }
          return _ctx
        }
      : () => useContext(ctx)!,
  } as ContextObject<N, T, Props>
}
