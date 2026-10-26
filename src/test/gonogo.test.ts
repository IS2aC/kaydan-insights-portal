import { describe, expect, it } from "vitest";
import { analyses, computeIndex, verdictFor } from "@/lib/gonogo";

describe("Indice de faisabilité", () => {
  it("pondère S1..S4 par 4/3/2/1 et donne 58 sur le dossier d'exemple", () => {
    expect(computeIndex(analyses[0].report!.levers)).toBe(58);
  });
  it("Go à partir de 70", () => expect(verdictFor(70)).toBe("go"));
  it("à arbitrer entre 50 et 69", () => expect(verdictFor(58)).toBe("arbitrer"));
  it("NoGo sous 50", () => expect(verdictFor(49)).toBe("nogo"));
});
