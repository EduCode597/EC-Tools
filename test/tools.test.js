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
      'graphify',
      'react bits',
      'figma',
      'untitled ui',
      'github',
      'render',
      'vercel',
      'redis',
      'brevo'
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
      assert.equal(tool.manualUrl, `manuals/${tool.id}.html`, `Tool ${tool.name} must have manualUrl pointing to manuals/${tool.id}.html`);
    });
  });

  test('Every tool has a dedicated README-style manual HTML file in manuals/ directory', () => {
    const tools = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
    const manualsDir = path.join(__dirname, '..', 'manuals');
    assert.ok(fs.existsSync(manualsDir), 'manuals/ directory must exist');

    tools.forEach(tool => {
      const manualFilePath = path.join(__dirname, '..', tool.manualUrl);
      assert.ok(fs.existsSync(manualFilePath), `Manual page ${tool.manualUrl} must exist for ${tool.name}`);
      const html = fs.readFileSync(manualFilePath, 'utf8');

      assert.ok(html.includes(tool.name), `Manual page for ${tool.name} must contain the tool name`);
      assert.ok(html.includes('href="../index.html"'), `Manual page for ${tool.name} must have a Back link to ../index.html`);
      assert.ok(html.includes('../css/styles.css'), `Manual page for ${tool.name} must load ../css/styles.css`);
      assert.ok(html.includes('ec_tools_palette'), `Manual page for ${tool.name} must support the 5-color palette theme persistence`);
      assert.ok(html.includes('What It Is'), `Manual page for ${tool.name} must include "What It Is" introduction section`);
      assert.ok(html.includes('How It Helps With Your Projects'), `Manual page for ${tool.name} must include "How It Helps With Your Projects" section`);
      assert.ok(html.includes('How to Use It'), `Manual page for ${tool.name} must include "How to Use It" section`);
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
      'Open Source Tools',
      'Online Platforms',
      'Deployment Tools',
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

    // Verification: New sidebar categories exist in both desktop and mobile navs
    const deploymentMatches = html.match(/data-category="Deployment Tools"/g) || [];
    assert.equal(deploymentMatches.length, 2, 'Deployment Tools category should appear in both desktop and mobile sidebars');
    const openSourceToolsMatches = html.match(/data-category="Open Source Tools"/g) || [];
    assert.equal(openSourceToolsMatches.length, 2, 'Open Source Tools category should appear in both desktop and mobile sidebars');
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
      '.custom-toast',
      '.cat-deployment-tools',
      '.cat-open-source-tools',
      '.manual-wrapper',
      '.manual-readme-card',
      '.manual-section',
      '.btn-back-directory'
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
    assert.ok(appJs.includes('data-manual-url'), 'Should attach data-manual-url to tool cards for navigation');
    assert.ok(appJs.includes('getManualUrl'), 'Should define getManualUrl helper for tool cards');

    // Mutation functions removed
    assert.ok(!appJs.includes('saveToolFromForm'), 'saveToolFromForm should be removed');
    assert.ok(!appJs.includes('openAddModal'), 'openAddModal should be removed');
    assert.ok(!appJs.includes('btn-edit-tool'), 'btn-edit-tool should not be rendered');
  });

  test('Madriaga_logo.svg is used as the main brand logo', () => {
    const html = fs.readFileSync(indexPath, 'utf8');
    const logoFile = path.join(__dirname, '..', 'public', 'Madriaga_logo.svg');
    assert.ok(fs.existsSync(logoFile), 'public/Madriaga_logo.svg must exist');
    assert.ok(html.includes('public/Madriaga_logo.svg'), 'index.html must reference public/Madriaga_logo.svg');
    assert.ok(html.includes('brand-logo-frame'), 'index.html should have brand-logo-frame class');
  });

  test('5-hex color scheme palette is defined and rotatable', () => {
    const css = fs.readFileSync(cssPath, 'utf8');
    const hexCodes = ['#ffffff', '#fff4e9', '#828e82', '#131b23', '#000000'];
    hexCodes.forEach(hex => {
      assert.ok(css.toLowerCase().includes(hex.toLowerCase()), `styles.css must include hex code ${hex}`);
    });

    const themes = ['warm-linen', 'midnight-obsidian', 'nordic-sage', 'pitch-black', 'crisp-alabaster'];
    themes.forEach(theme => {
      assert.ok(css.includes(`data-palette="${theme}"`), `styles.css must define rotational theme ${theme}`);
    });

    const appJs = fs.readFileSync(appJsPath, 'utf8');
    assert.ok(appJs.includes('rotatePalette'), 'app.js must define rotatePalette function');
    assert.ok(appJs.includes('ec_tools_palette'), 'app.js must persist chosen palette in localStorage');
  });

  test('Footer contains author credentials and portfolio link', () => {
    const html = fs.readFileSync(indexPath, 'utf8');
    assert.ok(html.includes('<footer class="app-footer"'), 'index.html must contain app-footer element');
    assert.ok(html.includes('https://educode597.github.io/'), 'Footer must contain link to personal portfolio');
    assert.ok(html.includes('John Eduard Madriaga'), 'Footer must display author name');
    assert.ok(html.includes('EduCode597'), 'Footer must reference EduCode handle');
    assert.ok(html.includes('PUP BSIT'), 'Footer must reference educational credential');
    assert.ok(html.includes('btn-portfolio-cta'), 'Footer must include portfolio CTA button');
  });
});

