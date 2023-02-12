import React from "react";

export default function LayoutListing(props: React.PropsWithChildren<{}>) {
  const { children } = props;

  return (
    <div className="Layout_Listing">
      { children }
    </div>
  )
}