const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const toolsJsonPath = path.join(__dirname, '..', 'data', 'tools.json');
const toolsJsPath = path.join(__dirname, '..', 'data', 'tools.js');
const indexPath = path.join(__dirname, '..', 'index.html');
const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');

describe('EC-Tools Test Suite (Read-Only GitHub Pages Deployment)', () => {

  test('tools.json exists and is valid JSON', () => {
    assert.ok(fs.existsSync(toolsJsonPath), 'tools.json should exist');
    const rawData = fs.readFileSync(toolsJsonPath, 'utf8');
    const tools = JSON.parse(rawData);
    assert.ok(Array.isArray(tools), 'tools.json should contain an array of tools');
    assert.ok(tools.length >= 17, `Expected at least 17 tools, found ${tools.length}`);
  });

  test('tools.js exports DEFAULT_TOOLS matching tools.json', () => {
    assert.ok(fs.existsSync(toolsJsPath), 'tools.js should exist');
    const defaultTools = require(toolsJsPath);
    const jsonTools = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
    assert.equal(defaultTools.length, jsonTools.length, 'tools.js and tools.json should have the same count');
  });

  test('All requested tools from user prompt are present with valid metadata', () => {
    const tools = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
    const toolNames = tools.map(t => t.name.toLowerCase());

    const requiredTools = [
      'html5',
      'css3',
      'javascript',
      'react',
      'python',
      'node.js',
      'bootstrap',
      'tailwind',
      'mysql',
      'supabase',
      'superpowers',
      'ponytail',
      'wayfinder',
      'taste',
      'claude skills',
      'react bits',
      'figma',
      'untitled ui',
      'github'
    ];

    for (const req of requiredTools) {
      const match = toolNames.some(name => name.includes(req) || req.includes(name));
      assert.ok(match, `Required tool "${req}" must be present in dataset`);
    }

    // Verify properties
    tools.forEach(tool => {
      assert.ok(tool.id, `Tool ${tool.name} must have an id`);
      assert.ok(tool.name, 'Tool must have a name');
      assert.ok(tool.category, `Tool ${tool.name} must have a category`);
      assert.ok(tool.url.startsWith('http'), `Tool ${tool.name} url must start with http`);
      assert.ok(tool.description, `Tool ${tool.name} must have a description`);
      assert.ok(tool.howToUse, `Tool ${tool.name} must have a howToUse guide`);
      assert.ok(Array.isArray(tool.tags) && tool.tags.length > 0, `Tool ${tool.name} must have tags`);
    });
  });

  test('All categories specified in design are present', () => {
    const tools = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
    const categories = new Set(tools.map(t => t.category));

    const expectedCategories = [
      'Tech Stacks',
      'Frameworks',
      'Database',
      'Open Source Skills',
      'Online Platforms',
      'Version Control'
    ];

    expectedCategories.forEach(cat => {
      assert.ok(categories.has(cat), `Category "${cat}" must be represented in tools`);
    });
  });

  test('index.html contains required read-only semantic elements and IDs', () => {
    assert.ok(fs.existsSync(indexPath), 'index.html should exist');
    const html = fs.readFileSync(indexPath, 'utf8');

    // Semantic checks
    assert.ok(html.includes('<header class="app-header'), 'Must have semantic header');
    assert.ok(html.includes('<aside class="app-sidebar'), 'Must have semantic aside for sidebar');
    assert.ok(html.includes('<main class="app-main'), 'Must have semantic main container');
    assert.ok(html.includes('<h1'), 'Must have a main h1 tag');

    // Required read-only IDs
    const requiredIds = [
      'searchInput',
      'clearSearchBtn',
      'tagCloud',
      'toolsContainer',
      'toolCountBadge',
      'customToast'
    ];

    requiredIds.forEach(id => {
      assert.ok(html.includes(`id="${id}"`), `index.html must include element with id="${id}"`);
    });

    // Verification: Add Tool and mutation modals are removed
    assert.ok(!html.includes('id="addToolBtn"'), 'addToolBtn should be removed for GitHub Pages');
    assert.ok(!html.includes('id="toolModal"'), 'toolModal should be removed for GitHub Pages');
    assert.ok(!html.includes('id="toolForm"'), 'toolForm should be removed for GitHub Pages');
    assert.ok(!html.includes('id="dataModal"'), 'dataModal should be removed for GitHub Pages');
  });

  test('styles.css contains required design classes', () => {
    assert.ok(fs.existsSync(cssPath), 'styles.css should exist');
    const css = fs.readFileSync(cssPath, 'utf8');

    const requiredClasses = [
      '.app-header',
      '.app-sidebar',
      '.tool-card',
      '.tool-how-to',
      '.category-nav-link',
      '.tag-pill',
      '.custom-toast'
    ];

    requiredClasses.forEach(cls => {
      assert.ok(css.includes(cls), `styles.css must define class ${cls}`);
    });
  });

  test('app.js is secure and read-only without form mutations', () => {
    assert.ok(fs.existsSync(appJsPath), 'app.js should exist');
    const appJs = fs.readFileSync(appJsPath, 'utf8');

    // Core read-only features
    assert.ok(appJs.includes('getFilteredTools'), 'Should have filtering logic');
    assert.ok(appJs.includes('renderTools'), 'Should have render tools logic');
    assert.ok(appJs.includes('updateCategoryCounters'), 'Should have category counting logic');
    assert.ok(appJs.includes('renderTags'), 'Should have tag rendering logic');

    // Mutation functions removed
    assert.ok(!appJs.includes('saveToolFromForm'), 'saveToolFromForm should be removed');
    assert.ok(!appJs.includes('openAddModal'), 'openAddModal should be removed');
    assert.ok(!appJs.includes('btn-edit-tool'), 'btn-edit-tool should not be rendered');
  });
});
