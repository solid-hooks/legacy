import type { Component, FlowProps, JSX } from 'solid-js'
import { DEV } from 'solid-js'
import { createComponent, render } from 'solid-js/web'

type App = {
  /**
   * Add a Provider to the app. The list of provider will be merged
   * at mount time.
   *
   * @param provider provider to add to the list
   * @param options provider options
   */
  use<Props>(provider: Component<FlowProps<Props>>, options?: Props): App

  /**
   * merges all the Providers and then uses the `render` function
   * to mount the application.
   *
   * @param domElement HTML Element or selector
   */
  mount(domElement: string): ReturnType<typeof render>
}

type Provider<Props extends Record<string, any>> = {
  provider: Component<FlowProps<Props>>
  opts?: Props
}

type MergeParams = {
  app: (props?: any) => JSX.Element
  props?: Record<string, any>
  providers: Provider<any>[]
}

function mergeProviders({ app, props = {}, providers }: MergeParams) {
  return providers.reduce(
    (application, { provider, opts = {} }) => () =>
      createComponent(provider, {
        ...opts,
        get children() {
          return application()
        },
      }),
    () => createComponent(app, props),
  )
}

/**
 * Vue's `createApp` like initialization, works in both `.ts` and `.tsx`
 * @param app App component
 * @param props App params
 * @see https://github.com/subframe7536/solid-dollar#useApp
 */
export function useApp<AppProps extends Record<string, any> = {}>(
  app: (props?: AppProps) => JSX.Element,
  props?: AppProps,
): App {
  const providers: Provider<any>[] = []

  const _app: App = {
    use(provider, opts) {
      providers.push({ provider, opts })
      return _app
    },

    mount(dom) {
      const application = mergeProviders({ app, props, providers })
      const root = document.querySelector(dom)
      if (DEV && !root) {
        throw new Error(`root node "${dom}" is null`)
      }
      return render(application, root!)
    },
  }

  return _app
}
