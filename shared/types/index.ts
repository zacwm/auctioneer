interface BidHistoryItem {
  bidderId: string;
  unixTimestamp: number;
  bidAmount: number;
}

interface Item {
  listingId: string;
  name: string;
  startingPrice: number;
  highestBid: number;
  bidCount: number;
  finishUnixTimestamp: number;
  finishUnix?: number;
  finished: boolean;
  // Props that are undefined if current user is not an admin.
  bidHistory?: BidHistoryItem[];
}


export type {
  BidHistoryItem,
  Item,
}