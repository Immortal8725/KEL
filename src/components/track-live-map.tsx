"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { FieldCrew, GeoPoint, MasterIncident, User } from "@/lib/types";
import { distanceMetres, etaMinutes, formatKm } from "@/lib/geo";

export function TrackLiveMap({
  incident,
  crew,
  technicianName,
}: {
  incident: MasterIncident;
  crew: FieldCrew;
  technicianName: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  const remaining = distanceMetres(crew.location, incident.location);
  const eta = etaMinutes(remaining);
  const arrived = remaining < 90 || crew.status === "on_site";

  const signature = useMemo(
    () =>
      JSON.stringify({
        van: crew.location,
        house: incident.location,
        status: crew.status,
      }),
    [crew.location, incident.location, crew.status],
  );

  useEffect(() => {
    let cancelled = false;
    const el = elRef.current;
    if (!el) return;

    async function mount() {
      const L = await import("leaflet");
      if (cancelled || !el || mapRef.current) return;
      const map = L.map(el, {
        zoomControl: false,
        attributionControl: true,
      }).setView([incident.location.lat, incident.location.lon], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        className: "gridpulse-basemap",
      }).addTo(map);
      layersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());
      setReady(true);
    }

    mount();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    import("leaflet").then((L) => {
      if (!active || !mapRef.current || !layersRef.current) return;
      const group = layersRef.current;
      const map = mapRef.current;
      group.clearLayers();

      const house: [number, number] = [incident.location.lat, incident.location.lon];
      const van: [number, number] = [crew.location.lat, crew.location.lon];

      group.addLayer(
        L.polyline([van, house], {
          color: "#3dd6a0",
          weight: 4,
          dashArray: "8 10",
          opacity: 0.85,
        }),
      );

      const houseIcon = L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;border-radius:4px;background:#e24b4b;border:2px solid #fff;box-shadow:0 0 10px #e24b4b"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      group.addLayer(
        L.marker(house, { icon: houseIcon }).bindTooltip("Your house / meter"),
      );

      const vanIcon = L.divIcon({
        className: "",
        html: `<div style="display:flex;flex-direction:column;align-items:center">
          <div style="width:16px;height:16px;border-radius:99px;background:#5ec8ff;border:2px solid #fff;box-shadow:0 0 14px #5ec8ff"></div>
          <div style="margin-top:3px;font:11px/1 ui-sans-serif;color:#071016;background:#5ec8ff;padding:2px 6px;border-radius:99px;font-weight:700;white-space:nowrap">Tech</div>
        </div>`,
        iconSize: [72, 36],
        iconAnchor: [36, 10],
      });
      group.addLayer(
        L.marker(van, { icon: vanIcon }).bindTooltip(
          `${technicianName} · ${crew.callsign}`,
        ),
      );

      map.fitBounds(L.latLngBounds([van, house]).pad(0.35));
    });
    return () => {
      active = false;
    };
  }, [signature, incident.location, crew.location, crew.callsign, technicianName, ready]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div ref={elRef} className="h-56 w-full md:h-72" />
      <div className="bg-card flex items-start justify-between gap-3 px-3 py-2">
        <div>
          <div className="text-[10px] tracking-wide text-primary uppercase">
            {arrived ? "Technician at your meter" : "Live technician tracking"}
          </div>
          <div className="text-sm font-medium">
            {technicianName} · {crew.callsign}
          </div>
          <div className="text-muted-foreground text-xs">
            {crew.vehicleReg} · {crew.status.replaceAll("_", " ")}
          </div>
        </div>
        <div className="text-right">
          <div className="tabular text-lg font-semibold text-primary">
            {arrived ? "Now" : `${eta} min`}
          </div>
          <div className="text-muted-foreground text-[11px]">
            {arrived ? "Arrived" : formatKm(remaining)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function technicianNameForCrew(crew: FieldCrew, users: User[]): string {
  return users.find((u) => u.id === crew.userId)?.fullName ?? crew.callsign;
}

export function remainingTo(crew: FieldCrew, point: GeoPoint) {
  return distanceMetres(crew.location, point);
}
