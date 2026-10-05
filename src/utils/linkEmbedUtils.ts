import { LinkPreview } from '../types';

const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;

export function extractUrlsFromText(text: string): string[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  // Return unique URLs
  return Array.from(new Set(matches));
}

export function generateLinkPreview(urlStr: string): LinkPreview | null {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;

    // 1. GitHub Links
    if (hostname.includes('github.com')) {
      const parts = pathname.split('/').filter(Boolean);
      const owner = parts[0] || 'repository';
      const repo = parts[1] || '';
      const isPR = parts[2] === 'pull';
      const isIssue = parts[2] === 'issues';
      const number = parts[3] || '';

      if (isPR) {
        return {
          url: urlStr,
          siteName: 'GitHub',
          domain: 'github.com',
          title: `${owner}/${repo} • Pull Request #${number}`,
          description: `Feature branch integration for ${repo}. Review status: Review requested. Merging into main with zero conflicts.`,
          favicon: 'https://github.githubassets.com/favicons/favicon.svg',
          imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
        };
      } else if (isIssue) {
        return {
          url: urlStr,
          siteName: 'GitHub',
          domain: 'github.com',
          title: `${owner}/${repo} • Issue #${number}`,
          description: `Bug report & reproduction steps logged in ${repo}. Assigned for triage.`,
          favicon: 'https://github.githubassets.com/favicons/favicon.svg',
          imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
        };
      } else {
        return {
          url: urlStr,
          siteName: 'GitHub',
          domain: 'github.com',
          title: `${owner}/${repo || 'Project'} • Source Repository`,
          description: `Next-generation distributed cloud runtime and high-velocity collaborative workspace on GitHub.`,
          favicon: 'https://github.githubassets.com/favicons/favicon.svg',
          imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
        };
      }
    }

    // 2. Figma Links
    if (hostname.includes('figma.com')) {
      const titleMatch = pathname.match(/\/([^\/?#]+)/g);
      const name = titleMatch && titleMatch[1] ? decodeURIComponent(titleMatch[1].replace(/^\//, '')) : 'JIRA-clone';
      return {
        url: urlStr,
        siteName: 'Figma',
        domain: 'figma.com',
        title: `${name.replace(/-/g, ' ')} — Interactive Design Board`,
        description: `Vector canvas and design tokens on Figma. Layout components: Kanban board, sprint backlogs, Discord voice & chat channels.`,
        favicon: 'https://static.figma.com/app/icon/1/favicon.svg',
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      };
    }

    // 3. YouTube Links
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return {
        url: urlStr,
        siteName: 'YouTube',
        domain: 'youtube.com',
        title: 'ApexFlow Engineering Sync: Architecture & WebRTC Signaling',
        description: 'Deep dive into peer audio/video connections, STUN servers, and real-time Cloud Firestore presence synchronization.',
        favicon: 'https://www.youtube.com/s/desktop/f681a951/img/favicon.ico',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      };
    }

    // 4. Default Web Page
    const cleanDomain = hostname.replace(/^www\./, '');
    const cleanPath = pathname.replace(/^\//, '').replace(/-/g, ' ');
    const displayTitle = cleanPath
      ? `${cleanPath.slice(0, 45)} — ${cleanDomain}`
      : `${cleanDomain.toUpperCase()} Documentation & Hub`;

    return {
      url: urlStr,
      siteName: cleanDomain,
      domain: hostname,
      title: displayTitle,
      description: `Reference specifications, engineering documentation, and live preview resources for ${cleanDomain}.`,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    };
  } catch (e) {
    return null;
  }
}

export function detectLinkPreviews(text: string): LinkPreview[] {
  const urls = extractUrlsFromText(text);
  const previews: LinkPreview[] = [];
  for (const u of urls.slice(0, 3)) { // Max 3 preview cards per message
    const prev = generateLinkPreview(u);
    if (prev) previews.push(prev);
  }
  return previews;
}
