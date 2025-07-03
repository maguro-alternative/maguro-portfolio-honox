type Props = {
  id: string
}

export default function Zenn({ id }: Props) {
  return (
    <a href={`https://zenn.dev/${id}`} target="_blank" rel="noopener noreferrer">
      <img 
        src='https://img.shields.io/badge/Zenn-3EA8FF?style=for-the-badge&logo=zenn&logoColor=white'
      ></img>
    </a>
  )
}
