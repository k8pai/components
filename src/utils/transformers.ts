import { casedObjectConfigurationType, caseObjectKeys } from './objects';

function validateOptions(options: any) {
	const { type, value } = options;
	if (typeof type === 'undefined') throw new Error('type is required');
	if (typeof value === 'undefined') throw new Error('value is required');
}

function getOrCreateNestedArrayItem(current: any, arrayKey: string, obj: any, rowIndex: number) {
	if (!(arrayKey in current)) current[arrayKey] = [];

	if (obj.meta?.rowIndex === rowIndex) {
		const lastItem = current[arrayKey][current[arrayKey].length - 1];
		if (lastItem) return lastItem;
	}
	const newItem = {};
	current[arrayKey].push(newItem);
	return newItem;
}

const formKeysWithObjectSchema = ({ key_name, obj = {}, options = { rowIndex: 0 } }: formKeysWithObjectSchemaType) => {
	try {
		validateOptions(options);
		const keys = key_name.split('.');
		let current = obj;
		const { value: field_value, rowIndex } = options;
		const finalKey = keys[keys.length - 1];

		keys.forEach((key, index) => {
			if (key.endsWith('[]')) {
				const arrayKey = key.slice(0, -2);
				if (keys[index + 1]) {
					current = getOrCreateNestedArrayItem(current, arrayKey, obj, rowIndex);
				}
			} else {
				if (!(key in current)) current[key] = {};
				if (finalKey === key) current[key] = field_value;
				current = current[key];
			}
		});
	} catch (error) {
		console.error('Error in formKeysWithObjectSchema: ', error);
		return { error: 'Error in formKeysWithObjectSchema', details: error, key_name, obj, options };
	}
	return obj;
};

export interface formKeysWithObjectSchemaType {
	key_name: string; // The key name to set in the object, e.g., 'address.state'
	obj: Record<string, any | MetaObjectType>; // The object to modify, defaults to an empty object
	options?: formKeysWithObjectSchemaOptionsType; // Options for the field, including type and value
}
export interface formKeysWithObjectSchemaOptionsType {
	type?: string; // The type of the field, e.g., 'string', 'number', etc.
	value?: any; // The value to set for the field
	rowIndex: number; // Optional index for the row, useful for arrays
}

export interface FormComplexStructureType {
	json: any[]; // The JSON data to process
	structure?: Record<string, string>; // The structure mapping for the JSON keys
	filters?: {
		excludeIfEmpty?: Record<string, boolean>; // Fields to exclude if empty
		excludeIfValue?: Record<string, string | Array<string>>; // Fields to exclude if they match a specific value
		returnType?: 'object' | 'array'; // The return type of the function, either 'object' or 'array'
	};
	casingOptions?: casedObjectConfigurationType; // Options for formatting keys
}

export interface MetaObjectType extends Record<string, any> {
	meta?: Object; // Optional meta property for additional metadata
	[key: string]: any; // Allow any other properties
}

const formMetaObject = (meta: MetaObjectType): { meta: MetaObjectType } => {
	return {
		meta,
	};
};

const destroyMetaObject = (obj: MetaObjectType) => {
	if (typeof obj !== 'object' || obj === null) {
		return obj; // Return non-object values as is
	}
	delete obj.meta; // Remove the meta property
	return obj;
};

const meta = {
	rowIndex: 0,
};

const formComplexStructure = ({ json, structure = {}, filters = {}, casingOptions = {} }: FormComplexStructureType) => {
	let returnArray = [];
	const excludeValues: Record<string, string | Array<string>> = {};
	const { excludeIfValue = {}, returnType = 'array' } = filters;

	for (let [excludeKey, excludeValue] of Object.entries(excludeIfValue)) {
		if (typeof excludeValue === 'string') {
			excludeValues[excludeValue] = excludeKey;
		} else if (Array.isArray(excludeValue)) {
			for (let value of excludeValue) {
				excludeValues[value] = excludeKey;
			}
		}
	}

	let metaObject = meta;
	for (let jsonValue of json) {
		let copy = formMetaObject(metaObject);
		let excludeRow = false;

		let data = caseObjectKeys({ obj: jsonValue, ...casingOptions });
		if (Object.keys(structure).length === 0) {
			returnArray.push(data);
			continue; // Skip empty rows
		}

		for (let [key, value] of Object.entries(structure)) {
			const fieldValue = data[value] ?? '';
			if (excludeValues[fieldValue] === key) {
				excludeRow = true;
				continue;
			}

			copy = formKeysWithObjectSchema({
				key_name: key,
				obj: copy,
				options: { type: value, value: data[value] ?? '', rowIndex: metaObject.rowIndex },
			}) as { meta: MetaObjectType };
		}
		copy = destroyMetaObject(copy) as { meta: MetaObjectType };
		if (!excludeRow) {
			returnArray.push(copy);
		}
		metaObject.rowIndex += 1;
	}
	return returnArray;
};

export { formComplexStructure, formKeysWithObjectSchema, getOrCreateNestedArrayItem, validateOptions };
