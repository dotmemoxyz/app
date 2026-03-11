import type { Prefix } from "@kodadot1/static";

type SupportedGraphqlPrefix = Extract<Prefix, "ahk" | "ahp">;

type GraphQuery = {
  query: string;
  variables: unknown;
};

type GraphResponse<T> = {
  data: T;
};

const GRAPHQL_ENDPOINTS: Record<SupportedGraphqlPrefix, string> = {
  ahk: "https://chaotic-ahk.stellate.sh/",
  ahp: "https://chaotic-ahp.stellate.sh/",
};

function getGraphqlEndpoint(prefix: Prefix): string {
  if (prefix in GRAPHQL_ENDPOINTS) {
    return GRAPHQL_ENDPOINTS[prefix as SupportedGraphqlPrefix];
  }

  throw new Error(`Unsupported GraphQL prefix: ${prefix}`);
}

export function fetchGraphql<T>(graphQuery: GraphQuery, prefix: SupportedGraphqlPrefix): Promise<GraphResponse<T>> {
  return $fetch<GraphResponse<T>>(getGraphqlEndpoint(prefix), {
    method: "POST",
    body: graphQuery,
  });
}
