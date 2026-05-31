export type UpdateFeedEntry = {
  title?: string;
  body?: string;
  url?: string;
  categories?: string;
  categoriesTags?: string;
  source_info?: {
    name?: string;
  };
  source?: string;
  published_on?: number;
  imageurl?: string;
};

export type UpdateFeedSnapshot = {
  symbol: string;
  updates: UpdateFeedEntry[];
  fetchedAt: string;
};

export type UpdatesApiResponse = {
  data?: {
    Data?: UpdateFeedEntry[];
  };
  error?: string;
};

export const updateFeedQueryKey = ["updates-feed"] as const;
