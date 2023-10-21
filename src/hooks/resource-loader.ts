import { type MaybeAccessor, access, tryOnCleanup } from '@solid-primitives/utils'
import type { ComponentProps } from 'solid-js'
import { createRenderEffect } from 'solid-js'
import { spread } from 'solid-js/web'

function loader(
  type: 'script' | 'style',
  content: MaybeAccessor<string>,
  options?: ScriptOptions | StyleOption,
) {
  const element = document.createElement(type)
  spread(element, options, false, true)
  createRenderEffect(() => {
    const _content = access(content)
    const prop = type === 'script' && /^(https?:|\w[\.\w-_%]+|)\//.test(_content) ? 'src' : 'textContent'
    if ((element as any)[prop] !== _content) {
      (element as any)[prop] = _content
      document.head.appendChild(element)
    }
  })
  const cleanup = tryOnCleanup(() => {
    document.head.contains(element) && document.head.removeChild(element)
  })
  return { element, cleanup }
}

/**
 * options of {@link useScriptLoader}
 */
export type ScriptOptions = Pick<
  ComponentProps<'script'>,
  | 'defer'
  | 'crossOrigin'
  | 'noModule'
  | 'referrerPolicy'
  | 'type'
  | 'async'
  | 'onLoad'
>

/**
 * load external script
 * @param src script URL or js code
 * @param options script tag props
 * @returns cleanup function
 * @see https://github.com/subframe7536/solid-dollar#loadscript
 */
export function useScriptLoader(src: MaybeAccessor<string>, options?: ScriptOptions) {
  return loader('script', src, options)
}

/**
 * options of {@link useStyleLoader}
 */
export type StyleOption = Pick<
  ComponentProps<'style'>,
  | 'media'
  | 'onLoad'
>

/**
 * load external style
 * @param css css code
 * @param options style tag props
 * @returns cleanup function
 * @see https://github.com/subframe7536/solid-dollar#loadstyle
 */
export function useStyleLoader(css: MaybeAccessor<string>, options?: StyleOption) {
  return loader('style', css, options)
}
