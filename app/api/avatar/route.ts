import { toFacehashHandler } from "facehash/next";

export const { GET } = toFacehashHandler({
  size: 200,
  variant: "gradient",
  showInitial: true,
});
