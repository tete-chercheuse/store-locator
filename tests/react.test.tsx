import React, { useRef } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StoreLocatorMap, useStoreLocator } from '../src/react';
import { mapLibreMockState } from './mocks/maplibre-gl';
import { SOURCE_ID } from '../src/map/cluster-source';

const sourceFeatureCount = (): number => {
  const source = mapLibreMockState.maps[0]?.sources.get(SOURCE_ID);

  return (source?.data as { features: unknown[]; } | undefined)?.features.length ?? 0;
};

describe('StoreLocatorMap', () => {
  it('creates a StoreLocator and exposes it through onReady once the style is loaded', async () => {
    const onReady = vi.fn();

    const { container } = render(
      <StoreLocatorMap
        stores={[{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }]}
        mapStyle={{ minHeight: 320 }}
        onReady={onReady}
      />,
    );

    await waitFor(() => {
      expect(onReady).toHaveBeenCalledTimes(1);
    });

    expect(container.querySelectorAll('div')).toHaveLength(2);
    expect(mapLibreMockState.maps).toHaveLength(1);
  });

  it('does not fire onReady before the map style has loaded', async () => {
    mapLibreMockState.autoLoad = false;

    const onReady = vi.fn();

    render(
      <StoreLocatorMap
        stores={[{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }]}
        onReady={onReady}
      />,
    );

    await waitFor(() => {
      expect(mapLibreMockState.maps).toHaveLength(1);
    });

    expect(onReady).not.toHaveBeenCalled();

    mapLibreMockState.maps[0].trigger('load');

    await waitFor(() => {
      expect(onReady).toHaveBeenCalledTimes(1);
    });
  });

  it('does not fire onReady for a component unmounted before the style loads', async () => {
    // Une revue par mutation a montré que retirer le garde `cancelled` laissait
    // la suite verte : aucun test ne démontait avant la résolution de
    // `whenReady()`, qui est pourtant la raison d'être du drapeau.
    mapLibreMockState.autoLoad = false;

    const onReady = vi.fn();
    const { unmount } = render(
      <StoreLocatorMap
        stores={[{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }]}
        onReady={onReady}
      />,
    );

    await waitFor(() => {
      expect(mapLibreMockState.maps).toHaveLength(1);
    });

    // `destroy()` résout délibérément la promesse pour ne laisser aucun appelant
    // en attente : sans garde, le `.then` déclencherait `onReady` ici.
    unmount();
    await Promise.resolve();
    await Promise.resolve();

    expect(onReady).not.toHaveBeenCalled();
  });

  it('pushes new source data when the stores prop changes', async () => {
    const { rerender } = render(
      <StoreLocatorMap stores={[{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }]} />,
    );

    await waitFor(() => {
      expect(sourceFeatureCount()).toBe(1);
    });

    rerender(
      <StoreLocatorMap
        stores={[
          { id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 },
          { id: 'store-2', name: 'Bakery', lat: 16.2062, lng: -61.4932 },
        ]}
      />,
    );

    await waitFor(() => {
      expect(sourceFeatureCount()).toBe(2);
    });
  });
});

describe('useStoreLocator', () => {
  it('reports ready only once the style has loaded', async () => {
    mapLibreMockState.autoLoad = false;

    const states: boolean[] = [];

    const Harness = () => {
      const mapRef = useRef<HTMLDivElement | null>(null);
      const { ready } = useStoreLocator({
        stores: [{ id: 'store-1', lat: 1, lng: 1 }],
        mapRef,
      });

      states.push(ready);

      return <div ref={mapRef} />;
    };

    render(<Harness />);

    await waitFor(() => {
      expect(mapLibreMockState.maps).toHaveLength(1);
    });

    expect(states.at(-1)).toBe(false);

    mapLibreMockState.maps[0].trigger('load');

    await waitFor(() => {
      expect(states.at(-1)).toBe(true);
    });
  });

  it('stays not ready when the caller destroys the instance itself', async () => {
    // Cause distincte du démontage : le composant reste monté, le nettoyage de
    // l'effet ne passe donc jamais et `cancelled` reste faux. Comme `destroy()`
    // résout quand même la promesse, seul un garde sur l'état de l'instance
    // empêche `onReady` et `ready: true` de partir pour une instance morte.
    mapLibreMockState.autoLoad = false;

    const onReady = vi.fn();
    let instance: ReturnType<typeof useStoreLocator>['instance'] = null;
    let lastReady = true;

    const Harness = () => {
      const mapRef = useRef<HTMLDivElement | null>(null);
      const result = useStoreLocator({
        stores: [{ id: 'store-1', lat: 1, lng: 1 }],
        mapRef,
        onReady,
      });

      instance = result.instance;
      lastReady = result.ready;

      return <div ref={mapRef} />;
    };

    render(<Harness />);

    await waitFor(() => {
      expect(instance).not.toBeNull();
    });

    instance?.destroy();
    await Promise.resolve();
    await Promise.resolve();

    expect(onReady).not.toHaveBeenCalled();
    expect(lastReady).toBe(false);
  });
});
