export function splitConstants(globalConstantsMultiline: string): { [key: string]: any } {
	const lines = globalConstantsMultiline.split('\n');
	const retObj: { [key: string]: any } = {};
	let currentSection: string | null = null;

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine) {
			continue;
		}

		// Detect section headers like [sectionName]
		if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
			currentSection = trimmedLine.slice(1, -1).trim();
			if (!retObj[currentSection]) {
				retObj[currentSection] = {};
			}
			continue;
		}

		// Skip if no '=' in the line
		if (!trimmedLine.includes('=')) {
			continue;
		}

		// Split into key and value (only at the first '=')
		const [name, ...valueParts] = trimmedLine.split('=');
		const nameTrimmed = name.trim();
		const valueTrimmed = valueParts.join('=').trim();

		// Store the key-value pair into the correct section or globally
		if (currentSection) {
			retObj[currentSection][nameTrimmed] = valueTrimmed;
		} else {
			retObj[nameTrimmed] = valueTrimmed;
		}
	}

	return retObj;
}