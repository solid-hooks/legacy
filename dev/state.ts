import { getOwner } from 'solid-js'
import { $state } from '../src/state'
import { $signal } from '../src/utils'
import { $memo } from '../src'

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
  const plain = $signal(1, {
    postSet(newValue) {
      log('$state with custom function:', { name, newValue })
    },
  })
  const plus2 = $memo(plain() + 2)
  const owner = getOwner()
  console.log(owner)
  return { plain, plus2 }
})
