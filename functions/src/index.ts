import { onRequest } from "firebase-functions/v2/https";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as logger from "firebase-functions/logger";
import * as metaobjectsToMetafields_ from "./handlers/metaobjectsToMetafields";
import * as install_ from "./handlers/install";
import * as debug_ from "./handlers/debug";
import type { PubSubToJsonShopify } from "./types";
import { C } from "./lib/firebase-admin";

export const debug = onRequest({ maxInstances: 1 }, (request, response) => {
  response.json(debug_.handler());
});

export const install = onRequest(
  {
    maxInstances: 1,
  },
  install_.onRequest
);

export const metaobjectsToMetafields = onMessagePublished(
  {
    topic: "metaobjects_to_metafields_sync",
  },
  async (event) => {
    const data = event.data.message.json;
    const json: PubSubToJsonShopify = event?.data?.message?.toJSON();
    const shop = json?.attributes?.["X-Shopify-Shop-Domain"];
    if (!shop) return true;

    const shopRef = await C.stores.doc(shop).get();
    if (!shopRef.exists) return true;

    const accessToken = shopRef.data()?.accessToken;
    if (typeof accessToken !== "string") return true;
    const auth = { shop, accessToken };

    logger.log(
      `[shop::${shop}] metaobjectsToMetafields triggered - TOPIC:${json.attributes["X-Shopify-Topic"]}`,
      {
        payload: data,
        eventMessageJson: json,
      }
    );
    return metaobjectsToMetafields_.handler({ payload: data, auth });
  }
);
