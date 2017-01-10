const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const chokidar = require('chokidar');
const minify = require('./minify');

console.log('Watching source files.');

chokidar.watch(path.join(__dirname, 'src/*.js'))
	.on('add', compileFile)
	.on('change', compileFile)
	.on('unlink', removeCompiledFile);

function compileFile(file) {
	console.log(`Compiling ${file}`);
	let src = fs.readFileSync(file, 'utf-8');
	try {
		let result = minify(src, {});
		fs.writeFileSync(path.join(__dirname, 'build', path.basename(file)), result);
		console.log('Done.');
	} catch (err) {
		console.error(err);
	}
}

function removeCompiledFile(file) {
	console.log(`Removing ${file}`);
	try {
		fs.unlinkSync(path.join('build', path.basename(file)));
		console.log('Done.');
	} catch (err) {
		console.error(err);
	}
}
