/**
 * Shared translation dictionary type.
 * Leaves are strings or string arrays so that both id and en are assignable.
 * Nested structure is inferred from the actual dictionaries.
 * eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export type Dictionary = Record<string, string | string[] | Record<string, any>>
