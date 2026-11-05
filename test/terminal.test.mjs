/**
 * ==========================================================================
 * Terminal Command Engine, Fuzzy Matcher & Security Unit Tests
 * ==========================================================================
 * Uses node:test and node:assert (zero extra dependencies).
 * ==========================================================================
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseCommand,
  executeCommandLine,
  VALID_COMMAND_NAMES,
  commands
} from '../src/terminal/commands.js';
import { getClosestCommand, levenshteinDistance } from '../src/terminal/suggest.js';
import { isKonamiSequence, KONAMI_CODE } from '../src/hooks/useKonami.js';

test('1. Pure command parsing for all 17 documented commands', () => {
  const documentedCommands = [
    'help',
    'whoami',
    'about',
    'skills',
    'skills --level',
    'projects',
    'play gla',
    'achievements',
    'experience',
    'education',
    'resume',
    'contact',
    'github',
    'linkedin',
    'deploy --global',
    'theme dark',
    'clear'
  ];

  for (const cmd of documentedCommands) {
    const res = parseCommand(cmd, {
      level: 2,
      xp: 150,
      persona: 'Recruiter',
      achievements: ['pilot_episode']
    });
    assert.equal(res.success, true, `Command "${cmd}" must execute successfully`);
    assert.ok(Array.isArray(res.output), `Command "${cmd}" must return output array`);
    assert.ok(Array.isArray(res.sideEffects), `Command "${cmd}" must return sideEffects array`);
  }
});

test('2. help command outputs grouped categories', () => {
  const res = parseCommand('help');
  assert.equal(res.success, true);
  const textAll = res.output.map((l) => l.text).join(' ');
  assert.match(textAll, /CORE COMMANDS/i);
  assert.match(textAll, /PORTFOLIO COMMANDS/i);
  assert.match(textAll, /SYSTEM & LINKS/i);
  assert.match(textAll, /CLASSIFIED/i);
});

test('3. whoami outputs role, level, current XP, and selected persona', () => {
  const res = parseCommand('whoami', {
    level: 3,
    xp: 260,
    persona: 'Fellow Dev'
  });
  assert.equal(res.success, true);
  const textAll = res.output.map((l) => l.text).join('\n');
  assert.match(textAll, /ROLE/i);
  assert.match(textAll, /Level 3/);
  assert.match(textAll, /260 XP/);
  assert.match(textAll, /Fellow Dev/);
});

test('4. skills --level outputs self-assessed levels without Advanced/Working Knowledge wording', () => {
  const res = parseCommand('skills --level');
  assert.equal(res.success, true);
  const textAll = res.output.map((l) => l.text).join('\n');
  assert.match(textAll, /self-assessed levels/i);
  assert.ok(!textAll.includes('Advanced'), 'Must not contain "Advanced"');
  assert.ok(!textAll.includes('Working Knowledge'), 'Must not contain "Working Knowledge"');
});

test('5. achievements lists unlocked badges vs total count', () => {
  const res = parseCommand('achievements', {
    achievements: ['pilot_episode', 'found_the_terminal']
  });
  assert.equal(res.success, true);
  const textAll = res.output.map((l) => l.text).join('\n');
  assert.match(textAll, /2\/10 UNLOCKED/i);
});

test('6. deploy --global simulated deployment log ends in exact message', () => {
  const res = parseCommand('deploy --global');
  assert.equal(res.success, true);
  const lastLine = res.output[res.output.length - 1];
  assert.equal(lastLine.text, 'Simulation complete. Real deployment: AWS Amplify Hosting.');
  assert.equal(lastLine.type, 'success');
});

test('7. Levenshtein distance and typo suggestion within distance <= 2', () => {
  // Exact distances
  assert.equal(levenshteinDistance('help', 'help'), 0);
  assert.equal(levenshteinDistance('hlp', 'help'), 1);
  assert.equal(levenshteinDistance('hepl', 'help'), 2);

  // Suggestions
  assert.equal(getClosestCommand('hlp', VALID_COMMAND_NAMES, 2), 'help');
  assert.equal(getClosestCommand('projcts', VALID_COMMAND_NAMES, 2), 'projects');
  assert.equal(getClosestCommand('skils', VALID_COMMAND_NAMES, 2), 'skills');
  assert.equal(getClosestCommand('whomi', VALID_COMMAND_NAMES, 2), 'whoami');

  // Too far (distance > 2)
  assert.equal(getClosestCommand('completelywrongcommand', VALID_COMMAND_NAMES, 2), null);
  assert.equal(getClosestCommand('xyz123', VALID_COMMAND_NAMES, 2), null);
});

test('8. play command project matching by id, slug, index, and error handling', () => {
  // By index 1 (GLA Exchange)
  const p1 = parseCommand('play 1');
  assert.equal(p1.success, true);
  assert.equal(p1.sideEffects[0].type, 'OPEN_PROJECT_MODAL');
  assert.equal(p1.sideEffects[0].project.slug, 'gla-exchange');
  assert.equal(p1.sideEffects[1].type, 'CLOSE_TERMINAL');

  // By index 2 (EduCloud)
  const p2 = parseCommand('play 2');
  assert.equal(p2.success, true);
  assert.equal(p2.sideEffects[0].project.slug, 'educloud');

  // By slug or title substring
  const pGla = parseCommand('play gla');
  assert.equal(pGla.success, true);
  assert.equal(pGla.sideEffects[0].project.slug, 'gla-exchange');

  const pEdu = parseCommand('play educloud');
  assert.equal(pEdu.success, true);
  assert.equal(pEdu.sideEffects[0].project.slug, 'educloud');

  // Invalid index / id
  const pInvalidNum = parseCommand('play 99');
  assert.equal(pInvalidNum.sideEffects.length, 0);
  assert.match(pInvalidNum.output[0].text, /not found/i);

  const pInvalidSlug = parseCommand('play non-existent-project');
  assert.equal(pInvalidSlug.sideEffects.length, 0);
  assert.match(pInvalidSlug.output[0].text, /not found/i);

  // Missing argument
  const pEmpty = parseCommand('play');
  assert.equal(pEmpty.sideEffects.length, 0);
  assert.match(pEmpty.output[0].text, /missing project argument/i);
});

test('9. theme command argument validation and persistence side effect', () => {
  // Valid themes
  const darkRes = parseCommand('theme dark');
  assert.equal(darkRes.success, true);
  assert.deepEqual(darkRes.sideEffects, [{ type: 'SET_THEME', theme: 'dark' }]);

  const neonRes = parseCommand('theme neon');
  assert.equal(neonRes.success, true);
  assert.deepEqual(neonRes.sideEffects, [{ type: 'SET_THEME', theme: 'neon' }]);

  const pastelRes = parseCommand('theme pastel');
  assert.equal(pastelRes.success, true);
  assert.deepEqual(pastelRes.sideEffects, [{ type: 'SET_THEME', theme: 'pastel' }]);

  // Invalid theme
  const invalidRes = parseCommand('theme solarized');
  assert.equal(invalidRes.sideEffects.length, 0);
  const text = invalidRes.output.map((l) => l.text).join('\n');
  assert.match(text, /ACCENT THEMES AVAILABLE/i);
});

test('10. Konami sequence detection', () => {
  assert.equal(KONAMI_CODE.length, 10);

  const validSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'B',
    'A'
  ];
  assert.equal(isKonamiSequence(validSequence), true);

  const partialSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown'];
  assert.equal(isKonamiSequence(partialSequence), false);

  const wrongSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'B',
    'B'
  ];
  assert.equal(isKonamiSequence(wrongSequence), false);
});

test('11. Secret and Konami commands award +100 XP side effect', () => {
  const secretRes = parseCommand('secret');
  assert.equal(secretRes.success, true);
  assert.ok(secretRes.sideEffects.some((e) => e.type === 'TRIGGER_MATRIX_RAIN'));
  assert.ok(secretRes.sideEffects.some((e) => e.type === 'AWARD_SECRET'));

  const konamiRes = parseCommand('konami');
  assert.equal(konamiRes.success, true);
  assert.ok(konamiRes.sideEffects.some((e) => e.type === 'TRIGGER_MATRIX_RAIN'));
  assert.ok(konamiRes.sideEffects.some((e) => e.type === 'AWARD_SECRET'));
});

test('12. Security & Fact Audit: No command output contains phone numbers or forbidden claims', () => {
  const testInputs = [
    ...VALID_COMMAND_NAMES,
    'skills --level',
    'deploy --global',
    'secret',
    'konami',
    'play 1',
    'play 2',
    'theme dark'
  ];

  const forbiddenTerms = [
    '7984313604',
    'express-rate-limit',
    'JSON-LD',
    'least-privilege',
    'private subnet',
    'HP',
    'MP',
    'buff'
  ];

  for (const input of testInputs) {
    const res = parseCommand(input, {
      level: 1,
      xp: 0,
      persona: 'Recruiter',
      achievements: []
    });

    for (const line of res.output || []) {
      for (const term of forbiddenTerms) {
        const regex = (term === 'HP' || term === 'MP' || term === 'buff')
          ? new RegExp(`\\b${term}s?\\b`, 'i')
          : new RegExp(term, 'i');
        assert.ok(
          !regex.test(line.text),
          `Command "${input}" output line "${line.text}" must NOT contain forbidden term "${term}"`
        );
      }
    }
  }
});

test('13. No terminal command output contains "undefined", "null" or "NaN", and includes real facts ("CPI" and "Salesforce.com")', () => {
  const allCommandsToTest = [
    ...VALID_COMMAND_NAMES,
    'skills --level',
    'deploy --global',
    'experience',
    'education',
    'secret',
    'konami',
    'play 1',
    'play 2',
    'theme dark',
    'theme neon',
    'theme pastel',
    'theme clear'
  ];

  let foundCpi = false;
  let foundSalesforce = false;

  for (const cmdName of allCommandsToTest) {
    const res = parseCommand(cmdName, {
      level: 2,
      xp: 150,
      persona: 'Recruiter',
      achievements: [{ id: 'pilot_episode', unlocked: true }]
    });

    for (const line of res.output || []) {
      const text = line.text;
      assert.ok(!text.includes('undefined'), `Command "${cmdName}" output line "${text}" must NOT contain "undefined"`);
      assert.ok(!text.includes('null'), `Command "${cmdName}" output line "${text}" must NOT contain "null"`);
      assert.ok(!text.includes('NaN'), `Command "${cmdName}" output line "${text}" must NOT contain "NaN"`);

      if (text.includes('CPI')) foundCpi = true;
      if (text.includes('Salesforce.com')) foundSalesforce = true;
    }
  }

  assert.equal(foundCpi, true, 'Terminal command outputs must include "CPI" from profile.js');
  assert.equal(foundSalesforce, true, 'Terminal command outputs must include "Salesforce.com" from profile.js');
});
