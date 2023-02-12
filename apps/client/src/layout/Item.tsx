import React from "react";
import { Item } from "types";

interface LayoutItemProps {
  item: Item;
}

function LayoutItem({ item }: LayoutItemProps) {
  return (
    <div className="Layout_Item">
      {/* Large displays show the product photo on the left that is 300px and details as a scrollable on the right */}
       
    </div>
  )
}

export default LayoutItem;