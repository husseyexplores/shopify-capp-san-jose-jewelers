export function serializeId(id: string) {
  return id.replace(/\:/g, "_rplc_colon").replace(/\//g, "_rplc_slash");
}
export function deserializeId(id: string) {
  return id.replace(/_rplc_colon/g, ":").replace(/_rplc_slash/g, "/");
}

export function deserializeDataWithTypes<T extends string, U>(data: {
  [id in T]: null | U;
}) {
  const dataWithOrignalIds = {} as typeof data;

  for (const id in data) {
    if (Object.prototype.hasOwnProperty.call(data, id)) {
      const deserializedId = deserializeId(id) as typeof id;
      dataWithOrignalIds[deserializedId] = data[id];
    }
  }
  return dataWithOrignalIds;
}
