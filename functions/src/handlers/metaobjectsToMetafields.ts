import * as logger from "firebase-functions/logger";
import * as metaobjectQ from "../lib/graphql/metaobject";
import * as metafieldQ from "../lib/graphql/metafield";
import { MetafieldsSetInput } from "../lib/graphql/types/metafield";
import { chunkify } from "../lib/utils";

type HandlerOptions = {
  payload: unknown; // fulfillment or order object
  auth: { shop: string; accessToken: string };
};

type ProductPayload = {
  id: number;
  published_scope: string;
  product_type: string;
  metafields: RestMetafield[];
  vendor: string;
  handle: string;
  status: string;
  admin_graphql_api_id: string;
};

type RestMetafield = {
  id: number;
  type: string;
  value: string;
  owner_resource: string;
  key: string;
  description: any;
  admin_graphql_api_id: string;
  namespace: string;
  created_at: string;
  owner_id: number;
  updated_at: string;
};

const TRACKED_NS = {
  master: "custom",
  slave: "srch",
} as const;
export const TRACKED_MF_NAMESPACES = [TRACKED_NS.master, TRACKED_NS.slave];

export async function handler({ payload, auth }: HandlerOptions) {
  logger.debug(
    `[shop::${
      auth.shop
    }] metaobjectsToMetafields handler triggered [payload:${!!payload}]`,
    payload
  );

  if (!isValidPaylod(payload)) {
    logger.warn(`[shop::${auth.shop}] Invalid payload`, { payload });
    return true;
  }

  const masterMetaobjectMetafields = payload.metafields.filter((x) => {
    return (
      x.namespace === TRACKED_NS.master && x.type === "metaobject_reference"
    );
  });

  // No masters
  if (masterMetaobjectMetafields.length == 0) {
    return true;
  }

  // fetch metaobject values
  const metaobjects = await metaobjectQ.query.byIds({
    auth,
    variables: {
      // `value` is the ID of metaobject
      // eg: gid://shopify/Metaobject/4891574361
      ids: masterMetaobjectMetafields.map((x) => x.value),
    },
  });

  const slaveTextMetafields = payload.metafields.filter((x) => {
    return (
      x.namespace === TRACKED_NS.slave && x.type === "single_line_text_field"
    );
  });

  const outOfSyncedList = metaobjects.list.reduce<MetafieldsSetInput[]>(
    (acc, metaobject) => {
      if (!metaobject) {
        return acc;
      }
      const slave = slaveTextMetafields.find(
        (mf) => mf.key === metaobject.type
      );
      if (!slave || slave.value !== metaobject.displayName) {
        acc.push({
          namespace: TRACKED_NS.slave,
          key: metaobject.type,
          ownerId: payload.admin_graphql_api_id,
          type: "single_line_text_field",
          value: metaobject.displayName,
        });
      }
      // return slave.value === metaobject.displayName;
      return acc;
    },
    []
  );

  if (outOfSyncedList.length < 1) {
    logger.log(`[shop::${auth.shop}] No out of sync metafields found`, {
      metaobjects,
      slaveTextMetafields,
    });

    return;
  }

  logger.log(
    `[shop::${auth.shop}] syncing metafields for product: ${payload.id}`,
    {
      outOfSyncedList,
    }
  );

  // max 25 metafields are allowed per batch of `metafieldsSet`
  await Promise.all(
    chunkify(outOfSyncedList, 25).map((metafieldsSetInput) => {
      return metafieldQ.mutation.metafieldsSet({
        auth,
        variables: { metafields: metafieldsSetInput },
      });
    })
  );

  logger.log(
    `[shop::${auth.shop}] successfully synced metafields for product: ${payload.id}`
  );

  return true;
}

function isValidPaylod(input: unknown): input is ProductPayload {
  return (
    input != null &&
    typeof input === "object" &&
    "admin_graphql_api_id" in input &&
    typeof input.admin_graphql_api_id === "string" &&
    "handle" in input &&
    typeof input.handle === "string" &&
    "metafields" in input &&
    Array.isArray(input.metafields)
  );
}
