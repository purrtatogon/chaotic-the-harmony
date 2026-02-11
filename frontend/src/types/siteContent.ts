/**
 * Represents a single content block from the site_content CSV.
 */
export interface SiteContentBlock {
  section: string;
  key: string;
  title: string;
  content: string;
}
