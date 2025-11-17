import { describe, it, expect } from 'vitest';
import { shadowManifestations, createShadowManifestation } from '@/data/shadowManifestations';

/**
 * Test suite for enhanced therapeutic messaging in the combat system
 * 
 * This test suite validates that the therapeutic messaging improvements
 * provide evidence-based, compassionate, and actionable guidance for
 * emotional regulation and mental health support.
 */

describe('Enhanced Therapeutic Messaging', () => {
  describe('Shadow Ability Descriptions', () => {
    it('should provide empathetic and specific descriptions for doubt abilities', () => {
      const whisperOfDoubt = shadowManifestations.whisperOfDoubt;
      
      // Test Self-Questioning ability description
      const selfQuestioningAbility = whisperOfDoubt.abilities.find(a => a.id === 'self-questioning');
      expect(selfQuestioningAbility?.description).toContain('inner critic');
      expect(selfQuestioningAbility?.description).toContain('What if you\'re wrong?');
      expect(selfQuestioningAbility?.description).not.toContain('Whispers of uncertainty');
      
      // Test Magnification ability description
      const magnificationAbility = whisperOfDoubt.abilities.find(a => a.id === 'magnification');
      expect(magnificationAbility?.description).toContain('Catastrophic thinking');
      expect(magnificationAbility?.description).toContain('overwhelming disasters');
    });

    it('should provide compassionate descriptions for isolation abilities', () => {
      const veilOfIsolation = shadowManifestations.veilOfIsolation;
      
      // Test Withdrawal ability description
      const withdrawalAbility = veilOfIsolation.abilities.find(a => a.id === 'withdrawal');
      expect(withdrawalAbility?.description).toContain('protective walls');
      expect(withdrawalAbility?.description).toContain('feels safer but blocks recovery');
      
      // Test Loneliness ability description
      const lonelinessAbility = veilOfIsolation.abilities.find(a => a.id === 'loneliness');
      expect(lonelinessAbility?.description).toContain('No one understands');
      expect(lonelinessAbility?.description).toContain('disconnection grows stronger');
    });

    it('should provide actionable descriptions for overwhelm abilities', () => {
      const stormOfOverwhelm = shadowManifestations.stormOfOverwhelm;
      
      // Test Cascade ability description
      const cascadeAbility = stormOfOverwhelm.abilities.find(a => a.id === 'cascade');
      expect(cascadeAbility?.description).toContain('Everything must be done NOW!');
      expect(cascadeAbility?.description).toContain('analysis paralysis');
      
      // Test Pressure ability description
      const pressureAbility = stormOfOverwhelm.abilities.find(a => a.id === 'pressure');
      expect(pressureAbility?.description).toContain('weight of expectations');
      expect(pressureAbility?.description).toContain('impossibly heavy');
    });

    it('should provide trauma-informed descriptions for past pain abilities', () => {
      const echoOfPastPain = shadowManifestations.echoOfPastPain;
      
      // Test Flashback ability description
      const flashbackAbility = echoOfPastPain.abilities.find(a => a.id === 'flashback');
      expect(flashbackAbility?.description).toContain('past crashes into the present');
      expect(flashbackAbility?.description).toContain('emotionally exposed');
      
      // Test Rumination ability description
      const ruminationAbility = echoOfPastPain.abilities.find(a => a.id === 'rumination');
      expect(ruminationAbility?.description).toContain('What if I had...');
      expect(ruminationAbility?.description).toContain('prevent healing');
    });
  });

  describe('Therapeutic Insights', () => {
    it('should provide evidence-based therapeutic insights for doubt', () => {
      const insight = shadowManifestations.whisperOfDoubt.therapeuticInsight;
      
      expect(insight).toContain('self-compassion');
      expect(insight).toContain('I can handle uncertainty');
      expect(insight).toContain('Notice doubt without judgment');
      expect(insight).toContain('one small step forward');
    });

    it('should provide connection-focused insights for isolation', () => {
      const insight = shadowManifestations.veilOfIsolation.therapeuticInsight;
      
      expect(insight).toContain('I deserve connection and support');
      expect(insight).toContain('Start small');
      expect(insight).toContain('one text, one call');
    });

    it('should provide grounding techniques for overwhelm', () => {
      const insight = shadowManifestations.stormOfOverwhelm.therapeuticInsight;
      
      expect(insight).toContain('pause and breathe');
      expect(insight).toContain('What truly needs attention right now?');
      expect(insight).toContain('next right step');
      expect(insight).toContain('I can only do one thing at a time');
    });

    it('should provide trauma-informed insights for past pain', () => {
      const insight = shadowManifestations.echoOfPastPain.therapeuticInsight;
      
      expect(insight).toContain('part of your story, not the whole story');
      expect(insight).toContain('I survived this, and I\'m still here');
      expect(insight).toContain('transforms your relationship with it');
    });
  });

  describe('Victory Reward Messages', () => {
    it('should provide empowering victory messages that acknowledge growth', () => {
      const doubtReward = shadowManifestations.whisperOfDoubt.victoryReward;
      expect(doubtReward.growthMessage).toContain('inner critic has become a gentle advisor');
      expect(doubtReward.permanentBenefit).toContain('self-compassion');
      
      const isolationReward = shadowManifestations.veilOfIsolation.victoryReward;
      expect(isolationReward.growthMessage).toContain('walls have become bridges');
      expect(isolationReward.permanentBenefit).toContain('authentic relationships');
      
      const overwhelmReward = shadowManifestations.stormOfOverwhelm.victoryReward;
      expect(overwhelmReward.growthMessage).toContain('eye of the storm');
      expect(overwhelmReward.permanentBenefit).toContain('stress response regulation');
      
      const pastPainReward = shadowManifestations.echoOfPastPain.victoryReward;
      expect(pastPainReward.growthMessage).toContain('scars have become sacred');
      expect(pastPainReward.permanentBenefit).toContain('Post-traumatic growth');
    });
  });

  describe('Shadow Manifestation Creation', () => {
    it('should create shadow manifestations with enhanced therapeutic messaging', () => {
      const createdShadow = createShadowManifestation('whisper-of-doubt');
      
      expect(createdShadow).not.toBeNull();
      expect(createdShadow?.therapeuticInsight).toContain('self-compassion');
      expect(createdShadow?.abilities[0].description).toContain('inner critic');
    });

    it('should maintain therapeutic consistency across all shadow types', () => {
      const shadowIds = ['whisper-of-doubt', 'veil-of-isolation', 'storm-of-overwhelm', 'echo-of-past-pain'];
      
      shadowIds.forEach(shadowId => {
        const shadow = createShadowManifestation(shadowId);
        expect(shadow).not.toBeNull();
        expect(shadow?.therapeuticInsight).toBeTruthy();
        expect(shadow?.therapeuticInsight.length).toBeGreaterThan(50); // Substantial insight
        expect(shadow?.victoryReward.growthMessage).toBeTruthy();
        expect(shadow?.victoryReward.permanentBenefit).toBeTruthy();
      });
    });
  });

  describe('Therapeutic Language Quality', () => {
    it('should use person-first, empowering language', () => {
      const allInsights = Object.values(shadowManifestations).map(s => s.therapeuticInsight);
      const allGrowthMessages = Object.values(shadowManifestations).map(s => s.victoryReward.growthMessage);
      const allDescriptions = Object.values(shadowManifestations)
        .flatMap(s => s.abilities.map(a => a.description));
      
      const allText = [...allInsights, ...allGrowthMessages, ...allDescriptions].join(' ');
      
      // Should avoid pathologizing language
      expect(allText).not.toContain('disorder');
      expect(allText).not.toContain('broken');
      expect(allText).not.toContain('damaged');
      
      // Should use empowering, growth-oriented language
      expect(allText).toContain('courage');
      expect(allText).toContain('strength');
      expect(allText).toContain('growth');
      expect(allText).toContain('healing');
    });

    it('should provide specific, actionable guidance', () => {
      const allInsights = Object.values(shadowManifestations).map(s => s.therapeuticInsight);
      
      allInsights.forEach(insight => {
        // Should contain specific actions or phrases
        const hasSpecificGuidance = 
          insight.includes('"') || // Contains specific phrases to use
          insight.includes('Ask:') || // Contains specific questions
          insight.includes('Start small') || // Contains specific actions
          insight.includes('one') || // Contains specific steps
          insight.includes('Practice');
        
        expect(hasSpecificGuidance).toBe(true);
      });
    });
  });
});
