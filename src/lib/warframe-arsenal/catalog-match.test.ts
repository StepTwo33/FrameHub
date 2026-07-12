import { describe, expect, it } from "vitest";
import { findModByName, parseCustomItemName } from "@/lib/warframe-arsenal/catalog-match";
import {
  findWeaponByLotusPath,
  mapModularPartsFromArsenal,
  resolveHelminthOverride,
} from "@/lib/warframe-arsenal/lotus-resolve";

describe("warframe arsenal catalog match", () => {
  it("parses custom weapon names from twitch itemName", () => {
    expect(parseCustomItemName("/Lotus/Language/Weapons/CrpBEFluxRifleName|FEDIA MIMESRO")).toBe("FEDIA MIMESRO");
  });

  it("finds catalog mods by display name", () => {
    expect(findModByName("Primed Point Blank")?.id).toBe("primed_point_blank");
    expect(findModByName("Serration")?.id).toBeTruthy();
  });
});

describe("warframe arsenal lotus resolve", () => {
  it("resolves helminth empower from DE ability path", () => {
    const result = resolveHelminthOverride({
      ability: "/Lotus/Powersuits/PowersuitAbilities/HelminthStrengthAbility",
      index: 3,
    });
    expect(result?.helminthAbilityId).toBe("helminth_empower");
    expect(result?.helminthSlot).toBe(2);
  });

  it("resolves subsumed Roar from ability path", () => {
    const result = resolveHelminthOverride({
      ability: "/Lotus/Powersuits/PowersuitAbilities/RhinoRoarAbility",
      index: 2,
    });
    expect(result?.helminthAbilityId).toBe("subsume_rhino");
    expect(result?.helminthSlot).toBe(1);
  });

  it("resolves weapons by lotus uniqueName", () => {
    const weapon = findWeaponByLotusPath("/Lotus/Weapons/Corpus/BoardExec/Primary/CrpBEFluxRifle/CrpBEFluxRifle");
    expect(weapon?.id).toBe("tenet_flux_rifle");
  });

  it("maps amp modular parts from twitch payload shape", () => {
    const mapped = mapModularPartsFromArsenal({
      LWPT_AMP_OCULUS: "/Lotus/Weapons/Corpus/OperatorAmplifiers/Set1/Barrel/CorpAmpSet1BarrelPartB",
      LWPT_AMP_CORE: "/Lotus/Weapons/Sentients/OperatorAmplifiers/Set1/Chassis/SentAmpSet1ChassisPartA",
      LWPT_AMP_BRACE: "/Lotus/Weapons/Sentients/OperatorAmplifiers/Set2/Grip/SentAmpSet2GripPartA",
    });
    expect(mapped?.data.modularType).toBe("amp");
    expect(mapped?.data.parts.prism).toBe("amp_lega");
    expect(mapped?.data.parts.scaffold).toBe("amp_pencha");
    expect(mapped?.data.parts.brace).toBe("amp_anspatha");
  });
});
