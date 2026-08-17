/**
 * Tailwind v4 の JIT はソースを静的に走査してクラス名を集めるので、
 * `bg-${color}-700` のように断片へ値を埋め込むと、そのクラスは CSS に出力されない。
 *
 * 埋め込みそのものは禁止しない。`flex ${swatchSize} items-center` のように
 * 完全なクラス名を差し込むのは正当なので、
 * 「リテラル側の非空白文字に密着しているか」だけを見る。
 */

/**
 * 文字列リテラルに解決できるならその候補一覧を返す。
 * 解決できない（実行時に決まる）なら null。
 */
function literalStrings(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return [node.value]
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return [node.quasis[0].value.cooked ?? '']
  }
  if (node.type === 'ConditionalExpression') {
    const a = literalStrings(node.consequent)
    const b = literalStrings(node.alternate)
    return a && b ? [...a, ...b] : null
  }
  return null
}

/** 直前に密着してよいか（値が空か、空白で始まるなら新しいクラスとして独立する） */
function safeGluedBefore(expr) {
  const values = literalStrings(expr)
  return values !== null && values.every((v) => v === '' || /^\s/.test(v))
}

function safeGluedAfter(expr) {
  const values = literalStrings(expr)
  return values !== null && values.every((v) => v === '' || /\s$/.test(v))
}

/** 密着しているクラス断片を、メッセージ用に短く取り出す */
function fragmentBefore(text) {
  return (text.match(/\S+$/) ?? [''])[0].slice(-24)
}

function fragmentAfter(text) {
  return (text.match(/^\S+/) ?? [''])[0].slice(0, 24)
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Tailwind のクラス名を文字列結合で組み立てるのを禁じる（JIT が拾えず CSS が出力されないため）',
    },
    messages: {
      glued:
        'Tailwind v4 の JIT が "{{ fragment }}" を含む完全なクラス名を見つけられず、この CSS は出力されない。完全なクラス名を持つトークンを渡すこと（例: app/features/talk/theme.ts）。',
    },
    schema: [],
  },

  create(context) {
    function checkTemplate(node) {
      node.expressions.forEach((expr, i) => {
        const before = node.quasis[i].value.cooked ?? ''
        const after = node.quasis[i + 1].value.cooked ?? ''

        if (before.length > 0 && !/\s$/.test(before) && !safeGluedBefore(expr)) {
          context.report({
            node: expr,
            messageId: 'glued',
            data: { fragment: `${fragmentBefore(before)}\${...}` },
          })
          return
        }
        if (after.length > 0 && !/^\s/.test(after) && !safeGluedAfter(expr)) {
          context.report({
            node: expr,
            messageId: 'glued',
            data: { fragment: `\${...}${fragmentAfter(after)}` },
          })
        }
      })
    }

    function checkConcat(node) {
      if (node.operator !== '+') return
      const left = node.left
      if (left.type === 'Literal' && typeof left.value === 'string') {
        if (left.value.length > 0 && !/\s$/.test(left.value) && !safeGluedBefore(node.right)) {
          context.report({
            node: node.right,
            messageId: 'glued',
            data: { fragment: `${fragmentBefore(left.value)}+ ...` },
          })
        }
      }
    }

    return {
      'JSXAttribute[name.name=/^(className|class)$/] TemplateLiteral': checkTemplate,
      'JSXAttribute[name.name=/^(className|class)$/] BinaryExpression': checkConcat,
    }
  },
}
