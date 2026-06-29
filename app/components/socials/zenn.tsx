type Props = {
  id: string
}

export default function Zenn({ id }: Props) {
  return (
    <div className="sm:block md:flex lg:flex">
      <a href={`https://zenn.dev/${id}`} target="_blank" rel="noopener noreferrer">
        <img
          className="sm:float-none md:float-left lg:float-left"
          src={`https://badgen.org/img/zenn/${id}/likes?style=plastic`}
          alt="Likes"
        />
      </a>
      <a href={`https://zenn.dev/${id}`} target="_blank" rel="noopener noreferrer">
        <img
          className="sm:float-none md:float-left lg:float-left"
          src={`https://badgen.org/img/zenn/${id}/articles?style=plastic`}
          alt="Articles"
        />
      </a>
      <a href={`https://zenn.dev/${id}`} target="_blank" rel="noopener noreferrer">
        <img
          className="sm:float-none md:float-left lg:float-left"
          src={`https://badgen.org/img/zenn/${id}/followers?style=plastic`}
          alt="Followers"
        />
      </a>
    </div>
  )
}
