import { readFile } from 'fs/promises';
import { casedObjectConfigurationType, caseObjectKeys, csvToJson } from './utils';

const complexStructure = {
	org_name: 'company_name',
	'address.address_line_1': 'address',
	'address.address_line_2': 'address_2',
	'address.country': 'country',
	'address.state': 'state',
	'address.state_code': 'state_code',
	'address.city': 'city',
	'address.zipcode': 'zip_code',
	'contact.name': 'contact_person',
	'contact.email': 'emailaddress',
	'contact.phone': 'contactnumber',
	'finance.pan': 'pan',
	'finance.currency': 'currency',
	'details[]': 'details',
};

const dataStructure = {
	'header.org_name': 'company_name',
	'header.address.address_line_1': 'address',
	'header.address.address_line_2': 'address_2',
	'header.address.country': 'country',
	'header.address.state': 'state',
	'header.address.state_code': 'state_code',
	'header.address.city': 'city',
	'header.address.zipcode': 'zip_code',
	'header.contact.name': 'contact_person',
	'header.contact.email': 'emailaddress',
	'header.contact.phone': 'contactnumber',
	'header.finance.pan': 'pan',
	'header.finance.currency': 'currency',
	'details[]': '',
	'details[].pan': 'pan',
	'details[].currency': 'currency',
	'details[].contact[].name': 'contact_person',
	'details[].contact[].email': 'emailaddress',
	'details[].contact[].phone': 'contactnumber',
};
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

export const formKeysWithObjectSchema = ({ key_name, obj = {}, options = { rowIndex: 0 } }: formKeysWithObjectSchemaType) => {
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
interface formKeysWithObjectSchemaType {
	key_name: string; // The key name to set in the object, e.g., 'address.state'
	obj: Record<string, any | MetaObjectType>; // The object to modify, defaults to an empty object
	options?: formKeysWithObjectSchemaOptionsType; // Options for the field, including type and value
}
interface formKeysWithObjectSchemaOptionsType {
	type?: string; // The type of the field, e.g., 'string', 'number', etc.
	value?: any; // The value to set for the field
	rowIndex: number; // Optional index for the row, useful for arrays
}
// export const formKeysWithObjectSchema = ({ key_name, obj = {}, options = {} }: formKeysWithObjectSchemaType) => {
// 	try {
// 		const keys = key_name.split('.');
// 		let current = obj;
// 		const { type: field_type, value: field_value, rowIndex } = options;
// 		if (typeof field_type === 'undefined') {
// 			throw new Error('type should be passed within options for the function formkeysWithObjectSchema');
// 		}
// 		if (typeof field_value === 'undefined') {
// 			throw new Error('value should be passed within options for the function formkeysWithObjectSchema');
// 		}
// 		const field = keys[keys.length - 1];

// 		// console.log('keys => ', keys);
// 		for (let i in keys) {
// 			const key = keys[i];
// 			if (key.endsWith('[]')) {
// 				// console.log('key => ', key, obj, current);
// 				let modkey = key.slice(0, -2);
// 				if (!(modkey in current)) {
// 					current[modkey] = [];
// 				}
// 				if (keys[Number(i) + 1] !== undefined) {
// 					if (obj.meta.rowIndex === rowIndex) {
// 						if (current[modkey][current[modkey].length - 1]) {
// 							current = current[modkey][current[modkey].length - 1];
// 						} else {
// 							const newObj = {};
// 							current[modkey].push(newObj);
// 							current = newObj;
// 						}
// 						// console.log('current for same object=> ', current);
// 					} else {
// 						const newObj = {};
// 						current[modkey].push(newObj);
// 						// console.log('current for same row => ', current[modkey], current);
// 						current = newObj;
// 					}
// 				}
// 			} else {
// 				if (!(key in current)) {
// 					current[key] = {};
// 				}
// 				if (field === key) {
// 					current[key] = field_value;
// 				}

// 				current = current[key];
// 			}
// 		}
// 	} catch (error) {
// 		// console.log(JSON.stringify(error, null, 2));
// 		console.error('Error in formKeysWithObjectSchema: ', error);
// 		return { error: 'Error in formKeysWithObjectSchema', details: error, key_name, obj, options };
// 	}
// 	// console.log('obj => ', obj);
// 	return obj;
// };

interface FormComplexStructureType {
	json: any[]; // The JSON data to process
	structure?: Record<string, string>; // The structure mapping for the JSON keys
	filters?: {
		excludeIfEmpty?: Record<string, boolean>; // Fields to exclude if empty
		excludeIfValue?: Record<string, string | Array<string>>; // Fields to exclude if they match a specific value
		returnType?: 'object' | 'array'; // The return type of the function, either 'object' or 'array'
	};
	casingOptions?: casedObjectConfigurationType; // Options for formatting keys
}

interface MetaObjectType extends Record<string, any> {
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

export const formComplexStructure = ({ json, structure = {}, filters = {}, casingOptions = {} }: FormComplexStructureType) => {
	let response;
	let returnObject = {};
	let returnArray = [];
	const excludeValues: Record<string, string | Array<string>> = {};
	const { excludeIfValue = {}, returnType = 'array' } = filters;

	for (let [excludeKey, excludeValue] of Object.entries(excludeIfValue)) {
		if (typeof excludeValue === 'string') {
			excludeValues[excludeValue] = excludeKey;
		} else if (Array.isArray(excludeValue)) {
			// console.log('excludeValue => ', excludeValue);
			for (let value of excludeValue) {
				excludeValues[value] = excludeKey;
			}
		}
	}
	// console.log('excludeValues => ', excludeValues);

	let metaObject = meta;
	for (let jsonValue of json) {
		let copy = formMetaObject(metaObject);
		let excludeRow = false;

		let data = caseObjectKeys({ obj: jsonValue, ...casingOptions });
		// console.log('data => ', data);
		if (Object.keys(structure).length === 0) {
			returnArray.push(data);
			continue; // Skip empty rows
		}

		// console.log('data => ', data);
		for (let [key, value] of Object.entries(structure)) {
			const fieldValue = data[value] ?? '';
			// console.log('key => ', key, excludeIfValue);
			if (excludeValues[fieldValue] === key) {
				excludeRow = true;
				continue;
			}

			copy = formKeysWithObjectSchema({
				key_name: key,
				obj: copy,
				options: { type: value, value: data[value] ?? '', rowIndex: metaObject.rowIndex },
			}) as { meta: MetaObjectType };
			// console.log(key, value);
			// console.log(copy);
		}
		copy = destroyMetaObject(copy) as { meta: MetaObjectType };
		if (!excludeRow) {
			returnArray.push(copy);
		}
		metaObject.rowIndex += 1;
	}
	return returnArray;
};

const filters = {
	excludeIfEmpty: { 'address.state': true },
	includeIfValue: {},
	excludeIfValue: {
		'address.state': '',
		// 'header.address.country': 'China',
		// 'header.address.country': 'India',
		'header.address.country': ['India', 'China', ''], // Exclude if country is 'India' or 'China'
		// 'details[].contact[].name': 'jaydeep', // Exclude if contact name is 'jaydeep'
		// 'contact.name': 'jaydeep',
	},
};

const casingOptions: casedObjectConfigurationType = {
	case: 'camel', // 'snake', 'camel', 'upper', 'lower'
	delimiter: '_', // Delimiter to use for separating words in the keys
};

const fun = async () => {
	const csvData = await readFile('./csv_data/partner_setup.csv', 'utf-8');
	const json = csvToJson({ csv: csvData });
	let res = formComplexStructure({ json, structure: dataStructure, filters, casingOptions });

	// console.log(res.length);
	console.log(JSON.stringify(res, null, 4));
};
fun();
