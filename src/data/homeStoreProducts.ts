export type HomeStoreCardVariant = 'official' | 'marketplace';

export type HomeStoreProduct = {
  id: string;
  variant: HomeStoreCardVariant;
  typeKey: string;
  actionKey: string;
  titleKey: string;
  subKey: string;
  priceKey: string;
  img: string;
  images?: string[];
};

export const HOME_STORE_PRODUCTS: HomeStoreProduct[] = [
  {
    id: 'official-jersey',
    variant: 'official',
    typeKey: 'public.home.store.officialMerchandise',
    actionKey: 'public.home.store.viewStore',
    titleKey: 'public.home.store.products.jersey.title',
    subKey: 'public.home.store.products.jersey.sub',
    priceKey: 'public.home.store.products.jersey.price',
    img: '/img/image 297012.png',
  },
  {
    id: 'marketplace-bike',
    variant: 'marketplace',
    typeKey: 'public.home.store.communityMarketplace',
    actionKey: 'public.home.store.exploreMarketplace',
    titleKey: 'public.home.store.products.marketplace.title',
    subKey: 'public.home.store.products.marketplace.sub',
    priceKey: 'public.home.store.products.marketplace.price',
    img: '/img/image 2970.png',
    images: ['/img/image 2970.png', '/img/image 2970 (1).png'],
  },
];

export const HOME_STORE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80';
