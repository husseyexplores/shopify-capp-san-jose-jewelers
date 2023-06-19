import { getClient } from "../shopifyClients";
import type { Metaobject } from "./types/metaobject";
import { deserializeDataWithTypes, serializeId } from "./utils";

const FRAGMENTS = {
  metaobject: /* GraphQL */ `
    fragment MetaobjectFragment on Metaobject {
      id
      handle
      displayName
      type
      fields {
        key
        value
        type
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
        metaobject: null | Metaobject;
      }>({
        query: /* GraphQL */ `
          query metaobject($id: ID!) {
            metaobject(id: $id) {
              ...MetaobjectFragment
            }
          }

          ${FRAGMENTS.metaobject}
        `,
      })
      .then((result) => result.data.metaobject);
  },

  byIds: async <T extends string>(input: {
    variables: { ids: T[] };
    auth: { shop: string; accessToken: string };
  }) => {
    //
    const queryBodyChunks = input.variables.ids.map((id) => {
      return `
        ${serializeId(id)}: metaobject(id: "${id}") {
          ...MetaobjectFragment
        }
      `;
    });

    return getClient(input.auth)
      .gql<{
        [id in T]: null | Metaobject;
      }>({
        query: /* GraphQL */ `
          query metaobjects {
            ${queryBodyChunks.join("\n")}
          }

          ${FRAGMENTS.metaobject}
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

export const mutation = {};
