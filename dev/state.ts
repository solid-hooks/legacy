import { $state } from '../src/state'
import { $ } from '../src'

export const useInfoState = $state('info', {
  $init: {
    test: 1,
    deep: {
      data: 'test',
    },
  },
  $getters: state => ({
    doubleValue() {
      console.log('update in memo')
      return state.test * 2
    },
  }),
  $actions: state => ({
    setTest(test: number) {
      state.$('test', test)
    },
    async sleepAndPlus(ms: number) {
      return new Promise<void>(resolve => setTimeout(() => {
        state.$('test', t => t + 1)
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