type Props = {
  id: string
}

export default function Qiita({ id }: Props) {
  return (
    <div className="sm:block md:flex lg:flex">
      <a href={`https://qiita.com/${id}`} target="_blank" rel="noopener noreferrer">
        <img
          className="sm:float-none md:float-left lg:float-left"
          src={`https://badgen.org/img/qiita/${id}/contributions?style=plastic`}
          alt="Contributions"
        />
      </a>
      <a href={`https://qiita.com/${id}`} target="_blank" rel="noopener noreferrer">
        <img
          className="sm:float-none md:float-left lg:float-left"
          src={`https://badgen.org/img/qiita/${id}/followers?style=plastic`}
          alt="Followers"
        />
      </a>
      <a href={`https://qiita.com/${id}`} target="_blank" rel="noopener noreferrer">
        <img
          className="sm:float-none md:float-left lg:float-left"
          src={`https://badgen.org/img/qiita/${id}/articles?style=plastic`}
          alt="Articles"
        />
      </a>
    </div>
  )
}
