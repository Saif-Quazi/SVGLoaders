export const templates = {
	spinner: `<svg xmlns="http://www.w3.org/2000/svg" width="{{size}}" height="{{size}}" viewBox="0 0 50 50">
  <circle cx="25" cy="25" r="20" fill="none" stroke="{{bg}}" stroke-width="{{stroke}}" opacity="0.25" />
  <circle cx="25" cy="25" r="20" fill="none" stroke="{{fg}}" stroke-width="{{stroke}}" stroke-linecap="round" stroke-dasharray="30 100">
    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="{{speed}}s" repeatCount="indefinite" />
  </circle>
</svg>`
};

export const paramConfig = {
	size: { type: 'range', default: 100, min: 10, max: 150 },
	stroke: { type: 'range', default: 4, min: 1, max: 10 },
	fg: { type: 'color', default: '#000000' },
	bg: { type: 'color', default: '#E5E7EB' },
	speed: { type: 'mapped', default: 1, values: { slow: 2, normal: 1, fast: 0.5 } }
};

const validators = {
	range: (value, config) => {
		if (!value) return config.default;
		const parsed = parseInt(value, 10);
		if (isNaN(parsed)) return config.default;
		return Math.max(config.min, Math.min(config.max, parsed));
	},
	
	color: (value, config) => {
		if (!value) return config.default;
		let hex = value.startsWith('#') ? value.substring(1) : value;
		if (hex.length === 3 && /^[0-9A-F]{3}$/i.test(hex)) {
			hex = hex.split('').map(c => c + c).join('');
		}
		if (/^[0-9A-F]{6}$/i.test(hex)) {
			return `#${hex.toUpperCase()}`;
		}
		return config.default;
	},
	
	mapped: (value, config) => {
		return config.values[value] || config.default;
	}
};

export const tokenize = (template, params) => {
	return template.replace(/\{\{(\w+)\}\}/g, (match, token) => {
		return params[token] !== undefined ? params[token] : match;
	});
};

export const parseParams = (url, pathSize) => {
	const parsed = {};
	const sizeValue = pathSize !== undefined ? String(pathSize) : undefined;
	for (const [param, config] of Object.entries(paramConfig)) {
		const value = param === 'size' ? sizeValue : url.searchParams.get(param);
		const validator = validators[config.type];
		parsed[param] = validator ? validator(value, config) : config.default;
	}
	return parsed;
};

export const render = (templateName, params) => {
	const template = templates[templateName];
	if (!template) throw new Error(`Template "${templateName}" not found`);
	return tokenize(template, params);
};


