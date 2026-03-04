export type PersistenceDriver = "memory" | "prisma";

function normalize(value: string | undefined): PersistenceDriver | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();

  if (lower === "memory" || lower === "prisma") {
    return lower;
  }

  return undefined;
}

export function getPersistenceDriver(): PersistenceDriver {
  if (process.env.NODE_ENV === "test") {
    return "memory";
  }

  const explicit = normalize(process.env.PN_FORM_PERSISTENCE);
  if (explicit) return explicit;

  return "prisma";
}
