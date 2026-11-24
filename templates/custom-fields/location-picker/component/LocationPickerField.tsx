import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Field, NumberInput, Typography } from '@strapi/design-system';
import styled from 'styled-components';

import type { LatLng } from './tileMath';
import {
  buildTileUrl,
  clamp,
  formatLatLng,
  latToTileY,
  lngToTileX,
  MAX_ZOOM,
  MIN_ZOOM,
  parseValue,
  roundCoordinate,
  tileCount,
  tileXToLng,
  tileYToLat,
  TILE_SIZE,
  wrapLng,
} from './tileMath';

interface {{COMPONENT_NAME}}Props {
  name: string;
  onChange: (event: {
    target: { name: string; value: LatLng | null; type: string };
  }) => void;
  value?: LatLng | string | null;
  intlLabel?: { defaultMessage: string };
  required?: boolean;
  attribute?: { type: string; customField: string };
  disabled?: boolean;
  error?: string;
  description?: { defaultMessage: string };
}

/** Roughly the whole world, biased north where most land is. */
const DEFAULT_CENTER: LatLng = { lat: 25, lng: 0 };
const DEFAULT_ZOOM = 2;
/** Street-ish zoom used when the view jumps to an existing point. */
const PICKED_ZOOM = 13;
/** Pointer travel (px) below which a press counts as a click, not a pan. */
const CLICK_SLOP = 4;
const KEY_PAN_STEP = 48;

interface View {
  center: LatLng;
  zoom: number;
}

const {{COMPONENT_NAME}} = ({
  name,
  onChange,
  value,
  intlLabel,
  required = false,
  disabled = false,
  error,
  description,
}: {{COMPONENT_NAME}}Props) => {
  const picked = useMemo(() => parseValue(value), [value]);
  const isUnreadable = value !== null && value !== undefined && value !== '' && picked === null;

  const [view, setView] = useState<View>(() =>
    picked ? { center: picked, zoom: PICKED_ZOOM } : { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM }
  );
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; travel: number } | null>(null);
  // A saved entry loads its value after the first render; centre on it once,
  // then leave the view alone so panning is never yanked back.
  const hasCenteredRef = useRef(picked !== null);

  useEffect(() => {
    if (!hasCenteredRef.current && picked) {
      hasCenteredRef.current = true;
      setView({ center: picked, zoom: PICKED_ZOOM });
    }
  }, [picked]);

  useLayoutEffect(() => {
    const element = surfaceRef.current;

    if (!element) {
      return undefined;
    }

    const measure = () =>
      setViewport({ width: element.clientWidth, height: element.clientHeight });

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /** Everything needed to draw a frame: which tiles, and where they sit. */
  const frame = useMemo(() => {
    const { width, height } = viewport;

    if (width === 0 || height === 0) {
      return null;
    }

    const { zoom } = view;
    const worldTiles = tileCount(zoom);
    const centerX = lngToTileX(view.center.lng, zoom);
    const centerY = latToTileY(view.center.lat, zoom);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const minX = Math.floor(centerX - halfWidth / TILE_SIZE);
    const maxX = Math.floor(centerX + halfWidth / TILE_SIZE);
    // The world does not repeat vertically, so rows stay inside the map.
    const minY = Math.max(0, Math.floor(centerY - halfHeight / TILE_SIZE));
    const maxY = Math.min(worldTiles - 1, Math.floor(centerY + halfHeight / TILE_SIZE));

    const tiles: Array<{ key: string; url: string }> = [];

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        // Columns wrap so panning across the antimeridian keeps working.
        const wrappedX = ((x % worldTiles) + worldTiles) % worldTiles;
        tiles.push({ key: `${zoom}:${x}:${y}`, url: buildTileUrl(wrappedX, y, zoom) });
      }
    }

    return {
      tiles,
      columns: maxX - minX + 1,
      offsetX: (minX - centerX) * TILE_SIZE + halfWidth,
      offsetY: (minY - centerY) * TILE_SIZE + halfHeight,
      centerX,
      centerY,
      halfWidth,
      halfHeight,
      worldWidth: worldTiles * TILE_SIZE,
    };
  }, [viewport, view]);

  const markerPosition = useMemo(() => {
    if (!picked || !frame) {
      return null;
    }

    const { zoom } = view;
    const y = (latToTileY(picked.lat, zoom) - frame.centerY) * TILE_SIZE + frame.halfHeight;
    let x = (lngToTileX(picked.lng, zoom) - frame.centerX) * TILE_SIZE + frame.halfWidth;

    // Draw the marker in whichever copy of the world is nearest the viewport.
    while (x < frame.halfWidth - frame.worldWidth / 2) {
      x += frame.worldWidth;
    }
    while (x > frame.halfWidth + frame.worldWidth / 2) {
      x -= frame.worldWidth;
    }

    return { x, y };
  }, [picked, frame, view]);

  const commit = useCallback(
    (next: LatLng | null) => {
      onChange({
        target: {
          name,
          value: next
            ? { lat: roundCoordinate(next.lat), lng: roundCoordinate(next.lng) }
            : null,
          type: 'json',
        },
      });
    },
    [name, onChange]
  );

  const panByPixels = useCallback((dx: number, dy: number) => {
    setView((current) => {
      const { zoom } = current;
      const x = lngToTileX(current.center.lng, zoom) + dx / TILE_SIZE;
      const y = clamp(latToTileY(current.center.lat, zoom) + dy / TILE_SIZE, 0, tileCount(zoom));

      return {
        zoom,
        center: { lat: tileYToLat(y, zoom), lng: wrapLng(tileXToLng(x, zoom)) },
      };
    });
  }, []);

  const zoomBy = useCallback((delta: number) => {
    setView((current) => ({
      ...current,
      zoom: clamp(current.zoom + delta, MIN_ZOOM, MAX_ZOOM),
    }));
  }, []);

  const pointToLatLng = useCallback(
    (clientX: number, clientY: number): LatLng | null => {
      const element = surfaceRef.current;

      if (!element || !frame) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      const dx = clientX - rect.left - frame.halfWidth;
      const dy = clientY - rect.top - frame.halfHeight;
      const { zoom } = view;
      const y = clamp(frame.centerY + dy / TILE_SIZE, 0, tileCount(zoom));

      return {
        lat: tileYToLat(y, zoom),
        lng: wrapLng(tileXToLng(frame.centerX + dx / TILE_SIZE, zoom)),
      };
    },
    [frame, view]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      travel: 0,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.travel += Math.abs(dx) + Math.abs(dy);

    panByPixels(-dx, -dy);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // A press that barely moved is a pick; anything more was a pan.
    if (drag.travel <= CLICK_SLOP) {
      const coordinates = pointToLatLng(event.clientX, event.clientY);

      if (coordinates) {
        commit(coordinates);
      }
    }
  };

  const handlePointerCancel = () => {
    dragRef.current = null;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        panByPixels(0, -KEY_PAN_STEP);
        break;
      case 'ArrowDown':
        panByPixels(0, KEY_PAN_STEP);
        break;
      case 'ArrowLeft':
        panByPixels(-KEY_PAN_STEP, 0);
        break;
      case 'ArrowRight':
        panByPixels(KEY_PAN_STEP, 0);
        break;
      case '+':
      case '=':
        zoomBy(1);
        break;
      case '-':
      case '_':
        zoomBy(-1);
        break;
      case 'Enter':
      case ' ':
        commit(view.center);
        break;
      default:
        return;
    }

    event.preventDefault();
  };

  const handleLatChange = (nextLat?: number) => {
    if (nextLat === undefined || !Number.isFinite(nextLat)) {
      return;
    }

    commit({ lat: clamp(nextLat, -90, 90), lng: picked?.lng ?? view.center.lng });
  };

  const handleLngChange = (nextLng?: number) => {
    if (nextLng === undefined || !Number.isFinite(nextLng)) {
      return;
    }

    commit({ lat: picked?.lat ?? view.center.lat, lng: clamp(nextLng, -180, 180) });
  };

  const label = intlLabel?.defaultMessage ?? '{{DISPLAY_NAME}}';

  return (
    <Field.Root
      name={name}
      error={error}
      hint={description?.defaultMessage}
      required={required}
    >
      <Field.Label>{label}</Field.Label>

      <FieldColumn>
        <Container>
          <MapSurface
            ref={surfaceRef}
            role="application"
            aria-label={`${label} map. Click to pick a location. Arrow keys pan, plus and minus zoom, Enter picks the centre of the map.`}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            $disabled={disabled}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            {frame ? (
              <TileGrid $columns={frame.columns} $x={frame.offsetX} $y={frame.offsetY}>
                {frame.tiles.map((tile) => (
                  <Tile key={tile.key} src={tile.url} alt="" draggable={false} />
                ))}
              </TileGrid>
            ) : null}

            {markerPosition ? <Marker $x={markerPosition.x} $y={markerPosition.y} /> : null}

            {/* Keyboard users pick the centre, so show them where that is. */}
            {isFocused && !disabled ? <Crosshair aria-hidden="true" /> : null}

            <Attribution>
              <Typography variant="pi" textColor="neutral600">
                ©{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer noopener"
                  tabIndex={-1}
                >
                  OpenStreetMap
                </a>{' '}
                contributors
              </Typography>
            </Attribution>
          </MapSurface>

          <Toolbar>
            <Typography variant="pi" textColor={picked ? 'neutral800' : 'neutral600'}>
              {picked ? formatLatLng(picked) : 'Click the map to pick a location'}
            </Typography>

            <ToolbarActions>
              <Button
                type="button"
                variant="tertiary"
                size="S"
                disabled={disabled || view.zoom <= MIN_ZOOM}
                aria-label="Zoom out"
                onClick={() => zoomBy(-1)}
              >
                −
              </Button>
              <Typography variant="pi" textColor="neutral600">
                {`z${view.zoom}`}
              </Typography>
              <Button
                type="button"
                variant="tertiary"
                size="S"
                disabled={disabled || view.zoom >= MAX_ZOOM}
                aria-label="Zoom in"
                onClick={() => zoomBy(1)}
              >
                +
              </Button>
              <Button
                type="button"
                variant="tertiary"
                size="S"
                disabled={disabled || !picked}
                onClick={() => picked && setView({ center: picked, zoom: PICKED_ZOOM })}
              >
                Centre
              </Button>
              <Button
                type="button"
                variant="tertiary"
                size="S"
                disabled={disabled || !picked}
                onClick={() => commit(null)}
              >
                Clear
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>

        {isUnreadable ? (
          <Typography variant="pi" textColor="danger600">
            The stored value is not a valid {'{ lat, lng }'} pair. Picking a location will replace
            it.
          </Typography>
        ) : null}

        <SideBySideRow>
          <InputGroup>
            <Typography variant="pi" textColor="neutral600">
              Latitude
            </Typography>
            <NumberInput
              aria-label="Latitude"
              value={picked?.lat ?? undefined}
              onValueChange={handleLatChange}
              disabled={disabled}
              step={0.0001}
              placeholder="-90 to 90"
            />
          </InputGroup>
          <InputGroup>
            <Typography variant="pi" textColor="neutral600">
              Longitude
            </Typography>
            <NumberInput
              aria-label="Longitude"
              value={picked?.lng ?? undefined}
              onValueChange={handleLngChange}
              disabled={disabled}
              step={0.0001}
              placeholder="-180 to 180"
            />
          </InputGroup>
        </SideBySideRow>
      </FieldColumn>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  );
};

const FieldColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaces[3]};
`;

const Container = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.neutral0};
`;

const MapSurface = styled.div<{ $disabled: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.neutral150};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'crosshair')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  /* Let the map own drag gestures instead of scrolling the edit view. */
  touch-action: none;
  user-select: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary600};
    outline-offset: -2px;
  }
`;

const TileGrid = styled.div<{ $columns: number; $x: number; $y: number }>`
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  /* Raster tiles are a fixed 256px square — the one place pixels are correct. */
  grid-template-columns: repeat(${({ $columns }) => $columns}, ${TILE_SIZE}px);
  grid-auto-rows: ${TILE_SIZE}px;
  transform: ${({ $x, $y }) => `translate3d(${$x}px, ${$y}px, 0)`};
`;

const Tile = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Marker = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ theme }) => theme.spaces[4]};
  height: ${({ theme }) => theme.spaces[4]};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary600};
  border: 2px solid ${({ theme }) => theme.colors.neutral0};
  transform: ${({ $x, $y }) => `translate3d(${$x}px, ${$y}px, 0)`} translate(-50%, -50%);
  pointer-events: none;
`;

const Crosshair = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${({ theme }) => theme.spaces[6]};
  height: ${({ theme }) => theme.spaces[6]};
  transform: translate(-50%, -50%);
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: ${({ theme }) => theme.colors.neutral800};
  }

  &::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
  }

  &::after {
    left: 50%;
    top: 0;
    height: 100%;
    width: 1px;
  }
`;

const Attribution = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  padding: ${({ theme }) => `0 ${theme.spaces[1]}`};
  background: ${({ theme }) => theme.colors.neutral0};
  border-top-left-radius: ${({ theme }) => theme.borderRadius};
  opacity: 0.85;
  pointer-events: auto;

  a {
    color: ${({ theme }) => theme.colors.neutral600};
  }
`;

const Toolbar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaces[3]};
  padding: ${({ theme }) => `${theme.spaces[2]} ${theme.spaces[3]}`};
  background: ${({ theme }) => theme.colors.neutral100};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral200};
`;

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaces[2]};
`;

const SideBySideRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spaces[4]};
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaces[1]};
`;

export { {{COMPONENT_NAME}} };
