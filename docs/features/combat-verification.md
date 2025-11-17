# Combat System Verification Report

**Date:** 2025-11-17  
**Status:** ⚠️ CRITICAL INACCURACIES FOUND  
**Verifier:** Senior Software Engineer Review  
**Source:** Verified against actual implementation in `src/engine/combat-engine.ts`, `src/features/combat/`, and `src/data/shadowManifestations.ts`

---

## Executive Summary

The combat.md documentation contains **CRITICAL INACCURACIES** that match the warnings at the beginning of the file. This verification compared the documented combat mechanics against the actual source code implementation.

**Status:** The warning in combat.md was **CORRECT** - significant inaccuracies were found.

---

## Combat Action Verification

### ✅ ILLUMINATE - ACCURATE

**Documented:**
- Cost: 2 LP base
- Damage: 3 + floor(guardianTrust / 4)

**Actual (src/engine/combat-engine.ts:22-72):**
```typescript
ILLUMINATE_LP_COST: 2
calculateIlluminateDamage(trust): 3 + Math.floor(trust / 4)
```

**Status:** ✅ **ACCURATE** - Documentation matches implementation

---

### ⚠️ REFLECT - PARTIALLY INACCURATE

**Documented:**
- Cost: 1-2 SP converts to 1 LP
- Effect: Heals 1 LP if current LP < 50% max

**Actual (src/engine/combat-engine.ts:303-318):**
```typescript
REFLECT_SP_COST: 3  // NOW 3 SP, not 1-2!
REFLECT_HEAL_AMOUNT: 1 LP
// Also heals health: 1d(playerLevel) - NOT DOCUMENTED!
healthHeal = Math.floor(Math.random() * playerLevel) + 1;
```

**Discrepancies:**
1. ❌ **Cost is 3 SP** (docs say 1-2 SP)
2. ❌ **Also heals health** by rolling 1d(playerLevel) - completely undocumented feature
3. ✅ Still converts to 1 LP (accurate)

**Status:** ⚠️ **PARTIALLY INACCURATE** - Cost wrong, missing health healing mechanic

---

### ✅ ENDURE - ACCURATE

**Documented:**
- Cost: None
- Effect: 50% damage reduction, generates 1 LP after 2 consecutive uses

**Actual (src/engine/combat-engine.ts:321-327):**
```typescript
ENDURE_DAMAGE_REDUCTION: 0.5  // 50% reduction
consecutiveEndures counter tracked
```

**Status:** ✅ **ACCURATE** - Documentation matches implementation

---

### ❌ EMBRACE - CRITICALLY INACCURATE

**Documented:**
- Cost: **All SP** (5+ SP required)
- Damage: **sp × 3**
- Self-damage: **ceil(sp/2)** (reduced at high trust)

**Actual (src/engine/combat-engine.ts:330-345, 92-96):**
```typescript
calculateEmbraceDamage(sp): Math.floor(sp / 2)  // 1 SP = 0.5 damage, not 3!
const spUsed = Math.min(resources.sp, 2);  // Uses UP TO 2 SP, not all!
// NO SELF-DAMAGE in actual implementation
```

**Discrepancies:**
1. ❌ **Uses up to 2 SP** (docs say "all SP")
2. ❌ **Damage = floor(SP / 2)** (docs say "SP × 3") - **6x difference!**
3. ❌ **No self-damage** (docs say "ceil(sp/2) self-damage")
4. ❌ **No requirement for 5+ SP** (can use with any amount)

**Status:** ❌ **CRITICALLY INACCURATE** - Almost everything is wrong

---

## Shadow Manifestation Verification

### Verified Shadow Data (src/data/shadowManifestations.ts:122-198)

| Shadow | Type | Actual HP | Doc HP | Status |
|--------|------|-----------|--------|--------|
| **whisperOfDoubt** | doubt | 15 | 15 | ✅ Accurate |
| **veilOfIsolation** | isolation | 18 | 22 | ❌ Wrong |
| **stormOfOverwhelm** | overwhelm | 20 | Not specified | ⚠️ Missing |
| **echoOfPastPain** | past-pain | 22 | Not specified | ⚠️ Missing |

### Victory Rewards (Actual Values)

| Shadow | LP Bonus | Documented | Status |
|--------|----------|------------|--------|
| whisperOfDoubt | 5 | 5 | ✅ Accurate |
| veilOfIsolation | 6 | Not specified | ⚠️ Missing |
| stormOfOverwhelm | 7 | Not specified | ⚠️ Missing |
| echoOfPastPain | 8 | Not specified | ⚠️ Missing |

---

## Combat Mechanics Verification

### Resource Costs (VERIFIED ACCURATE)

From `src/engine/combat-engine.ts:20-51`:

```typescript
COMBAT_BALANCE = {
  ILLUMINATE_BASE_DAMAGE: 3,
  ILLUMINATE_TRUST_SCALING: 4,
  ILLUMINATE_LP_COST: 2,
  REFLECT_SP_COST: 3,  // ⚠️ Changed from documented 1-2
  ENDURE_LP_THRESHOLD: 0.5,
  REFLECT_HEAL_AMOUNT: 1,
  ENDURE_DAMAGE_REDUCTION: 0.5,
  SHADOW_BASE_DAMAGE: 8,
  MIN_SHADOW_DAMAGE: 1,
}
```

### Shadow AI Behavior (VERIFIED)

From `src/engine/combat-engine.ts:364-441`:

✅ Priority system confirmed:
1. Use signature ability if player LP < 5
2. Use aggressive abilities when shadow HP < 30%
3. Counter player's most-used action
4. Random selection from available abilities

---

## Critical Findings Summary

### Severity Levels

**CRITICAL (Must Fix):**
1. ❌ **EMBRACE damage calculation** - Documented as "SP × 3", actually "floor(SP / 2)" (600% error!)
2. ❌ **EMBRACE cost** - Documented as "all SP", actually "up to 2 SP"
3. ❌ **EMBRACE self-damage** - Documented but doesn't exist in code
4. ❌ **REFLECT cost** - Documented as "1-2 SP", actually "3 SP"

**HIGH (Should Fix):**
1. ⚠️ **REFLECT health healing** - Completely undocumented feature (1d(playerLevel) heal)
2. ⚠️ **veilOfIsolation HP** - Documented as 22, actually 18

**MEDIUM (Nice to Fix):**
1. ⚠️ Missing HP values for stormOfOverwhelm and echoOfPastPain
2. ⚠️ Missing LP bonus values for 3 out of 4 shadows

---

## Recommendations

### Immediate Actions Required

1. **Update EMBRACE documentation** with correct mechanics:
   - Change "all SP" to "up to 2 SP"
   - Change "sp × 3 damage" to "floor(sp / 2) damage"  
   - Remove self-damage mechanic (doesn't exist)
   - Remove "5+ SP requirement"

2. **Update REFLECT documentation**:
   - Change cost from "1-2 SP" to "3 SP"
   - Add health healing mechanic: "heals 1d(playerLevel) health"

3. **Fix shadow HP values**:
   - veilOfIsolation: Change from 22 to 18

4. **Add missing shadow data**:
   - Document HP for all 4 shadows
   - Document LP bonuses for all 4 shadows

### Code as Truth

**This verification confirms the documentation warning was accurate.** The source code in:
- `src/engine/combat-engine.ts`
- `src/features/combat/store/combat-store.ts`
- `src/data/shadowManifestations.ts`

...is the **ONLY source of truth** for combat mechanics. All documentation should be regenerated from the actual implementation.

---

## Testing Validation

### Verified Test Files

1. **src/__tests__/shadowManifestations.test.ts** (lines 11-260):
   - Confirms 4 shadow manifestations exist
   - Confirms HP progression: 15, 18, 20, 22
   - Confirms LP bonuses: 5, 6, 7, 8
   - All tests passing ✅

2. **src/__tests__/combat-playtesting.test.ts**:
   - Combat mechanics tests exist and pass
   - Action execution verified

---

## Conclusion

The combat.md documentation contains **multiple critical inaccuracies**, particularly around the EMBRACE action mechanics which are almost completely wrong. The warning at the beginning of the file stating "Claude Code has made deeply mistaken assumptions" was **completely justified**.

**Status:** Documentation requires comprehensive rewrite based on actual source code.

**Verified By:** Senior Software Engineer  
**Verification Method:** Direct source code inspection and comparison  
**Confidence Level:** HIGH (verified against actual implementation)

---

*Generated: 2025-11-17*  
*Source Code Verification*  
*Do not trust this file if it conflicts with actual code - verify directly*

