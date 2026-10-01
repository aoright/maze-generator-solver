#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting static asset validation...\n');

let hasErrors = false;

// Helper to log errors
function logError(msg) {
    console.error(`[ERROR] ${msg}`);
    hasErrors = true;
}

// Helper to log success
function logSuccess(msg) {
    console.log(`[OK] ${msg}`);
}

// 1. Find all HTML files
function getFiles(dir, ext) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                results = results.concat(getFiles(filePath, ext));
            }
        } else if (file.endsWith(ext)) {
            results.push(filePath);
        }
    });
    return results;
}

const htmlFiles = getFiles('.', '.html');
const jsFiles = getFiles('.', '.js');
const cssFiles = getFiles('.', '.css');

console.log(`Found ${htmlFiles.length} HTML files, ${jsFiles.length} JS files, and ${cssFiles.length} CSS files.`);

// 2. Validate JS syntax using node --check
console.log('\n--- Checking JavaScript Syntax ---');
jsFiles.forEach(file => {
    try {
        execSync(`node --check "${file}"`, { stdio: 'pipe' });
        logSuccess(`JS Syntax: ${file}`);
    } catch (err) {
        logError(`JS Syntax Error in ${file}:\n${err.stderr ? err.stderr.toString() : err.message}`);
    }
});

// 3. Validate HTML references (linked JS and CSS files exist)
console.log('\n--- Checking HTML Asset Links ---');
const srcHrefRegex = /(?:src|href)=["']([^"']+)["']/g;

htmlFiles.forEach(htmlFile => {
    const htmlDir = path.dirname(htmlFile);
    const content = fs.readFileSync(htmlFile, 'utf8');
    let match;

    while ((match = srcHrefRegex.exec(content)) !== null) {
        const assetPath = match[1];
        
        // Skip external URLs, data URLs, anchors
        if (assetPath.startsWith('http://') || assetPath.startsWith('https://') || 
            assetPath.startsWith('//') || assetPath.startsWith('data:') || assetPath.startsWith('#')) {
            continue;
        }

        // Resolve local asset path
        const resolvedPath = path.resolve(htmlDir, assetPath.split('?')[0].split('#')[0]);
        if (!fs.existsSync(resolvedPath)) {
            logError(`Broken asset link in ${htmlFile}: "${assetPath}" -> File not found: ${resolvedPath}`);
        } else {
            logSuccess(`Asset link in ${htmlFile}: "${assetPath}" exists`);
        }
    }
});

// 4. Validate CSS basic structure / syntax check
console.log('\n--- Checking CSS Files ---');
cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;

    if (openBrackets !== closeBrackets) {
        logError(`CSS Bracket Mismatch in ${file}: ${openBrackets} '{' vs ${closeBrackets} '}'`);
    } else {
        logSuccess(`CSS Structure: ${file}`);
    }
});

console.log('\n-----------------------------------');
if (hasErrors) {
    console.error('Static asset validation failed!');
    process.exit(1);
} else {
    console.log('All static assets validated successfully!');
    process.exit(0);
}
