#!/usr/bin/env node

const { readdirSync, statSync } = require('fs')
const { readFile, writeFile } = require('fs/promises')
const { transform } = require('esbuild')
const { join } = require('path')

function getFiles(dir, files) {
	files = files || []
	readdirSync(dir).forEach((file) => {
		const filePath = join(dir, file)
		if (statSync(filePath).isDirectory()) {
			files = getFiles(filePath, files)
		} else {
			files.push(filePath)
		}
	})
	return files.filter((file) => file.endsWith('.css') && !file.endsWith('.min.css'))
}

void (async () => {
	let files = getFiles(process.argv.pop())
	let content = await Promise.all(files.map((file) => readFile(file, 'utf8')))
	content = await Promise.all(content.map((text) => transform(text, { loader: 'css', minify: true })))
	files = files.map((file) => file.slice(0, -3) + 'min.css')
	await Promise.all(content.map((text, i) => writeFile(files[i], text.code)))
})()
