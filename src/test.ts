import { readFile } from 'fs/promises';
import { casedObjectConfigurationType, caseObjectKeys, csvToJson } from './utils';
import { FormComplexStructureType, formKeysWithObjectSchemaType, getOrCreateNestedArrayItem } from './utils/transformers';

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
	'details[].pan': 'pan',
	'details[].currency': 'currency',
	'details[].contact[].name': 'contact_person',
	'details[].contact[].email': 'emailaddress',
	'details[].contact[].phone': 'contactnumber',
};

const testing = {
	'org.company_name': 'company_name',
	contact_person: 'contact_person',
	contactnumber: 'contactnumber',
	emailaddress: 'emailaddress',
	alternate_email: 'alternate_email',
	address: 'address',
	address_2: 'address_2',
	zip_code: 'zip_code',
	city: 'city',
	country_code: 'country_code',
	country: 'country',
	state_code: 'state_code',
	state: 'state',
	gstin: 'gstin',
	pan: 'pan',
	currency: 'currency',
	partner_category: 'partner_category',
	maximum_invoice_amount: 'maximum_invoice_amount',
	sender_email: 'sender_email',
	commercial_tax_applicable: 'commercial_tax_applicable',
	'will_the_partner_access_portal_for_transactions?': 'will_the_partner_access_portal_for_transactions?',
};
function validateOptions(options: any) {
	const { type, value } = options;
	if (typeof type === 'undefined') throw new Error('type is required');
	if (typeof value === 'undefined') throw new Error('value is required');
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
			for (let value of excludeValue) {
				excludeValues[value] = excludeKey;
			}
		}
	}

	let metaObject = meta;
	for (let jsonValue of json) {
		let copy = formMetaObject(metaObject);
		let excludeRow = false;

		// console.log('Original JSON value:', jsonValue);
		let data = caseObjectKeys({ obj: jsonValue, ...casingOptions });
		// console.log('Cased JSON value:', data);
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

const filters = {
	excludeIfEmpty: { 'address.state': true },
	includeIfValue: {},
	excludeIfValue: {
		'address.state': '',
		// 'header.address.country': 'China',
		// 'header.address.country': 'India',
		// 'header.address.country': ['India', 'China', ''], // Exclude if country is 'India' or 'China'
		// 'details[].contact[].name': 'jaydeep', // Exclude if contact name is 'jaydeep'
		// 'contact.name': 'jaydeep',
	},
};

const casingOptions: casedObjectConfigurationType = {
	case: 'snake', // 'snake', 'camel', 'upper', 'lower'
	delimiter: '_', // Delimiter to use for separating words in the keys
};

const fun = async () => {
	const csvData = await readFile('./partners.csv', 'utf-8');
	const json = csvToJson({ csv: csvData });
	let res = formComplexStructure({ json, structure: testing, filters, casingOptions });

	console.log(JSON.stringify(res, null, 4));
};

fun();
