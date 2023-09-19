import { $state } from '../src/state'
import { $ } from '../src'

export const useInfoState = $state('info', {
  $init: {
    test: 1,
  },
  $action: (state, setState) => ({
    doubleValue() {
      return state.test * 2
    },
    setTest(test: number) {
      setState('test', test)
    },
    async sleepAndPlus(ms: number) {
      return new Promise<void>(resolve => setTimeout(() => {
        setState('test', t => t + 1)
        console.log('async action')
        resolve()
      }, ms))
    },
  }),
  $persist: {
    enable: true,
  },
}, true)

export const useCustomState = $state('custom', (name, log) => {
  return $(1, {
    postSet(newValue) {
      log('$state with custom function:', { name, newValue })
    },
  })
})