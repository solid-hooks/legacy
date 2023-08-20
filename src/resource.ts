import { createResource } from 'solid-js'
import type { Accessor, InitializedResource, InitializedResourceOptions, NoInfer, Resource, ResourceActions, ResourceFetcher, ResourceOptions } from 'solid-js'

import type { SignalObject } from './signal'

type AddPrefix$ToKeys<T extends Record<string, any>> = {
  [K in keyof T as `$${string & K}`]: T[K];
}
type ResObject<T, R, Is, Actions = ResourceActions<Is extends true ? T : (T | undefined), R>> =
  (Is extends true ? InitializedResource<T> : Resource<T>) & AddPrefix$ToKeys<
     {
       [k in keyof Actions]: Actions[k]
     }
  >
export type InitializedResourceObject<T, R> = ResObject<T, R, true>
export type ResourceObject<T, R> = ResObject<T, R, false>

type SourceOption<S> = {
  /**
   * source signal
   */
  $: SignalObject<S | false | null> | Accessor<S | false | null> | S | false | null
}

/**
 * object wrapper for `createResource`
 * @param fetcher resource fetcher
 * @param options resource options with optional source (prefix `$`)
 */
export function $res<T, R = unknown>(
  fetcher: ResourceFetcher<true, T, R>,
  options: InitializedResourceOptions<NoInfer<T>, true>,
): InitializedResourceObject<T, R>
export function $res<T, R = unknown>(
  fetcher: ResourceFetcher<true, T, R>,
  options?: ResourceOptions<T, true>,
): ResourceObject<T, R>
export function $res<T, S, R = unknown>(
  fetcher: ResourceFetcher<S, T, R>,
  options: InitializedResourceOptions<NoInfer<T>, S> & SourceOption<S>,
): InitializedResourceObject<T, R>
export function $res<T, S, R = unknown>(
  fetcher: ResourceFetcher<S, T, R>,
  options?: ResourceOptions<T, S> & SourceOption<S>,
): ResourceObject<T, R>
export function $res<T, S, R = unknown>(
  fetcher: ResourceFetcher<S, T, R>,
  options: (InitializedResourceOptions<T, S> | ResourceOptions<NoInfer<T>, S>) & Partial<SourceOption<S>> = {},
) {
  const { $, ...otherOptions } = options
  const [data, { mutate, refetch }] = createResource<T, S, R>($, fetcher, otherOptions)

  return Object.assign(data, {
    $mutate: mutate,
    $refetch: refetch,
  })
}
