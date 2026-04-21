import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

import StoreLocator, {
  StoreLocatorOptions,
  StoreLocatorProperties,
  StoreLocatorStoresInput,
} from './store-locator';

const toError = (error: unknown): Error => {
  return error instanceof Error
    ? error
    : new Error('[store-locator/react] - Failed to initialize StoreLocator');
};

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

export const useStoreLocator = <P extends StoreLocatorProperties = StoreLocatorProperties>({
  stores,
  options,
  mapRef,
  wrapperRef,
  filtersRef,
  disabled = false,
  onReady,
}: UseStoreLocatorOptions<P>): UseStoreLocatorResult<P> => {
  const [instance, setInstance] = useState<StoreLocator<P> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const storesRef = useRef(stores);
  const optionsRef = useRef(options);
  const onReadyRef = useRef(onReady);

  storesRef.current = stores;
  optionsRef.current = options;
  onReadyRef.current = onReady;

  const currentWrapper = wrapperRef?.current ?? null;
  const currentFilters = filtersRef?.current ?? null;

  useEffect(() => {
    let active = true;
    let locator: StoreLocator<P> | null = null;

    if(disabled || !mapRef.current) {
      setInstance(null);
      setError(null);
      return;
    }

    const initialize = async (): Promise<void> => {
      try {
        if(!active || !mapRef.current) {
          return;
        }

        locator = new StoreLocator<P>({
          ...(optionsRef.current ?? {}),
          stores: storesRef.current,
          elements: {
            map: mapRef.current,
            wrapper: wrapperRef?.current ?? null,
            filters: filtersRef?.current ?? null,
          },
        });

        if(!active) {
          locator.destroy();
          return;
        }

        setInstance(locator);
        setError(null);
        onReadyRef.current?.(locator);
      }
      catch (nextError) {
        if(active) {
          setError(toError(nextError));
          setInstance(null);
        }
      }
    };

    void initialize();

    return () => {
      active = false;

      if(locator) {
        locator.destroy();
      }

      setInstance((currentInstance) => currentInstance === locator ? null : currentInstance);
    };
  }, [disabled, filtersRef, mapRef, wrapperRef]);

  useEffect(() => {
    if(!instance) {
      return;
    }

    instance.setStores(stores);
  }, [instance, stores]);

  useEffect(() => {
    if(!instance) {
      return;
    }

    instance.setFilters(currentFilters, currentWrapper);
  }, [currentFilters, currentWrapper, instance]);

  return {
    instance,
    error,
    ready: Boolean(instance) && !error,
  };
};

export const StoreLocatorMap = <P extends StoreLocatorProperties = StoreLocatorProperties>({
  stores,
  options,
  filtersRef,
  disabled,
  onReady,
  className,
  style,
  mapClassName,
  mapStyle,
  children,
}: StoreLocatorMapProps<P>) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useStoreLocator({
    stores,
    options,
    filtersRef,
    mapRef,
    wrapperRef,
    disabled,
    onReady,
  });

  return createElement(
    'div',
    { ref: wrapperRef, className, style },
    children,
    createElement('div', {
      ref: mapRef,
      className: mapClassName,
      style: mapStyle ?? { minHeight: 400 },
    }),
  );
};
