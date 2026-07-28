#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const CONVERTIBLE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const IMAGE_DIRECTORIES = ['preview', 'previews', 'contents'];
const POST_EXTENSIONS = new Set(['.md', '.markdown', '.html']);

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    previewWidth: 1200,
    contentsWidth: 1920,
    previewQuality: 80,
    contentsQuality: 85
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];

    if (argument === '--root' && value) {
      options.root = path.resolve(value);
      index += 1;
    } else if (argument === '--preview-width' && value) {
      options.previewWidth = Number(value);
      index += 1;
    } else if (argument === '--contents-width' && value) {
      options.contentsWidth = Number(value);
      index += 1;
    } else if (argument === '--preview-quality' && value) {
      options.previewQuality = Number(value);
      index += 1;
    } else if (argument === '--contents-quality' && value) {
      options.contentsQuality = Number(value);
      index += 1;
    } else if (argument === '--help') {
      console.log(`Usage: node tools/optimize-post-images.mjs [options]

Converts PNG/JPEG post images to WebP and updates references in _posts.

Options:
  --root <path>               Repository root (default: current directory)
  --preview-width <pixels>    Maximum preview width (default: 1200)
  --contents-width <pixels>   Maximum content width (default: 1920)
  --preview-quality <1-100>   Preview WebP quality (default: 80)
  --contents-quality <1-100>  Content WebP quality (default: 85)`);
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  return options;
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function existingDirectories(root) {
  const base = path.join(root, 'assets', 'img', 'posts');
  const directories = [];

  for (const name of IMAGE_DIRECTORIES) {
    const directory = path.join(base, name);
    try {
      if ((await fs.stat(directory)).isDirectory()) {
        directories.push(directory);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  return directories;
}

function imageSettings(filePath, options) {
  const relative = path.relative(
    path.join(options.root, 'assets', 'img', 'posts'),
    filePath
  );
  const type = relative.split(path.sep)[0];
  const isPreview = type === 'preview' || type === 'previews';

  return {
    width: isPreview ? options.previewWidth : options.contentsWidth,
    quality: isPreview ? options.previewQuality : options.contentsQuality
  };
}

async function assertNoCollisions(files) {
  const destinations = new Map();

  for (const source of files) {
    const destination = source.replace(/\.(?:jpe?g|png)$/i, '.webp');
    const previous = destinations.get(destination);

    if (previous && previous !== source) {
      throw new Error(`WebP filename collision: ${previous} and ${source}`);
    }

    destinations.set(destination, source);
  }
}

async function convertImage(source, options) {
  const destination = source.replace(/\.(?:jpe?g|png)$/i, '.webp');
  const temporary = `${destination}.tmp-${process.pid}`;
  const before = (await fs.stat(source)).size;
  const { width, quality } = imageSettings(source, options);

  try {
    await sharp(source, { animated: false })
      .autoOrient()
      .resize({
        width,
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({
        quality,
        alphaQuality: 90,
        effort: 6,
        smartSubsample: true
      })
      .toFile(temporary);

    await fs.rename(temporary, destination);
    await fs.unlink(source);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }

  const after = (await fs.stat(destination)).size;
  return { source, destination, before, after };
}

async function updatePostReferences(root, conversions) {
  const postsDirectory = path.join(root, '_posts');
  let postFiles = [];

  try {
    postFiles = (await walk(postsDirectory))
      .filter((file) => POST_EXTENSIONS.has(path.extname(file).toLowerCase()));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const replacements = conversions.map(({ source, destination }) => {
    const from = `/${path.relative(root, source).split(path.sep).join('/')}`;
    const to = `/${path.relative(root, destination).split(path.sep).join('/')}`;
    return { from, to };
  });

  let updatedPosts = 0;
  for (const postFile of postFiles) {
    const original = await fs.readFile(postFile, 'utf8');
    let updated = original;

    for (const { from, to } of replacements) {
      updated = updated.split(from).join(to);
    }

    if (updated !== original) {
      await fs.writeFile(postFile, updated);
      updatedPosts += 1;
    }
  }

  return updatedPosts;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const directories = await existingDirectories(options.root);
  const allFiles = (await Promise.all(directories.map(walk))).flat();
  const convertible = allFiles.filter((file) =>
    CONVERTIBLE_EXTENSIONS.has(path.extname(file).toLowerCase())
  );

  if (convertible.length === 0) {
    console.log('No PNG or JPEG post images require optimization.');
    return;
  }

  await assertNoCollisions(convertible);

  const conversions = [];
  for (const source of convertible.sort()) {
    const result = await convertImage(source, options);
    conversions.push(result);
    console.log(
      `${path.relative(options.root, result.source)} -> ` +
      `${path.relative(options.root, result.destination)} ` +
      `(${formatBytes(result.before)} -> ${formatBytes(result.after)})`
    );
  }

  const updatedPosts = await updatePostReferences(options.root, conversions);
  const before = conversions.reduce((total, item) => total + item.before, 0);
  const after = conversions.reduce((total, item) => total + item.after, 0);
  const reduction = before === 0 ? 0 : ((before - after) / before) * 100;

  console.log(
    `Optimized ${conversions.length} images and updated ${updatedPosts} posts: ` +
    `${formatBytes(before)} -> ${formatBytes(after)} (${reduction.toFixed(1)}% smaller).`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
