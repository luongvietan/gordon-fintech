/**
 * Twitter card uses the same artwork as the OG image — Twitter renders
 * `summary_large_image` cards at the same 1200×630 ratio so there's no
 * point in maintaining a parallel template.
 */
export { default, alt, size, contentType } from './opengraph-image';
