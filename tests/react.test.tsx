import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StoreLocatorMap } from '../src/react';
import { leafletMockState } from './mocks/leaflet';

describe('StoreLocatorMap', () => {
  it('creates a StoreLocator instance and exposes it through onReady', async () => {
    const onReady = vi.fn();

    const { container } = render(
      <StoreLocatorMap
        stores={[
          { id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 },
        ]}
        mapStyle={{ minHeight: 320 }}
        onReady={onReady}
      />,
    );

    await waitFor(() => {
      expect(onReady).toHaveBeenCalledTimes(1);
    });

    expect(container.querySelectorAll('div')).toHaveLength(2);
    expect(leafletMockState.maps).toHaveLength(1);
  });

  it('refreshes clusters when the stores prop changes', async () => {
    const { rerender } = render(
      <StoreLocatorMap
        stores={[
          { id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 },
        ]}
      />,
    );

    await waitFor(() => {
      expect(leafletMockState.geoJSONCalls.at(-1)?.stores.features).toHaveLength(1);
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
      expect(leafletMockState.geoJSONCalls.at(-1)?.stores.features).toHaveLength(2);
    });
  });
});
