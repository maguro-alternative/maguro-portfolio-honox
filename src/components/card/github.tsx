type Props = {
  id: string
}

export default function GithubCard({ id }: Props) {
  return (
    <div className="card">
      <h2>Github Card</h2>
      <p>Github ID: {id}</p>
    </div>
  )
}
