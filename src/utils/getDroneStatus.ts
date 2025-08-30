export const isAllowedToFly = (reg: string): boolean => {
  if (!reg || reg.trim() === "") {
    return false;
  }

  const parts = reg.split("-");
  const lastPart = parts[parts.length - 1];

  return lastPart.toUpperCase().startsWith("B");
};
