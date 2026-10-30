import { HouseIcon, LayersIcon, ListChecksIcon, MessageCircleIcon, StoreIcon } from "lucide-react";

// Swipe is the main feature, so it's the one entry with a colored icon at rest.
export const NAV = [
  { href: "/", label: "Overview", icon: HouseIcon, primary: false },
  { href: "/info", label: "Info", icon: StoreIcon, primary: false },
  { href: "/swipe", label: "Swipe", icon: LayersIcon, primary: true },
  { href: "/chat", label: "Chat", icon: MessageCircleIcon, primary: false },
  { href: "/list", label: "List", icon: ListChecksIcon, primary: false },
];

// Registering logs the user in before setup ends, so onboarding hides the nav itself.
export const NAV_HIDDEN_ON = "/onboarding";
