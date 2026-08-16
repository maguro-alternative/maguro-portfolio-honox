declare const BRAND: unique symbol

/**
 * 実行時には何も足さない、型の上だけの目印。
 * 同じ string でも用途が違うもの（プロキシ済み URL と生 URL、キャラの slug と UI の id）を
 * 取り違えてもコンパイルが通ってしまうのを防ぐ。
 *
 * 値を作れる場所は各モジュールの生成関数 1 つに絞ること。
 * 呼び出し側で `as` を書き始めた時点で意味が無くなる。
 */
export type Brand<T, Name extends string> = T & { readonly [BRAND]: Name }
