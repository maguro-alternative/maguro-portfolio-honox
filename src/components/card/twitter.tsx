type Props = {
  id: string
}

export default function Twitter(
  {id}: Props
){
  return (
    <a
      href={`https://twitter.com/${id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
    </a>
  )
}