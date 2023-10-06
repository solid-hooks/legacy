import { createResource } from 'solid-js'
import type { Accessor, InitializedResource, InitializedResourceOptions, NoInfer, Resource, ResourceActions, ResourceFetcher, ResourceOptions } from 'solid-js'

import type { SignalObject } from './signal'

type AddPrefix$ToKeys<T extends Record<string, any>> = {
  [K in keyof T as `$${string & K}`]: T[K];
}
type BaseResourceObject<T, R, Is, Actions = ResourceActions<Is extends true ? T : (T | undefined), R>> =
  (Is extends true ? InitializedResource<T> : Resource<T>) & AddPrefix$ToKeys<{
    [K in keyof Actions]: Actions[K]
  }>
/**
 * type of {@link $resource} with initalized value
 */
export type InitializedResourceObject<T, R> = BaseResourceObject<T, R, true>
/**
 * type of {@link $resource}
 */
export type ResourceObject<T, R> = BaseResourceObject<T, R, false>

type SourceOption<S> = {
  /**
   * source signal
   */
  $: SignalObject<S | false | null> | Accessor<S | false | null> | S | false | null
}

/**
 * object wrapper for initialized {@link createResource} without signal
 * @param fetcher resource fetcher
 * @param options resource options
 */
export function $resource<T, R = unknown>(
  fetcher: ResourceFetcher<true, T, R>,
  options: InitializedResourceOptions<NoInfer<T>, true>,
): InitializedResourceObject<T, R>
/**
 * object wrapper for {@link createResource} without signal
 * @param fetcher resource fetcher
 * @param options resource options
 */
export function $resource<T, R = unknown>(
  fetcher: ResourceFetcher<true, T, R>,
  options?: ResourceOptions<T, true>,
): ResourceObject<T, R>
/**
 * object wrapper for initialized {@link createResource} with signal
 * @param fetcher resource fetcher
 * @param options resource options with optional source (set by `$`)
 */
export function $resource<T, S, R = unknown>(
  fetcher: ResourceFetcher<S, T, R>,
  options: InitializedResourceOptions<NoInfer<T>, S> & SourceOption<S>,
): InitializedResourceObject<T, R>
/**
 * object wrapper for {@link createResource} with signal
 * @param fetcher resource fetcher
 * @param options resource options with optional source (set by `$`)
 */
export function $resource<T, S, R = unknown>(
  fetcher: ResourceFetcher<S, T, R>,
  options?: ResourceOptions<T, S> & SourceOption<S>,
): ResourceObject<T, R>
export function $resource<T, S, R = unknown>(
  fetcher: ResourceFetcher<S, T, R>,
  { $, ...otherOptions }: (InitializedResourceOptions<T, S> | ResourceOptions<NoInfer<T>, S>) & Partial<SourceOption<S>> = {},
) {
  // @ts-expect-error conditional params
  const [data, { mutate, refetch }] = createResource(...(
    $ ? [$, fetcher, otherOptions] : [fetcher, otherOptions]
  ))
  // @ts-expect-error assign
  // eslint-disable-next-line solid/reactivity
  data.$mutate = mutate
  // @ts-expect-error assign
  // eslint-disable-next-line solid/reactivity
  data.$refetch = refetch
  return data as any
}
