import _ from '@lodash';
import { PartialDeep } from 'type-fest';
import { EcommerceProduct } from '../../ECommerceApi';

/**
 * The product model.
 */
const ProductModel = (data: PartialDeep<EcommerceProduct>) =>
	_.defaults(data || {}, {
		id: _.uniqueId('product-'),
		name: '',
		handle: '',
		description: '',
		categories: [],
		categoryId: '',
		tags: [],
		featuredImageId: '',
		images: [],
		priceTaxExcl: 299000,
		priceTaxIncl: 299000,
		taxRate: 0,
		comparedPrice: 450000,
		costPerItem: 140000,
		quantity: 100,
		stockQuantity: 100,
		sku: '',
		width: '',
		height: '',
		depth: '',
		weight: '500',
		weightInGrams: 500,
		extraShippingFee: 0,
		price: 299000,
		active: true,
		image: '',
		total: '',
		productType: 'Physical',
		downloadUrl: '',
		serialKeys: [],
		status: 'active',
		isPublished: true,
		channels: ['online_store', 'shopee', 'tiktok']
	});

export default ProductModel;
