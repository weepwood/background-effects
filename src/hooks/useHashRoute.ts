import { useCallback, useEffect, useState } from "react";

export type Route = { view: "gallery" } | { view: "studio"; id: string };

function parse(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const match = raw.match(/^fx\/(.+)$/);
  return match ? { view: "studio", id: decodeURIComponent(match[1]) } : { view: "gallery" };
}

/** Tiny hash router: `#/` is the gallery, `#/fx/<effect-id>` is the studio. */
export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = useCallback((next: Route) => {
    const hash = next.view === "studio" ? `#/fx/${encodeURIComponent(next.id)}` : "#/";
    if (window.location.hash !== hash) window.location.hash = hash;
  }, []);

  return [route, go];
}
