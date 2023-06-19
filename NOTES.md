# Notes regarding the repo

This is meant to be a custom Shopify app, deployed on Firebase.

## App purpose(s)

### Metaobject to metafield sync

The colors are defined as metaobjects (custom data) for better management.\
They are then assigned using metafields to the products.

This is an ideal scenario from management pespective. But the problem is that Shopify does not support collection filtering with metaobject metafields.

So what's the solution?

Sync the metaobject metafield values into simple string metafield so it's searchable.

**How?**

Listen on product update webhook.
If the metaobject values are not equal to the metafield values, update the metafield values.
