import { ChatYandexGPT } from '@langchain/yandex';
import {
	NodeConnectionType,
	type IExecuteFunctions,
	type INodeType,
	type INodeTypeDescription,
	type SupplyData,
} from 'n8n-workflow';

export class LmYandexGpt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yandex GPT Model',
		name: 'lmYandexGpt',
		// icon: 'file:icons/YandexGpt.svg', // Укажи путь к иконке.
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
				type: 'string',
				name: 'model',
				hint: 'The model which will generate the completion. Available options can be found in <a href="https://yandex.cloud/ru/docs/foundation-models/concepts/yandexgpt/models" target="_blank">Yandex Foundation Models</a> documentation.',
				default: '',
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
						description: 'Amount of randomness injected into the response. Ranges from 0 to 1 (0 is not included). Use temp closer to 0 for analytical / multiple choice, and temp closer to 1 for creative and generative tasks',
						type: 'number',
					},
					{
						displayName: 'Max Tokens',
						name: 'maxTokens',
						type: 'number',
						default: 2000,
						description: 'The limit on the number of tokens used for single completion generation. Must be greater than zero. This maximum allowed parameter value may depend on the model being used.',
					},
				],
			}
		],
	};

	async supplyData(this: IExecuteFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('yandexGptApi');

		const modelUri = this.getNodeParameter('model', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as {
			maxTokens?: number;
			temperature?: number;
		};

		const model = new ChatYandexGPT({
			apiKey: credentials.apiKey as string,
			modelURI: modelUri,
			...options
		});

		return {
			response: model,
		};
	}
}
