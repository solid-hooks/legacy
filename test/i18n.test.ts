import { describe, expect, test } from 'vitest'
import { testEffect } from '@solidjs/testing-library'
import { createEffect, on } from 'solid-js'
import { $i18n } from '../src/i18n'

describe('i18n', () => {
  const testDict = {
    t: 1,
    tt: 2,
    deep: {
      t: 1,
    },
  }
  const testDict1 = {
    t: '1',
    tt: '2',
    deep: {
      t: 'deep',
    },
  }
  const { $t, availiableLocales, locale } = $i18n<'testDict' | 'testDict1'>({
    message: { testDict, testDict1 },
    defaultLocale: 'testDict',
  })
  test('default', async () => {
    expect(availiableLocales).toStrictEqual(['testDict', 'testDict1'])
    testEffect((done) => {
      createEffect(on(() => $t('tt'), () => {
        expect($t('tt')).toBe('2')
        done()
      }, { defer: true }))
    })
    const dest = $t('deep.t')
    expect(dest).toBe(1)
    locale.set('testDict1')
    await Promise.resolve()
    expect($t('deep.t')).toBe('deep')
  })
})
