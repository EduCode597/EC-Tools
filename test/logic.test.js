const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const defaultTools = require('../data/tools.js');

describe('EC-Tools Core Business Logic', () => {

  function filterTools(tools, { category = 'all', tag = null, query = '' }) {
    return tools.filter((tool) => {
      if (category !== 'all' && tool.category !== category) {
        return false;
      }
      if (tag) {
        const hasTag = (tool.tags || []).some(
          (t) => t.toLowerCase() === tag.toLowerCase()
        );
        if (!hasTag) return false;
      }
      if (query.trim() !== '') {
        const q = query.toLowerCase().trim();
        const inName = (tool.name || '').toLowerCase().includes(q);
        const inDesc = (tool.description || '').toLowerCase().includes(q);
        const inHowTo = (tool.howToUse || '').toLowerCase().includes(q);
        const inCat = (tool.category || '').toLowerCase().includes(q);
        const inTags = (tool.tags || []).some((t) => t.toLowerCase().includes(q));

        if (!inName && !inDesc && !inHowTo && !inCat && !inTags) {
          return false;
        }
      }
      return true;
    });
  }

  test('Filter by category returns exact subset', () => {
    const techStacks = filterTools(defaultTools, { category: 'Tech Stacks' });
    assert.equal(techStacks.length, 6);
    techStacks.forEach(t => assert.equal(t.category, 'Tech Stacks'));

    const frameworks = filterTools(defaultTools, { category: 'Frameworks' });
    assert.equal(frameworks.length, 3);
    assert.deepEqual(frameworks.map(f => f.name).sort(), ['Bootstrap 5', 'Express.js', 'Tailwind CSS']);

    const databases = filterTools(defaultTools, { category: 'Database' });
    assert.equal(databases.length, 2);
    assert.deepEqual(databases.map(d => d.name).sort(), ['MySQL', 'Supabase']);

    const skills = filterTools(defaultTools, { category: 'Open Source Skills' });
    assert.equal(skills.length, 6);

    const deploymentTools = filterTools(defaultTools, { category: 'Deployment Tools' });
    assert.equal(deploymentTools.length, 2);
    assert.deepEqual(deploymentTools.map(d => d.name).sort(), ['Render', 'Vercel']);

    const openSourceTools = filterTools(defaultTools, { category: 'Open Source Tools' });
    assert.equal(openSourceTools.length, 3);
    assert.deepEqual(openSourceTools.map(d => d.name).sort(), ['Brevo', 'Gemini Notebook', 'Redis']);
  });

  test('Search filter matches by tool name', () => {
    const reactMatch = filterTools(defaultTools, { query: 'React' });
    // Matches React and React Bits
    assert.ok(reactMatch.length >= 2);
    const names = reactMatch.map(t => t.name);
    assert.ok(names.includes('React'));
    assert.ok(names.includes('React Bits'));

    // Verify Graphify search match
    const graphifyMatch = filterTools(defaultTools, { query: 'Graphify' });
    assert.equal(graphifyMatch.length, 1);
    assert.equal(graphifyMatch[0].id, 'graphify');

    // Verify Gemini Notebook search match
    const notebookMatch = filterTools(defaultTools, { query: 'Gemini Notebook' });
    assert.equal(notebookMatch.length, 1);
    assert.equal(notebookMatch[0].id, 'gemini-notebook');
  });

  test('Search filter matches inside howToUse notes', () => {
    // "FastAPI" or "FastAPI or Flask" in Python notes
    const match = filterTools(defaultTools, { query: 'FastAPI' });
    assert.equal(match.length, 1);
    assert.equal(match[0].name, 'Python');
  });

  test('Filter by tag returns tools with that tag', () => {
    const aiTools = filterTools(defaultTools, { tag: 'ai-skills' });
    assert.equal(aiTools.length, 6);
    aiTools.forEach(t => assert.ok(t.tags.includes('ai-skills')));
  });

  test('Adding a tool dynamically prepends and preserves schema', () => {
    const testList = [...defaultTools];
    const newTool = {
      id: 'zustand',
      name: 'Zustand',
      category: 'Tech Stacks',
      url: 'https://zustand.docs.pmnd.rs',
      description: 'Bearbones state management solution for React.',
      howToUse: 'Use for global state without Redux boilerplate.',
      tags: ['react', 'state', 'frontend']
    };

    testList.unshift(newTool);
    assert.equal(testList.length, defaultTools.length + 1);
    assert.equal(testList[0].name, 'Zustand');

    const searchResult = filterTools(testList, { query: 'zustand' });
    assert.equal(searchResult.length, 1);
    assert.equal(searchResult[0].id, 'zustand');
  });

  test('Editing a tool updates in place', () => {
    const testList = defaultTools.map(t => ({ ...t }));
    const target = testList.find(t => t.id === 'supabase');
    assert.ok(target);
    target.howToUse = 'Updated custom how-to guide for solo SaaS.';

    const updated = testList.find(t => t.id === 'supabase');
    assert.equal(updated.howToUse, 'Updated custom how-to guide for solo SaaS.');
  });

  test('JSON export and re-import roundtrip', () => {
    const serialized = JSON.stringify(defaultTools, null, 2);
    assert.ok(typeof serialized === 'string');
    const parsed = JSON.parse(serialized);
    assert.equal(parsed.length, defaultTools.length);
    assert.equal(parsed[0].name, defaultTools[0].name);
  });

  test('Every tool resolves a valid dedicated manualUrl in manuals/ folder', () => {
    defaultTools.forEach((tool) => {
      assert.equal(tool.manualUrl, `manuals/${tool.id}.html`);
    });
  });
});
