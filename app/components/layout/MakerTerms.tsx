/**
 * セリフメーカー各種で共通の利用規約。
 * 明るい／暗いどちらのページでも使えるよう、配色は className で渡してもらい、
 * 内側では色クラスを付けずに継承させる。
 */
export default function MakerTerms({ className = '' }: { className?: string }) {
  return (
    <section className={`mt-6 rounded-lg border p-4 text-xs leading-relaxed ${className}`}>
      <h2 className="text-sm font-bold">利用規約</h2>
      <ol className="mt-2 list-decimal space-y-1.5 pl-4">
        <li>
          本ツールは個人が制作した非公式のファンツールです。作品の権利者および運営とは一切関係ありません。
        </li>
        <li>作品名・ロゴ・意匠などの権利は、各権利者に帰属します。</li>
        <li>
          読み込んだ画像はブラウザ内だけで処理され、サーバーへの送信や保存は行いません。
        </li>
        <li>
          生成した画像の内容・公開・利用に関する責任は、利用者に帰属します。公開の際は各権利者のガイドラインに従ってください。
        </li>
        <li>
          権利者や第三者の権利を侵害する用途、公式と誤認させる用途、公序良俗に反する用途には利用しないでください。
        </li>
        <li>
          生成した画像には出所として本ツールの URL が入ります。消さずにご利用いただけると助かります。
        </li>
        <li>
          本ツールの利用により生じたいかなる損害についても、制作者は責任を負いません。また、予告なく内容の変更や公開の停止を行う場合があります。
        </li>
      </ol>
    </section>
  )
}
