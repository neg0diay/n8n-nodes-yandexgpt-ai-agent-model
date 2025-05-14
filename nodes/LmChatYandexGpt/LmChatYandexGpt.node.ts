/* eslint-disable n8n-nodes-base/node-dirname-against-convention */

// import { ChatOpenAI, type ClientOptions } from '@langchain/openai';
import { ChatYandexGPT, YandexGPTInputs } from '@langchain/yandex';
import {
	NodeConnectionType,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

// import {
// 	type OpenAICompatibleCredential,
// } from 'n8n';

// import { getConnectionHintNoticeField } from '@utils/sharedFields';

// import { openAiFailedAttemptHandler } from '../../vendors/OpenAi/helpers/error-handling';
// import { makeN8nLlmFailedAttemptHandler } from '../n8nLlmFailedAttemptHandler';
// import { N8nLlmTracing } from '../N8nLlmTracing';

export class LmChatYandexGpt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yandex GPT Chat Model',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-name-miscased
		name: 'lmChatYandexGpt',
		icon: 'file:LmYandexGpt.svg',
		group: ['transform'],
		version: [1],
		description: 'For advanced usage with an AI chain',
		defaults: {
			name: 'Yandex GPT Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://yandex.cloud/ru/docs/foundation-models/',
					},
				],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'yandexGptApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				// type: 'options',
				// eslint-disable-next-line n8n-nodes-base/node-param-description-excess-final-period
				type: 'resourceLocator',
				description: 'The model which will generate the completion. 6.',
				default: '',
				modes: [
					{
						displayName: 'URI',
						name: 'uri',
						type: 'string',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^(gpt|ds)://(.+)/(.+)',
									errorMessage: 'Invalid URI',
								},
							},
						],
						placeholder: 'gpt://<folder_id>/yandexgpt-lite/latest',
					},
					{
						displayName: 'List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'listYandexGptModels',
							searchable: true,
						},
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						default: 0.3,
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						description:
							'Amount of randomness injected into the response. Ranges from 0 to 1 (0 is not included). Use temp closer to 0 for analytical / multiple choice, and temp closer to 1 for creative and generative tasks',
						type: 'number',
					},
					{
						displayName: 'Max Tokens',
						name: 'maxTokens',
						type: 'number',
						default: 2000,
						description:
							'The limit on the number of tokens used for single completion generation. Must be greater than zero. This maximum allowed parameter value may depend on the model being used.',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async listYandexGptModels(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const models = [
					{
						model: 'yandexgpt-lite',
						segments: ['latest', 'rc', 'deprecated'],
					},
					{
						model: 'yandexgpt',
						segments: ['latest', 'rc', 'deprecated'],
					},
					{
						model: 'yandexgpt-32k',
						segments: ['latest', 'rc'],
					},
					{
						model: 'llama-lite',
						segments: ['latest'],
					},
					{
						model: 'llama',
						segments: ['latest'],
					},
				];

				const results: INodeListSearchItems[] = models.flatMap(({ model, segments }) =>
					segments.map((segment) => ({
						name: `${model}/${segment}`,
						value: `${model}/${segment}`,
					})),
				);

				return { results };
			},
		},
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		console.log('start');

		// const credentials = await this.getCredentials<OpenAICompatibleCredential>('deepSeekApi');
		const credentials = await this.getCredentials('yandexGptApi');

		console.log('credentials');
		console.log(credentials);

		const modelName = this.getNodeParameter('model', itemIndex, '', {
			extractValue: true,
		}) as string;

		console.log('modelName');
		console.log(modelName);

		var modelUri: string;

		if (modelName.match('^(gpt|ds)://')) {
			// todo: check folderId
			modelUri = modelName;
		} else {
			modelUri = `gpt://${credentials.folderId}/${modelName}`;
		}

		// const options = this.getNodeParameter('options', itemIndex, {}) as {
		// 	frequencyPenalty?: number;
		// 	maxTokens?: number;
		// 	maxRetries: number;
		// 	timeout: number;
		// 	presencePenalty?: number;
		// 	temperature?: number;
		// 	topP?: number;
		// 	responseFormat?: 'text' | 'json_object';
		// };

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			maxTokens?: number;
			temperature?: number;
		} as YandexGPTInputs;

		console.log('options');
		console.log(options);

		const model = new ChatYandexGPT({
			apiKey: credentials.apiKey as string,
			modelURI: modelUri,
			...options,
		});

		console.log('model');
		console.log(model);

		// iamToken?: string;
		// model: string;
		// modelVersion: string;
		// folderID?: string;
		//

		// const configuration: ClientOptions = {
		// 	baseURL: credentials.url,
		// };

		// const model = new ChatOpenAI({
		// 	openAIApiKey: credentials.apiKey,
		// 	modelName,
		// 	...options,
		// 	timeout: options.timeout ?? 60000,
		// 	maxRetries: options.maxRetries ?? 2,
		// 	configuration,
		// 	callbacks: [new N8nLlmTracing(this)],
		// 	modelKwargs: options.responseFormat
		// 		? {
		// 				response_format: { type: options.responseFormat },
		// 			}
		// 		: undefined,
		// 	onFailedAttempt: makeN8nLlmFailedAttemptHandler(this, openAiFailedAttemptHandler),
		// });

		return {
			response: model,
		};
	}
}
