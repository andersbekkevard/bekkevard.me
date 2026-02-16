import { SITE } from "./consts";

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/andersbekkevard",
    linkTitle: ` ${SITE.title} on Github`,
    icon: "github",
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/andersbekkevard",
    linkTitle: `${SITE.title} on X`,
    icon: "twitter",
    active: false,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/andersbekkevard/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: "linkedin",
    active: true,
  },
  {
    name: "Mail",
    href: "",
    linkTitle: `Email address available on contact text`,
    icon: "mail",
    active: false,
  },
] as const;

export const SHARE_LINKS = [
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: "twitter",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=",
    linkTitle: `Share this post on LinkedIn`,
    icon: "linkedin",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: "whatsapp",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: "facebook",
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: "telegram",
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
    icon: "pinterest",
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: "mail",
  },
] as const;
