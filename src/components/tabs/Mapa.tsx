'use client';
import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { useTrip } from '../ctx';
import { Card, Chip } from '../ui';
import { fmtD } from '@/lib/types';

export default function Mapa() {
  const { data } = useTrip();
  const [filter, setFilter] = useState<string>('all');
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);

  const pois = data.pois.filter(p => filter === 'all' || p.city === filter);
  const cmap = Object.fromEntries(data.cities.map(c => [c.id, c]));

  useEffect(() => {
    let dead = false;
    (async () => {
      const L = (await import('leaflet')).default as unknown as typeof Leaflet;
      if (dead || !divRef.current) return;
      LRef.current = L;
      if (!mapRef.current) {
        mapRef.current = L.map(divRef.current, { zoomSnap: 0.5 });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19, subdomains: 'abcd', attribution: '© OpenStreetMap · © CARTO',
        }).addTo(mapRef.current);
      }
      draw();
    })();
    return () => { dead = true; mapRef.current?.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter, data.pois]);

  function draw() {
    const L = LRef.current, map = mapRef.current;
    if (!L || !map) return;
    layerRef.current?.remove();
    const g = L.layerGroup().addTo(map);
    layerRef.current = g;

    const pts = data.pois.filter(p => filter === 'all' || p.city === filter);
    pts.forEach(p => {
      const color = cmap[p.city]?.color ?? '#888';
      L.circleMarker([p.lat, p.lng], {
        radius: 8, color: '#ffffff', weight: 2.5, fillColor: color, fillOpacity: 0.95,
      }).addTo(g).bindPopup(
        `<b style="font-size:13px">${p.name}</b><br>` +
        `${p.date ? `<span style="color:${color};font-weight:700">${fmtD(p.date)}</span><br>` : ''}` +
        `<span style="color:#666">${p.note ?? ''}</span>`);
    });
    if (filter === 'all') {
      L.polyline(data.route, { color: '#b3242a', weight: 2.5, dashArray: '6 7', opacity: .65 }).addTo(g);
      data.cities.forEach(c => {
        L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="background:#fff;color:${c.color};border:2px solid ${c.color};font-weight:800;font-size:11.5px;padding:2px 9px;border-radius:10px;white-space:nowrap;box-shadow:0 1px 5px rgba(0,0,0,.3)">${c.name}</div>`,
            iconAnchor: [30, -10],
          }),
        }).addTo(g);
      });
    }
    if (pts.length) {
      map.fitBounds(L.latLngBounds(pts.map(p => [p.lat, p.lng] as [number, number])).pad(0.15));
    }
    setTimeout(() => map.invalidateSize(), 100);
  }

  function panTo(lat: number, lng: number) {
    mapRef.current?.setView([lat, lng], 14);
    divRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const byCity: Record<string, typeof pois> = {};
  pois.forEach(p => { (byCity[p.city] = byCity[p.city] || []).push(p); });

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip on={filter === 'all'} onClick={() => setFilter('all')}>Tudo</Chip>
        {data.cities.map(c => (
          <Chip key={c.id} on={filter === c.id} color={c.color} onClick={() => setFilter(c.id)}>{c.name}</Chip>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div>
          <div ref={divRef} className="h-[46vh] lg:h-[62vh] min-h-[320px] rounded-2xl border border-inkline z-0" />
          <p className="text-[11.5px] text-zinc-400 mt-1.5">
            📶 As imagens do mapa precisam de internet · a lista ao lado funciona offline (e na versão exportada).
          </p>
        </div>
        <Card className="lg:max-h-[62vh] lg:overflow-y-auto">
          <h3 className="font-bold text-[14px] mb-1">📍 Locais do roteiro</h3>
          {data.cities.filter(c => byCity[c.id]).map(c => (
            <div key={c.id}>
              <div className="font-extrabold text-[13px] mt-3 mb-1" style={{ color: c.color }}>{c.name}</div>
              {byCity[c.id].map((p, i) => (
                <button key={i} onClick={() => panTo(p.lat, p.lng)}
                  className="w-full text-left flex gap-2.5 items-start py-1.5 border-t border-inkline hover:bg-paper transition cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: c.color }} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold leading-snug">{p.name}</span>
                    <span className="block text-[11.5px] text-zinc-400">
                      {p.date ? fmtD(p.date) + ' — ' : ''}{p.note}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
