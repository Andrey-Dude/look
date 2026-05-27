export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const response = await fetch(
    'https://look-new.webflow.io/sitemap.xml'
  );
  const xml = await response.text();

  const blockedPatterns = [
    '/de/blog/', '/es/blog/', '/pt/blog/',
    '/it/blog/', '/fr/blog/',
    '/de/team-members/', '/es/team-members/',
    '/it/team-members/', '/fr/team-members/',
    '/pt/team-members/',
  ];

  const filteredXml = xml.replace(
    /<url>[\s\S]*?<\/url>/g,
    (match) => {
      const loc = match.match(/<loc>(.*?)<\/loc>/);
      if (!loc) return match;
      const isBlocked = blockedPatterns.some(
        p => loc[1].includes(p)
      );
      return isBlocked ? '' : match;
    }
  );

  const cleanXml = filteredXml.replace(/\n{3,}/g, '\n\n');

  return new Response(cleanXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
