import { Logo } from '@/components/logo'

const columns = [
  {
    title: 'Product',
    links: ['Features', 'Monitoring', 'Analytics', 'Status Pages', 'Pricing'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Help Center', 'API', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact', 'Privacy', 'Terms'],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Simple, reliable uptime monitoring for modern websites.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            © 2026 WebPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
