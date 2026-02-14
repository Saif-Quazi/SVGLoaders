import { parseParams, render } from './loaders.js';

export default async (req) => {
	const url = new URL(req.url);
	const path = url.pathname.split('/').filter(Boolean);
	const params = parseParams(url, path[path.length - 1]);
	const svg = render('spinner', params);
	
	return new Response(svg, {
		status: 200,
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
