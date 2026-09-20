import { request } from "@/lib/api/request";
import { ErrorResponse, RequestOptions } from "@/requests/helpers/types";
import type { City } from "@/types/payload-types";

export type CitySummary = Pick<
  City,
  "id" | "name" | "slug" | "country" | "timezone" | "timezoneLabel"
>;

export const GET_CITIES_QUERY = `
  query getCities($page: Int!, $limit: Int!) {
    Cities(page: $page, limit: $limit, sort: "id") {
      data: docs { id name slug country timezone timezoneLabel }
      totalDocs
      totalPages
      page
      limit
      hasNextPage
      nextPage
    }
  }
`;

export interface Cities {
  data: CitySummary[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

export interface GetCitiesResponse extends ErrorResponse {
  data?: { Cities: Cities | null } | null;
}

/** Fetch a fresh, alphabetically sorted page from the public Payload GraphQL API. */
export async function getCities({
  endpoint,
  page = 1,
  limit = 100,
}: RequestOptions): Promise<Cities> {
  const response = await request<GetCitiesResponse>({
    endpoint: endpoint,
    options: {
      method: "POST",
      data: {
        operationName: "getCities",
        query: GET_CITIES_QUERY,
        variables: {
          page,
          limit,
        },
      },
    },
  });
  if (response && "success" in response) {
    throw new Error(
      typeof response.message === "string"
        ? response.message
        : `Cities request failed${response.status ? ` (HTTP ${response.status})` : ""}.`,
    );
  }
  // GraphQL can report errors with HTTP 200, even alongside partial data.
  if (response?.errors?.length)
    throw new Error(response.errors.map((error) => error.message).join("; "));
  if (!response?.data?.Cities)
    throw new Error("Cities response did not contain city data.");
  return response.data.Cities;
}
