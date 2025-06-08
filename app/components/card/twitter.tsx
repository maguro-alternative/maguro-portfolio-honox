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
      <img 
        className='sm:float-none md:float-left lg:float-left'
        src='https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white'
      ></img>
    </a>
  )
}