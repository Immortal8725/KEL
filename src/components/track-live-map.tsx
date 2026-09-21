"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { FieldCrew, GeoPoint, User } from "@/lib/types";
import { distanceMetres, etaMinutes, formatKm } from "@/lib/geo";

export type TrackPerspective = "resident" | "technician" | "inspector";

export function TrackLiveMap({
  incident,
  crew,
  technicianName,
  perspective = "resident",
}: {
  incident: { location: GeoPoint; address: string };
  crew: FieldCrew;
  technicianName: string;
  perspective?: TrackPerspective;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  const remaining = distanceMetres(crew.location, incident.location);
  const eta = etaMinutes(remaining);
  const arrived = remaining < 90 || crew.status === "on_site";
  const field = perspective === "technician" || perspective === "inspector";
  const pinYou = field ? "You" : "Tech";
  const pinJob = perspective === "inspector" ? "Audit" : field ? "Job" : null;
  const heading = field
    ? arrived
      ? "You are at the meter"
      : perspective === "inspector"
        ? "Route to the audit"
        : "Route to the job"
    : arrived
      ? "Crew at the meter"
      : "Live crew tracking";
  const navigateLabel = arrived
    ? "Open pin in Maps"
    : perspective === "inspector"
      ? "Navigate to this audit"
      : "Navigate to this job";

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
      if (cancelled || !el) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      delete (el as HTMLDivElement & { _leaflet_id?: number })._leaflet_id;

      const map = L.map(el, {
        zoomControl: true,
        attributionControl: true,
      }).setView([incident.location.lat, incident.location.lon], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        className: "electroraid-basemap",
      }).addTo(map);
      layersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());
      setReady(true);
    }

    mount();
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize());
    ro.observe(el);
    return () => {
      cancelled = true;
      ro.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
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
        html: pinJob
          ? `<div style="display:flex;flex-direction:column;align-items:center">
          <div style="width:18px;height:18px;border-radius:4px;background:#e24b4b;border:2px solid #fff;box-shadow:0 0 10px #e24b4b"></div>
          <div style="margin-top:3px;font:11px/1 ui-sans-serif;color:#fff;background:#e24b4b;padding:2px 6px;border-radius:99px;font-weight:700;white-space:nowrap">${pinJob}</div>
        </div>`
          : `<div style="width:18px;height:18px;border-radius:4px;background:#e24b4b;border:2px solid #fff;box-shadow:0 0 10px #e24b4b"></div>`,
        iconSize: pinJob ? [72, 36] : [18, 18],
        iconAnchor: pinJob ? [36, 10] : [9, 9],
      });
      group.addLayer(
        L.marker(house, { icon: houseIcon }).bindTooltip(
          pinJob === "Audit"
            ? "Audit destination"
            : pinJob
              ? "Job destination"
              : "Your house / meter",
        ),
      );

      const vanIcon = L.divIcon({
        className: "",
        html: `<div style="display:flex;flex-direction:column;align-items:center">
          <div style="width:16px;height:16px;border-radius:99px;background:#5ec8ff;border:2px solid #fff;box-shadow:0 0 14px #5ec8ff"></div>
          <div style="margin-top:3px;font:11px/1 ui-sans-serif;color:#071016;background:#5ec8ff;padding:2px 6px;border-radius:99px;font-weight:700;white-space:nowrap">${pinYou}</div>
        </div>`,
        iconSize: [72, 36],
        iconAnchor: [36, 10],
      });
      group.addLayer(
        L.marker(van, { icon: vanIcon }).bindTooltip(
          field ? `You · ${crew.callsign}` : `${technicianName} · ${crew.callsign}`,
        ),
      );

      map.fitBounds(L.latLngBounds([van, house]).pad(0.35));
    });
    return () => {
      active = false;
    };
  }, [
    signature,
    incident.location,
    crew.location,
    crew.callsign,
    technicianName,
    ready,
    perspective,
    pinJob,
    pinYou,
    field,
  ]);

  const maps = navigateUrl(crew.location, incident.location);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        ref={elRef}
        className="h-64 w-full md:h-80"
        style={{ minHeight: 256 }}
      />
      <div className="bg-card flex items-start justify-between gap-3 px-3 py-2">
        <div>
          <div className="text-[10px] tracking-wide text-primary uppercase">
            {heading}
          </div>
          <div className="text-sm font-medium">
            {field ? incident.address : `${technicianName} · ${crew.callsign}`}
          </div>
          <div className="text-muted-foreground text-xs">
            {field
              ? `${crew.callsign} · ${crew.vehicleReg}`
              : `${crew.vehicleReg} · ${crew.status.replaceAll("_", " ")}`}
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
      {field ? (
        <a
          href={maps}
          target="_blank"
          rel="noreferrer"
          className="bg-primary text-primary-foreground block px-3 py-2.5 text-center text-sm font-medium"
        >
          {navigateLabel}
        </a>
      ) : null}
    </div>
  );
}

export function navigateUrl(from: GeoPoint, to: GeoPoint) {
  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lon}&destination=${to.lat},${to.lon}&travelmode=driving`;
}

export function technicianNameForCrew(crew: FieldCrew, users: User[]): string {
  return users.find((u) => u.id === crew.userId)?.fullName ?? crew.callsign;
}

export function remainingTo(crew: FieldCrew, point: GeoPoint) {
  return distanceMetres(crew.location, point);
}
