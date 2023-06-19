type LooseAutocomplete<T extends string> = T | Omit<string, T>;

export type Metafield = {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: LooseAutocomplete<MetafieldTypes>;
  ownerType: MetafieldOwnerType;
  owner: {
    id: string;
  };
  definition: null | Definition;
};

export type Definition = {
  name: string;
  namespace: string;
  key: string;
  type: {
    name: LooseAutocomplete<MetafieldTypes>;
    category: LooseAutocomplete<"REFERENCE">;
  };
  ownerType: MetafieldOwnerType;
};

export type MetafieldsSetInput = {
  ownerId: string;
  namespace: string;
  key: string;
  type: Metafield["type"];
  value: string;
};

type MetafieldOwnerType =
  | "API_PERMISSION"
  | "COMPANY"
  | "COMPANY_LOCATION"
  | "PAYMENT_CUSTOMIZATION"
  | "CUSTOMER"
  | "DELIVERY_CUSTOMIZATION"
  | "DRAFTORDER"
  | "MARKET"
  | "COLLECTION"
  | "MEDIA_IMAGE"
  | "PRODUCT"
  | "PRODUCTVARIANT"
  | "ARTICLE"
  | "BLOG"
  | "PAGE"
  | "DISCOUNT"
  | "ORDER"
  | "LOCATION"
  | "SHOP"
  /** @depricated */
  | "PRODUCTIMAGE";

type MetafieldTypes =
  | "boolean"
  | "color"
  | "date"
  | "date_time"
  | "dimension"
  | "json"
  | "money"
  | "multi_line_text_field"
  | "number_decimal"
  | "number_integer"
  | "rating"
  | "rich_text_field"
  | "single_line_text_field"
  | "url"
  | "volume"
  | "weight"
  | "collection_reference"
  | "file_reference"
  | "metaobject_reference"
  | "mixed_reference"
  | "page_reference"
  | "product_reference"
  | "variant_reference"
  | "list.collection_reference"
  | "list.color"
  | "list.date"
  | "list.date_time"
  | "list.dimension"
  | "list.file_reference"
  | "list.metaobject_reference"
  | "list.mixed_reference"
  | "list.number_integer"
  | "list.number_decimal"
  | "list.page_reference"
  | "list.product_reference"
  | "list.rating"
  | "list.single_line_text_field"
  | "list.url"
  | "list.variant_reference"
  | "list.volume"
  | "list.weight";
