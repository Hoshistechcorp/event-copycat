export type VideoPlatform = "youtube" | "vimeo" | "tiktok" | "instagram" | "facebook" | "twitter" | "twitch" | "other";

export interface ParsedVideo {
  platform: VideoPlatform;
  label: string;
  url: string;
  embedUrl: string | null;
  thumbnail: string | null;
  canEmbed: boolean;
}

const trim = (s: string) => s.trim();

export function parseVideoUrl(raw: string): ParsedVideo | null {
  const url = trim(raw || "");
  if (!url) return null;
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname;

  // YouTube: youtu.be/<id>, youtube.com/watch?v=<id>, /shorts/<id>, /embed/<id>, /live/<id>
  const ytIdFromYoutu = host === "youtu.be" ? path.split("/").filter(Boolean)[0] : null;
  const ytIdFromQuery = /(^|\.)youtube\.com$/.test(host) ? u.searchParams.get("v") : null;
  const ytPathMatch = /(^|\.)youtube\.com$/.test(host)
    ? path.match(/^\/(?:shorts|embed|live|v)\/([\w-]{6,})/)
    : null;
  const ytId = (ytIdFromYoutu || ytIdFromQuery || ytPathMatch?.[1] || "").split("?")[0];
  if (/youtu/.test(host) && ytId && /^[\w-]{6,}$/.test(ytId)) {
    const params = new URLSearchParams();
    const t = u.searchParams.get("t") || u.searchParams.get("start");
    if (t) params.set("start", String(parseInt(t, 10) || 0));
    const qs = params.toString();
    return {
      platform: "youtube",
      label: "YouTube",
      url,
      embedUrl: `https://www.youtube.com/embed/${ytId}${qs ? `?${qs}` : ""}`,
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      canEmbed: true,
    };
  }

  // Vimeo
  if (/(^|\.)vimeo\.com$/.test(host)) {
    const id = path.split("/").filter(Boolean)[0];
    if (id && /^\d+$/.test(id)) {
      return {
        platform: "vimeo",
        label: "Vimeo",
        url,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        thumbnail: null,
        canEmbed: true,
      };
    }
  }

  // Twitch clip / video
  if (/(^|\.)twitch\.tv$/.test(host)) {
    const vid = path.match(/^\/videos\/(\d+)/)?.[1];
    if (vid) {
      const parent = typeof window !== "undefined" ? window.location.hostname : "lovable.app";
      return {
        platform: "twitch",
        label: "Twitch",
        url,
        embedUrl: `https://player.twitch.tv/?video=${vid}&parent=${parent}`,
        thumbnail: null,
        canEmbed: true,
      };
    }
  }

  // TikTok / Instagram / Facebook / Twitter — link out (no reliable iframe without their SDK)
  if (/tiktok\.com$/.test(host) || host === "vm.tiktok.com") {
    return { platform: "tiktok", label: "TikTok", url, embedUrl: null, thumbnail: null, canEmbed: false };
  }
  if (/instagram\.com$/.test(host)) {
    return { platform: "instagram", label: "Instagram", url, embedUrl: null, thumbnail: null, canEmbed: false };
  }
  if (/facebook\.com$/.test(host) || host === "fb.watch") {
    return { platform: "facebook", label: "Facebook", url, embedUrl: null, thumbnail: null, canEmbed: false };
  }
  if (/twitter\.com$/.test(host) || host === "x.com") {
    return { platform: "twitter", label: "X / Twitter", url, embedUrl: null, thumbnail: null, canEmbed: false };
  }

  return { platform: "other", label: host, url, embedUrl: null, thumbnail: null, canEmbed: false };
}
