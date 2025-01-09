import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class YandexGptApi implements ICredentialType {
	name = 'yandexGptApi';
	displayName = 'Yandex GPT API';
	documentationUrl = 'https://yandex.cloud/ru/docs/foundation-models/api-ref/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'Enter your Yandex GPT API Key here...',
			description: 'API Key for accessing the Yandex GPT API.',
			required: true,
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Api-Key {{$credentials.apiKey}}',
			},
		},
	};
}
