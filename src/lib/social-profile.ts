type SocialProfile = {
  link: string;
  handle?: string;
};

const OUTDATED_TIKTOK_LINK = "https://tiktok.com/@danjeshua";
const CURRENT_TIKTOK_LINK = "https://www.tiktok.com/@j3shua_?_r=1&_t=ZS-9AeleydNBbw";
const OUTDATED_FACEBOOK_LINK = "https://facebook.com/danjeshua";
const CURRENT_FACEBOOK_LINK = "https://www.facebook.com/share/19UKy3a1yC/";
const OUTDATED_X_LINK = "https://x.com/danjeshua";
const CURRENT_X_LINK = "https://x.com/Dn_Jsh24";

type ResolvedSocialProfile<T extends SocialProfile> = Omit<T, "link"> & { link: string };

export function resolveSocialProfile<T extends SocialProfile>(profile: T): ResolvedSocialProfile<T> {
  if (profile.link === OUTDATED_TIKTOK_LINK) {
    return {
      ...profile,
      link: CURRENT_TIKTOK_LINK,
      ...(profile.handle === undefined ? {} : { handle: "@j3shua_" }),
    } as ResolvedSocialProfile<T>;
  }

  if (profile.link === OUTDATED_FACEBOOK_LINK) {
    return { ...profile, link: CURRENT_FACEBOOK_LINK };
  }

  if (profile.link === OUTDATED_X_LINK) {
    return {
      ...profile,
      link: CURRENT_X_LINK,
      ...(profile.handle === undefined ? {} : { handle: "@Dn_Jsh24" }),
    } as ResolvedSocialProfile<T>;
  }

  return profile;
}
