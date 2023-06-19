import { getClient } from "../shopifyClients";
import { serializeId, deserializeDataWithTypes } from "./utils";
import type { Metafield, MetafieldsSetInput } from "./types/metafield";

const FRAGMENTS = {
  metafield: /* GraphQL */ `
    fragment MetafieldFragment on Metafield {
      id
      namespace
      key
      value
      type
      ownerType
      owner {
        ... on Node {
          id
        }
      }
      definition {
        name
        namespace
        key
        type {
          name
          category
        }
        ownerType
      }
    }
  `,
};

export const query = {
  byId: async (input: {
    variables: { id: string };
    auth: { shop: string; accessToken: string };
  }) => {
    return getClient(input.auth)
      .gql<{
        metafield: null | Metafield;
      }>({
        query: /* GraphQL */ `
          query metafield($id: ID!) {
            metafield(id: $id) {
              ...MetafieldFragment
            }
          }

          ${FRAGMENTS.metafield}
        `,
      })
      .then((result) => result.data.metafield);
  },

  byIds: async <T extends string>(input: {
    variables: { ids: T[] };
    auth: { shop: string; accessToken: string };
  }) => {
    //
    const queryBodyChunks = input.variables.ids.map((id) => {
      return `
        ${serializeId(id)}: metafield(id: "${id}") {
          ...MetafieldFragment
        }
      `;
    });

    return getClient(input.auth)
      .gql<{
        [id in T]: null | Metafield;
      }>({
        query: /* GraphQL */ `
          query metafields {
            ${queryBodyChunks.join("\n")}
          }

          ${FRAGMENTS.metafield}
        `,
      })
      .then((result) => {
        const byId = deserializeDataWithTypes(result.data);
        const list = (Object.keys(byId) as T[]).map((id) => {
          return byId[id];
        });
        return { byId, list };
      });
  },
};

export const mutation = {
  metafieldsSet: async (input: {
    variables: {
      metafields: MetafieldsSetInput[];
    };
    auth: { shop: string; accessToken: string };
  }) => {
    return getClient(input.auth)
      .gql<{
        metafields: null | Metafield[];
        userErrors: {
          code:
            | "BLANK"
            | "INCLUSION"
            | "LESS_THAN_OR_EQUAL_TO"
            | "PRESENT"
            | "TOO_SHORT"
            | "TOO_LONG"
            | "INVALID_VALUE"
            | "INVALID_TYPE"
            | "APP_NOT_AUTHORIZED";

          elementIndex: number;
          field: string[];
          message: string;
        }[];
      }>({
        query: /* GraphQL */ `
          mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
              metafields {
                ...MetafieldFragment
              }
              userErrors {
                code
                elementIndex
                field
                message
              }
            }
          }

          ${FRAGMENTS.metafield}
        `,
        variables: {
          metafields: input.variables.metafields,
        },
      })
      .then((result) => result.data);
  },
};
