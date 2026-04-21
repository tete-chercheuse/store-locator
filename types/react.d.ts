import { type CSSProperties, type ReactNode, type RefObject } from 'react';
import StoreLocator, { StoreLocatorOptions, StoreLocatorProperties, StoreLocatorStoresInput } from './store-locator';

export interface UseStoreLocatorOptions<P extends StoreLocatorProperties = StoreLocatorProperties> {
  stores: StoreLocatorStoresInput<P>;
  options?: Omit<StoreLocatorOptions<P>, 'stores' | 'elements'>;
  mapRef: RefObject<HTMLElement | null>;
  wrapperRef?: RefObject<HTMLElement | null>;
  filtersRef?: RefObject<HTMLFormElement | null>;
  disabled?: boolean;
  onReady?: (instance: StoreLocator<P>) => void;
}

export interface UseStoreLocatorResult<P extends StoreLocatorProperties = StoreLocatorProperties> {
  instance: StoreLocator<P> | null;
  error: Error | null;
  ready: boolean;
}

export interface StoreLocatorMapProps<P extends StoreLocatorProperties = StoreLocatorProperties>
  extends Omit<UseStoreLocatorOptions<P>, 'mapRef' | 'wrapperRef'> {
  className?: string;
  style?: CSSProperties;
  mapClassName?: string;
  mapStyle?: CSSProperties;
  children?: ReactNode;
}

export declare const useStoreLocator: <P extends StoreLocatorProperties = StoreLocatorProperties>(
  options: UseStoreLocatorOptions<P>
) => UseStoreLocatorResult<P>;

export declare const StoreLocatorMap: <P extends StoreLocatorProperties = StoreLocatorProperties>(
  props: StoreLocatorMapProps<P>
) => import('react').DetailedReactHTMLElement<
  {
    ref: RefObject<HTMLDivElement | null>;
    className: string | undefined;
    style: CSSProperties | undefined;
  },
  HTMLDivElement
>;
