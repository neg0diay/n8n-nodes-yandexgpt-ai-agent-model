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
		// requestDefaults: {
		// 	ignoreHttpStatusErrors: true,
		// 	baseURL: '={{ $credentials?.url }}',
		// },
		properties: [
			// getConnectionHintNoticeField([NodeConnectionType.AiChain, NodeConnectionType.AiAgent]),
			// {
			// 	displayName:
			// 		'If using JSON response format, you must include word "json" in the prompt in your chain or agent. Also, make sure to select latest models released post November 2023.',
			// 	name: 'notice',
			// 	type: 'notice',
			// 	default: '',
			// 	displayOptions: {
			// 		show: {
			// 			'/options.responseFormat': ['json_object'],
			// 		},
			// 	},
			// },
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				// type: 'resourceLocator',
				description: 'The model which will generate the completion.',
				// typeOptions: {
				// 	loadOptions: {
				// 		routing: {
				// 			request: {
				// 				method: 'GET',
				// 				url: '/models',
				// 			},
				// 			output: {
				// 				postReceive: [
				// 					{
				// 						type: 'rootProperty',
				// 						properties: {
				// 							property: 'data',
				// 						},
				// 					},
				// 					{
				// 						type: 'setKeyValue',
				// 						properties: {
				// 							name: '={{$responseItem.id}}',
				// 							value: '={{$responseItem.id}}',
				// 						},
				// 					},
				// 					{
				// 						type: 'sort',
				// 						properties: {
				// 							key: 'name',
				// 						},
				// 					},
				// 				],
				// 			},
				// 		},
				// 	},
				// },
				// routing: {
				// 	send: {
				// 		type: 'body',
				// 		property: 'model',
				// 	},
				// },
				// default: 'deepseek-chat',

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
					// {
					// 	displayName: 'Frequency Penalty',
					// 	name: 'frequencyPenalty',
					// 	default: 0,
					// 	typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
					// 	description:
					// 		"Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim",
					// 	type: 'number',
					// },
					// {
					// 	displayName: 'Maximum Number of Tokens',
					// 	name: 'maxTokens',
					// 	default: -1,
					// 	description:
					// 		'The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 32,768).',
					// 	type: 'number',
					// 	typeOptions: {
					// 		maxValue: 32768,
					// 	},
					// },
					// {
					// 	displayName: 'Response Format',
					// 	name: 'responseFormat',
					// 	default: 'text',
					// 	type: 'options',
					// 	options: [
					// 		{
					// 			name: 'Text',
					// 			value: 'text',
					// 			description: 'Regular text response',
					// 		},
					// 		{
					// 			name: 'JSON',
					// 			value: 'json_object',
					// 			description:
					// 				'Enables JSON mode, which should guarantee the message the model generates is valid JSON',
					// 		},
					// 	],
					// },
					// {
					// 	displayName: 'Presence Penalty',
					// 	name: 'presencePenalty',
					// 	default: 0,
					// 	typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
					// 	description:
					// 		"Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics",
					// 	type: 'number',
					// },
					// {
					// 	displayName: 'Sampling Temperature',
					// 	name: 'temperature',
					// 	default: 0.7,
					// 	typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
					// 	description:
					// 		'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
					// 	type: 'number',
					// },
					// {
					// 	displayName: 'Timeout',
					// 	name: 'timeout',
					// 	default: 360000,
					// 	description: 'Maximum amount of time a request is allowed to take in milliseconds',
					// 	type: 'number',
					// },
					// {
					// 	displayName: 'Max Retries',
					// 	name: 'maxRetries',
					// 	default: 2,
					// 	description: 'Maximum number of retries to attempt',
					// 	type: 'number',
					// },
					// {
					// 	displayName: 'Top P',
					// 	name: 'topP',
					// 	default: 1,
					// 	typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
					// 	description:
					// 		'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered. We generally recommend altering this or temperature but not both.',
					// 	type: 'number',
					// },

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
		// const credentials = await this.getCredentials<OpenAICompatibleCredential>('deepSeekApi');
		const credentials = await this.getCredentials('yandexGptApi');

		const modelName = this.getNodeParameter('model', itemIndex, '', {
			extractValue: true,
		}) as string;

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

		const model = new ChatYandexGPT({
			apiKey: credentials.apiKey as string,
			modelURI: modelUri,
			...options,
		});

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
