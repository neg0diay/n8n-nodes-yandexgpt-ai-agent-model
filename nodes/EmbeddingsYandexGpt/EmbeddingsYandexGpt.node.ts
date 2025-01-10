import { YandexGPTEmbeddings } from '@langchain/yandex';
import {
	NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
	type SupplyData,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodeListSearchItems,
} from 'n8n-workflow';

export class EmbeddingsYandexGpt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Embeddings Yandex GPT',
		name: 'embeddingsYandexGpt',
		icon: 'file:YandexGPT.svg',
		credentials: [
			{
				name: 'yandexGptApi',
				required: true,
			},
		],
		group: ['transform'],
		version: 1,
		description: 'Use Embeddings Yandex GPT',
		defaults: {
			name: 'Embeddings Yandex GPT',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Embeddings'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://yandex.cloud/ru/docs/foundation-models/concepts/embeddings',
					},
				],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.AiEmbedding],
		outputNames: ['Embeddings'],
		properties: [
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
				options: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'text-search-doc/latest (for long texts)',
						value: 'text-search-doc/latest',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'text-search-query/latest (for short texts)',
						value: 'text-search-query/latest',
					},
				],
				default: 'text-search-doc/latest',
			},
		],
	};

	methods = {
		listSearch: {
			async getEmbeddingsModels(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const models = [
					{
						'model': 'text-search-doc',
						'segments': ['latest'],
					},
					{
						'model': 'text-search-query',
						'segments': ['latest'],
					},
				];

				const results: INodeListSearchItems[] = models.flatMap(({ model, segments }) =>
					segments.map(segment => ({ name: `${model}/${segment}`, value: `${model}/${segment}` }))
				);

				return { results };
			},
		},
	};

	async supplyData(this: IExecuteFunctions, itemIndex: number): Promise<SupplyData> {
		this.logger.debug('Supply data for embeddings');
		const credentials = await this.getCredentials('yandexGptApi');

		const modelUriInput = this.getNodeParameter('model', itemIndex) as string;
		const modelUri = `emb://${credentials.folderId}/${modelUriInput}`;

		const embeddings = new YandexGPTEmbeddings({
			apiKey: credentials!.apiKey as string,
			modelURI: modelUri,
		});

		return {
			response: embeddings,
		};
	}
}
