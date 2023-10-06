import type { Component, FlowProps, JSX } from 'solid-js'
import { DEV } from 'solid-js'
import { createComponent, render } from 'solid-js/web'

type App = {
  /**
   * Add a Provider to the app. The list of provider will be merged
   * at mount time.
   *
   * @param provider provider to add to the list
   * @param options options
   */
  use<Props>(provider: Component<FlowProps<Props>>, options?: Props): App

  /**
   * merges all the Providers and then uses the `render` function
   * to mount the application.
   *
   * @param domElement HTML Element or selector
   */
  mount(domElement: HTMLElement | string): ReturnType<typeof render>
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
    (application, { provider, opts = {} }) =>
      () => createComponent(provider, {
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
 *
 * reference from {@link https://github.com/amoutonbrady/solid-utils#createapp solid-utils}
 * @param app App component
 * @param props App params
 * @example
 * ```ts
 * import App from './App'
 *
 * createApp(App)
 *   .use(RouterProvider)
 *   .use(I18nProvider, { dict })
 *   .use(GlobalStoreProvider)
 *   .mount('#app')
 * ```
 * is equal to:
 * ```tsx
 * render(
 *   <RouterProvider>
 *     <I18nProvider dict={dict}>
 *       <GlobalStoreProvider>
 *         <App />
 *       </GlobalStoreProvider>
 *     </I18nProvider>
 *   </RouterProvider>,
 *   document.querySelector('#app')
 * )
 * ```
 */
export function $app<AppProps extends Record<string, any> = {}>(
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
      const root = typeof dom === 'string' ? document.querySelector(dom) : dom
      if (DEV && !root) {
        throw new Error('Mounted node is null')
      }
      return render(application, root!)
    },
  }

  return _app
}