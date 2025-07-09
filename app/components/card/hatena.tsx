type Props = {
  id: string
};

export default function Hatena({ id }: Props) {
  return (
    <a href={`https://hatenablog.com/${id}`} target="_blank" rel="noopener noreferrer">
      <img 
        src='https://img.shields.io/badge/Hatena_Blog-00A4FF?style=for-the-badge&logo=hatena&logoColor=white'
        alt="Hatena Blog Badge"
      />
    </a>
  );
}
