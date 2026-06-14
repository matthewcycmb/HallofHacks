/**
 * Detect embedded "in-app" browsers (the WebViews that social apps open links
 * in). These don't share cookies with Safari/Chrome, so Google's OAuth account
 * chooser never appears — and Google often blocks OAuth in them outright. We use
 * this to nudge the visitor to open the link in their real browser before
 * signing in. Match by the app tokens each WebView adds to the user-agent.
 */

export type InAppBrowser = { isInApp: boolean; appName: string | null };

// Order matters: more specific tokens first. Kept to named social apps so we
// never false-positive on real Safari/Chrome/Firefox.
const PATTERNS: [RegExp, string][] = [
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS|Messenger/i, "Facebook"],
  [/BytedanceWebview|musical_ly|TikTok|Trill/i, "TikTok"],
  [/Snapchat/i, "Snapchat"],
  [/LinkedInApp/i, "LinkedIn"],
  [/Pinterest/i, "Pinterest"],
  [/\bLine\//i, "LINE"],
  [/MicroMessenger/i, "WeChat"],
  [/KAKAOTALK/i, "KakaoTalk"],
  [/\bGSA\//i, "the Google app"],
];

export function detectInAppBrowser(ua: string | null | undefined): InAppBrowser {
  if (!ua) return { isInApp: false, appName: null };
  for (const [re, name] of PATTERNS) {
    if (re.test(ua)) return { isInApp: true, appName: name };
  }
  return { isInApp: false, appName: null };
}
