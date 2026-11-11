import { site } from '@/lib/site'

// Placeholder home page. It deliberately doesn't query Payload: a page that
// reads request headers or the database renders on every request, and one that
// queries Payload without opting into request-time rendering would try to reach
// the database during the Docker build. See AGENTS.md → "Fetching Payload data".
export default function HomePage() {
  return (
    <div className="placeholder">
      <h1>{site.name}</h1>
    </div>
  )
}
