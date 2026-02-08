export interface SiteContentBlock {
  /** Present when loaded from API v2+ (required for admin edit routes). */
  id?: number;
  section: string;
  key: string;
  title: string;
  content: string;
}
