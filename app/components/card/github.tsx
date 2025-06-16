type Props = {
  id: string
}

export default function Github({ id }: Props) {
  return (
    <a href={`https://github.com/${id}`} target="_blank" rel="noopener noreferrer">
      <img 
        src='https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white'
      ></img>
    </a>
  )
}
