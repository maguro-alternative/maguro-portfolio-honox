type Props = {
  id: string
}
export default function Qiita({ id }: Props) {
  return (
    <a href={`https://qiita.com/${id}`} target="_blank" rel="noopener noreferrer">
      <img 
        src='https://img.shields.io/badge/Qiita-55C500?style=for-the-badge&logo=qiita&logoColor=white'
        alt="Qiita Badge"
      />
    </a>
  )
}
