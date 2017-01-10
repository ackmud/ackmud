const babel = require('babel-core');

module.exports = function compile(src, options = {}) {
	let autos = /^function.*(\/\/.*)/.exec(src);
	if (autos) {
		autos = autos[1];
	}

	src = src
		.replace(/#s\.([\w\d_]+)\.([\w\d_]+)/g, 'SC$$$1$$$2')
		.replace(/#db\.i/g, 'DB_insert')
		.replace(/#db\.f/g, 'DB_find_cursor')
		.replace(/#db\.u1/g, 'DB_update_one')
		.replace(/#db\.u/g, 'DB_update')
		.replace(/#db\.r/g, 'DB_remove')
		.replace(/#db\.ObjectId/g, 'DB_ObjectId')
		.replace(/^function/, 'export default function');

	let { code } = babel.transform(src, {
		minified: true,
		shouldPrintComment: () => false,
		presets: ['babel-preset-babili'],
		plugins: [[replaceIdentifier, {
			"Array": "ARRAY",
			"Date": "DATE",
			"Error": "ERROR",
			"JSON": "JSON_",
			"Object": "OBJECT",
			"String": "STRING",
		}]]
	});

	code = code
		.replace(/SC\$([\w\d_]+)\$([\w\d_]+)/g, '#s.$1.$2')
		.replace(/DB_insert/g, '#db.i')
		.replace(/DB_find_cursor/g, '#db.f')
		.replace(/DB_update_one/g, '#db.u1')
		.replace(/DB_update/g, '#db.u')
		.replace(/DB_remove/g, '#db.r')
		.replace(/DB_ObjectId/g, '#db.ObjectId')
		.replace(/export default (function\s*\([^)]*\)\s*{)/,
			autos ? '$1 ' + autos + '\n' : '$1');
	return code;
}

function replaceIdentifier({ types: t }) {
	return {
		visitor: {
			Identifier(path, state) {
				const newId = state.opts[path.node.name]
				if (newId) {
					path.replaceWith(t.identifier(newId))
				}
			}
		}
	};
}
