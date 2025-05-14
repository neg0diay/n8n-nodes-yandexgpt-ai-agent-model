import { ChatYandexGPT, YandexGPTInputs } from '@langchain/yandex';
import {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
	NodeConnectionType,
	ISupplyDataFunctions,
	// type IExecuteFunctions,
	type INodeType,
	type INodeTypeDescription,
	type SupplyData,
} from 'n8n-workflow';

// import { AI_MODULES } from 'n8n-workflow/ai';
//
// @AI_MODULES.registerModule()
export class LmYandexGpt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yandex GPT Model',
		name: 'lmYandexGpt',
		icon: 'file:LmYandexGpt.svg',
		group: ['transform'],
		version: 1,
		description: 'Yandex GPT language model',
		defaults: {
			name: 'Yandex GPT Model',
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
		inputs: [NodeConnectionType.Main],
		// inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.AiLanguageModel],
		// outputs: [NodeConnectionType.AiChain],
		// outputs: [NodeConnectionType.Main],
		// outputs: ["main"],
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
				description: 'The model which will generate the completion',
				hint: 'Provide model URI or select from the list. Available models can be found in <a href="https://yandex.cloud/ru/docs/foundation-models/concepts/yandexgpt/models" target="_blank">Yandex Foundation Models</a> documentation.',
				type: 'resourceLocator',
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
		const credentials = await this.getCredentials('yandexGptApi');

		const modelUriInput = this.getNodeParameter('model', itemIndex, '', {
			extractValue: true,
		}) as string;

		var modelUri: string;

		if (modelUriInput.match('^(gpt|ds)://')) {
			// todo: check folderId
			modelUri = modelUriInput;
		} else {
			modelUri = `gpt://${credentials.folderId}/${modelUriInput}`;
		}

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			maxTokens?: number;
			temperature?: number;
		} as YandexGPTInputs;

		const model = new ChatYandexGPT({
			apiKey: credentials.apiKey as string,
			modelURI: modelUri,
			...options,
		});

		// form deepseek

		const wrappedModel = {
			invoke: async (input: any) => {
				return model.invoke(input);
			},
			// Для поддержки стриминга
			stream: model.stream ? async (input: any) => model.stream(input) : undefined,
		};

		return {
			response: wrappedModel,
		};

		// form deepseek

		// return {
		// 	response: model,
		// };
	}
}
