export type Nullable<T> = T|null|undefined;
// NaNはtypeof NaNとする必要があり、number型と混同してしまうのでこのFalsyでは非採用
export type Falsy = null | undefined | false | 0 | -0 | 0n | "";
