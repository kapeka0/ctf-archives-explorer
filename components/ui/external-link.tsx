import { ComponentPropsWithoutRef } from "react";

/**
 * Plain anchor for links Next's <Link> can't handle: external URLs and
 * same-page hash anchors. Kept in one place so the no-<a> lint rule only
 * needs a single exception.
 */
function ExternalLink(props: ComponentPropsWithoutRef<"a">) {
  // eslint-disable-next-line no-restricted-syntax
  return <a {...props} />;
}

export default ExternalLink;
