import { describe, it, expect, beforeEach } from 'vitest';
import {
  shadowManifestations,
  createShadowManifestation,
  whisperOfDoubt,
  veilOfIsolation,
  stormOfOverwhelm,
  echoOfPastPain,
  SHADOW_IDS
} from '../data/shadowManifestations';
import type { CombatState } from '../store/game-store';

describe('Shadow Manifestations', () => {
  let mockCombatState: CombatState;

  beforeEach(() => {
    mockCombatState = {
      inCombat: true,
      currentEnemy: null,
      resources: { lp: 10, sp: 5 },
      turn: 1,
      log: [],
      damageMultiplier: 1,
      damageReduction: 1,
      healingBlocked: 0,
      lpGenerationBlocked: 0,
      skipNextTurn: false,
      consecutiveEndures: 0,
      preferredActions: {
        ILLUMINATE: 0,
        REFLECT: 0,
        ENDURE: 0,
        EMBRACE: 0
      },
      growthInsights: [],
      combatReflections: []
    };
  });

  describe('Shadow Manifestation Data Structure', () => {
    it('should have all 4 shadow manifestations defined', () => {
      expect(Object.keys(shadowManifestations)).toHaveLength(4);
      expect(shadowManifestations.whisperOfDoubt).toBeDefined();
      expect(shadowManifestations.veilOfIsolation).toBeDefined();
      expect(shadowManifestations.stormOfOverwhelm).toBeDefined();
      expect(shadowManifestations.echoOfPastPain).toBeDefined();
    });

    it('should have proper shadow types', () => {
      expect(whisperOfDoubt.type).toBe('doubt');
      expect(veilOfIsolation.type).toBe('isolation');
      expect(stormOfOverwhelm.type).toBe('overwhelm');
      expect(echoOfPastPain.type).toBe('past-pain');
    });

    it('should have balanced HP progression', () => {
      expect(whisperOfDoubt.maxHP).toBe(15); // Easiest
      expect(veilOfIsolation.maxHP).toBe(18);
      expect(stormOfOverwhelm.maxHP).toBe(20);
      expect(echoOfPastPain.maxHP).toBe(22); // Hardest
    });

    it('should have therapeutic insights for each shadow', () => {
      Object.values(shadowManifestations).forEach(shadow => {
        expect(shadow.therapeuticInsight).toBeTruthy();
        expect(shadow.therapeuticInsight.length).toBeGreaterThan(20);
      });
    });

    it('should have victory rewards with increasing LP bonuses', () => {
      expect(whisperOfDoubt.victoryReward.lpBonus).toBe(5);
      expect(veilOfIsolation.victoryReward.lpBonus).toBe(6);
      expect(stormOfOverwhelm.victoryReward.lpBonus).toBe(7);
      expect(echoOfPastPain.victoryReward.lpBonus).toBe(8);
    });
  });

  describe('Shadow Abilities', () => {
    it('should have 2 abilities per shadow', () => {
      Object.values(shadowManifestations).forEach(shadow => {
        expect(shadow.abilities).toHaveLength(2);
        shadow.abilities.forEach(ability => {
          expect(ability.id).toBeTruthy();
          expect(ability.name).toBeTruthy();
          expect(ability.cooldown).toBeGreaterThan(0);
          expect(ability.description).toBeTruthy();
          expect(typeof ability.effect).toBe('function');
        });
      });
    });

    describe('Doubt Shadow Abilities', () => {
      it('should have self-questioning ability that drains LP and blocks LP generation', () => {
        const ability = whisperOfDoubt.abilities.find(a => a.id === 'self-questioning');
        expect(ability).toBeDefined();
        
        const initialLP = mockCombatState.resources.lp;
        ability!.effect(mockCombatState);
        
        expect(mockCombatState.resources.lp).toBe(initialLP - 1);
        expect(mockCombatState.lpGenerationBlocked).toBeGreaterThanOrEqual(2);
      });

      it('should have magnification ability that doubles damage', () => {
        const ability = whisperOfDoubt.abilities.find(a => a.id === 'magnification');
        expect(ability).toBeDefined();
        
        ability!.effect(mockCombatState);
        expect(mockCombatState.damageMultiplier).toBe(2);
      });
    });

    describe('Isolation Shadow Abilities', () => {
      it('should have withdrawal ability that blocks healing', () => {
        const ability = veilOfIsolation.abilities.find(a => a.id === 'withdrawal');
        expect(ability).toBeDefined();
        
        ability!.effect(mockCombatState);
        expect(mockCombatState.healingBlocked).toBeGreaterThanOrEqual(3);
      });

      it('should have loneliness ability that converts LP to SP', () => {
        const ability = veilOfIsolation.abilities.find(a => a.id === 'loneliness');
        expect(ability).toBeDefined();
        
        const initialLP = mockCombatState.resources.lp;
        const initialSP = mockCombatState.resources.sp;
        ability!.effect(mockCombatState);
        
        const lpLost = initialLP - mockCombatState.resources.lp;
        const spGained = mockCombatState.resources.sp - initialSP;
        expect(lpLost).toBe(spGained);
        expect(lpLost).toBeGreaterThan(0);
        expect(lpLost).toBeLessThanOrEqual(3);
      });
    });

    describe('Overwhelm Shadow Abilities', () => {
      it('should have cascade ability that forces skip turn', () => {
        const ability = stormOfOverwhelm.abilities.find(a => a.id === 'cascade');
        expect(ability).toBeDefined();
        
        ability!.effect(mockCombatState);
        expect(mockCombatState.skipNextTurn).toBe(true);
      });

      it('should have pressure ability that drains resources', () => {
        const ability = stormOfOverwhelm.abilities.find(a => a.id === 'pressure');
        expect(ability).toBeDefined();
        
        const initialLP = mockCombatState.resources.lp;
        const initialSP = mockCombatState.resources.sp;
        ability!.effect(mockCombatState);
        
        expect(mockCombatState.resources.lp).toBeLessThan(initialLP);
        expect(mockCombatState.resources.sp).toBeLessThan(initialSP);
      });
    });

    describe('Past Pain Shadow Abilities', () => {
      it('should have flashback ability that increases vulnerability and generates SP', () => {
        const ability = echoOfPastPain.abilities.find(a => a.id === 'flashback');
        expect(ability).toBeDefined();
        
        const initialSP = mockCombatState.resources.sp;
        ability!.effect(mockCombatState);
        
        expect(mockCombatState.damageReduction).toBe(0.5);
        expect(mockCombatState.resources.sp).toBe(initialSP + 2);
      });

      it('should have rumination ability that blocks LP generation and healing', () => {
        const ability = echoOfPastPain.abilities.find(a => a.id === 'rumination');
        expect(ability).toBeDefined();
        
        ability!.effect(mockCombatState);
        expect(mockCombatState.lpGenerationBlocked).toBeGreaterThanOrEqual(3);
        expect(mockCombatState.healingBlocked).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('createShadowManifestation Function', () => {
    it('should create a fresh copy of a shadow manifestation', () => {
      const shadow = createShadowManifestation(SHADOW_IDS.WHISPER_OF_DOUBT);
      expect(shadow).toBeDefined();
      expect(shadow!.id).toBe('whisper-of-doubt');
      expect(shadow!.currentHP).toBe(shadow!.maxHP);
    });

    it('should reset ability cooldowns to 0', () => {
      const shadow = createShadowManifestation(SHADOW_IDS.VEIL_OF_ISOLATION);
      expect(shadow).toBeDefined();
      shadow!.abilities.forEach(ability => {
        expect(ability.currentCooldown).toBe(0);
      });
    });

    it('should return null for invalid shadow ID', () => {
      const shadow = createShadowManifestation('invalid-shadow-id');
      expect(shadow).toBeNull();
    });

    it('should create independent copies (no reference sharing)', () => {
      const shadow1 = createShadowManifestation(SHADOW_IDS.STORM_OF_OVERWHELM);
      const shadow2 = createShadowManifestation(SHADOW_IDS.STORM_OF_OVERWHELM);
      
      expect(shadow1).not.toBe(shadow2);
      expect(shadow1!.abilities).not.toBe(shadow2!.abilities);
      
      // Modify one shadow and ensure the other is unaffected
      shadow1!.currentHP = 10;
      shadow1!.abilities[0].currentCooldown = 5;
      
      expect(shadow2!.currentHP).toBe(shadow2!.maxHP);
      expect(shadow2!.abilities[0].currentCooldown).toBe(0);
    });
  });

  describe('Shadow Constants', () => {
    it('should export SHADOW_IDS constants', () => {
      expect(SHADOW_IDS.WHISPER_OF_DOUBT).toBe('whisper-of-doubt');
      expect(SHADOW_IDS.VEIL_OF_ISOLATION).toBe('veil-of-isolation');
      expect(SHADOW_IDS.STORM_OF_OVERWHELM).toBe('storm-of-overwhelm');
      expect(SHADOW_IDS.ECHO_OF_PAST_PAIN).toBe('echo-of-past-pain');
    });

    it('should export individual shadow references', () => {
      expect(whisperOfDoubt).toBe(shadowManifestations.whisperOfDoubt);
      expect(veilOfIsolation).toBe(shadowManifestations.veilOfIsolation);
      expect(stormOfOverwhelm).toBe(shadowManifestations.stormOfOverwhelm);
      expect(echoOfPastPain).toBe(shadowManifestations.echoOfPastPain);
    });
  });

  describe('Therapeutic Design Validation', () => {
    it('should have meaningful therapeutic insights', () => {
      Object.values(shadowManifestations).forEach(shadow => {
        expect(shadow.therapeuticInsight).toMatch(/\w+/);
        expect(shadow.therapeuticInsight.length).toBeGreaterThan(50);
      });
    });

    it('should have growth-oriented victory messages', () => {
      Object.values(shadowManifestations).forEach(shadow => {
        expect(shadow.victoryReward.growthMessage).toMatch(/\w+/);
        expect(shadow.victoryReward.permanentBenefit).toMatch(/\w+/);
      });
    });

    it('should have balanced cooldowns for abilities', () => {
      Object.values(shadowManifestations).forEach(shadow => {
        shadow.abilities.forEach(ability => {
          expect(ability.cooldown).toBeGreaterThanOrEqual(3);
          expect(ability.cooldown).toBeLessThanOrEqual(6);
        });
      });
    });
  });
});
