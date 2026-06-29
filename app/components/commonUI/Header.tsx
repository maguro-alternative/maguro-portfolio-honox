import Twitter from '../socials/twitter'
import Github from '../socials/github'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/profile', label: 'Profile' },
  { href: '/articles', label: 'Articles' },
]

export default function Header() {
  return (
    <div className="flex md:flex-row justify-between items-center p-2">
      <div className="flex gap-5 mb-2.5 md:mb-0 p-2 text-white">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="no-underline">
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex items-center">
        <Twitter id="sigumataityouda" />
        <Github id="maguro-alternative" />
      </div>
    </div>
  )
}
