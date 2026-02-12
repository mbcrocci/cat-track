import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { BarChart3, PawPrint } from 'lucide-react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import appCss from '../styles.css?url'
import { ThemeProvider } from '@/components/theme-provider'
import { getThemeServerFn } from '@/server/theme'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        title: 'Cat Track',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => <div>Not Found</div>,
  loader: () => getThemeServerFn(),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData()
  const queryClient = new QueryClient()

  return (
    <html lang="en" className={theme}>
      <head>
        <HeadContent />
        {/* Resolve "system" to light/dark before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var c=document.documentElement.className;if(c==="system"){document.documentElement.className=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"";}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <div className="relative min-h-dvh bg-background">
              <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
                  <Link
                    to="/"
                    className="flex items-center gap-2.5 text-foreground no-underline outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
                  >
                    <div className="grid size-9 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <PawPrint
                        className="size-4 text-primary"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </div>
                    <span className="font-display text-lg font-semibold tracking-tight">
                      Cat Track
                    </span>
                  </Link>
                  <Link
                    to="/stats"
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground no-underline outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <BarChart3 className="size-4" aria-hidden />
                    Stats
                  </Link>
                </div>
              </header>
              {children}
            </div>
          </QueryClientProvider>
          <Toaster richColors />
        </ThemeProvider>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
