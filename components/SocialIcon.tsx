import {
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaSnapchat,
  FaPinterestP,
  FaRedditAlien,
  FaThreads,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaSpotify,
  FaTwitch,
  FaSoundcloud,
  FaGithub,
  FaBehance,
  FaDribbble,
  FaMedium,
  FaPaypal,
  FaAirbnb,
  FaPodcast,
  FaLink,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

const ICONS: Record<string, IconType> = {
  instagram: FaInstagram,
  x: FaXTwitter,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  snapchat: FaSnapchat,
  pinterest: FaPinterestP,
  reddit: FaRedditAlien,
  threads: FaThreads,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  discord: FaDiscord,
  spotify: FaSpotify,
  twitch: FaTwitch,
  soundcloud: FaSoundcloud,
  github: FaGithub,
  behance: FaBehance,
  dribbble: FaDribbble,
  medium: FaMedium,
  paypal: FaPaypal,
  airbnb: FaAirbnb,
  clubhouse: FaPodcast,
  custom: FaLink,
};

export default function SocialIcon({
  platform,
  className,
  style,
}: {
  platform: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICONS[platform] || FaLink;
  return <Icon className={className} style={style} />;
}
