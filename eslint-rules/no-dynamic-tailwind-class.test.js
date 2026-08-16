import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'
import rule from './no-dynamic-tailwind-class.js'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

ruleTester.run('no-dynamic-tailwind-class', rule, {
  valid: [
    // トークンを丸ごと差し込むのは正当
    { code: 'const a = <div className={`flex ${size} items-center`} />' },
    { code: 'const a = <div className={`mt-4 space-y-3 ${theme.panel}`} />' },
    { code: 'const a = <div className={`truncate ${theme.muted}`} />' },
    { code: 'const a = <div className={`rounded-md border p-2 ${sel ? t.on : t.off}`} />' },
    // 密着していても、埋め込む値が空か空白始まりなら独立したクラスになる
    { code: "const a = <div className={`slide-item${on ? ' active' : ''}`} />" },
    { code: "const a = <div className={`btn${on ? ' btn-on' : ' btn-off'}`} />" },
    // 静的な文字列は対象外
    { code: 'const a = <div className="bg-red-700 px-4" />' },
    // className 以外の属性は見ない
    { code: 'const a = <path id={`textCircle-${index}`} />' },
    { code: 'const a = <a href={`#heading-${id}`} />' },
    // class 属性も同じ扱い
    { code: 'const a = <div class={`flex ${size}`} />' },
  ],

  invalid: [
    {
      // 典型例：色名を差し込む
      code: 'const a = <div className={`bg-${color}-700`} />',
      errors: [{ messageId: 'glued' }],
    },
    {
      code: 'const a = <div className={`text-${size}`} />',
      errors: [{ messageId: 'glued' }],
    },
    {
      // バリアント側に埋め込む
      code: 'const a = <div className={`hover:${cls}`} />',
      errors: [{ messageId: 'glued' }],
    },
    {
      // 前は空白でも、後ろが断片なら壊れる
      code: 'const a = <div className={`px-4 ${side}-2`} />',
      errors: [{ messageId: 'glued' }],
    },
    {
      // 解決できない値が密着している場合は落とす
      code: 'const a = <div className={`slide-item${suffix}`} />',
      errors: [{ messageId: 'glued' }],
    },
    {
      // 三項でも、分岐が空白で始まらないなら壊れる
      code: "const a = <div className={`bg-${on ? 'red' : 'blue'}-500`} />",
      errors: [{ messageId: 'glued' }],
    },
    {
      // 文字列結合も同じ間違い
      code: "const a = <div className={'bg-' + color} />",
      errors: [{ messageId: 'glued' }],
    },
    {
      // 1 つのテンプレートに 2 箇所
      code: 'const a = <div className={`bg-${c}-700 text-${s}`} />',
      errors: [{ messageId: 'glued' }, { messageId: 'glued' }],
    },
  ],
})

describe('no-dynamic-tailwind-class', () => {
  it('RuleTester が実行された', () => {})
})
