import { $state } from '../src'

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
  }),
})