import { $fetch } from "ofetch";

const PROFILE_BASE_URL = "https://profile.chaotic.art";

const api = $fetch.create({
  baseURL: PROFILE_BASE_URL,
});

export enum Socials {
  Twitter = "Twitter",
  Website = "Website",
  Farcaster = "Farcaster",
}

export interface Profile {
  address: string;
  name: string;
  description: string;
  image: string;
  banner: string | null;
  socials: SocialLink[];
}

export interface SocialLink {
  handle?: string;
  platform: Socials;
  link: string;
}

export function fetchProfileByAddress(address: string) {
  return api<Profile>(`/profiles/${address}`, {
    method: "GET",
  });
}
