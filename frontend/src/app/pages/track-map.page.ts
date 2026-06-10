import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  busOutline,
  locateOutline,
  locationOutline,
  searchOutline
} from 'ionicons/icons';
import * as L from 'leaflet';
import { ApiService, Bus, PickupPoint } from '../core/api.service';

@Component({
  standalone: true,
  imports: [FormsModule, IonContent, IonIcon],
  template: `
    <ion-content class="track-content">
      <main class="track-page">
        <section class="tracking-hero">
          <div class="hero-copy">
            <h1>Track <span>Bus</span></h1>
            <b aria-hidden="true"></b>
            <div class="hero-subtitle">
              <span><ion-icon name="location-outline" /></span>
              <p>Live OpenStreetMap view<br>with bus locations</p>
            </div>
            <div class="hero-bus" aria-hidden="true"></div>
          </div>

          <div class="map-panel">
            <label class="map-search">
              <ion-icon name="search-outline" />
              <input
                type="search"
                placeholder="Search location or bus..."
                [(ngModel)]="searchTerm"
                (keyup.enter)="searchMap()">
            </label>

            <div class="map-controls">
              <button type="button" aria-label="Zoom in" (click)="zoomIn()">+</button>
              <button type="button" aria-label="Zoom out" (click)="zoomOut()">−</button>
              <button type="button" aria-label="Find my location" (click)="locateMe()">
                <ion-icon name="locate-outline" />
              </button>
            </div>

            <div #mapContainer class="map-canvas" [class.tile-error]="tileError">
              @if (tileError) {
                <div class="map-warning">Map tiles need internet. Live bus markers are still available.</div>
              }
            </div>
          </div>
        </section>

        <section class="bus-panel">
          <div class="bus-heading">
            <span><ion-icon name="bus-outline" /></span>
            <div><h2>Buses</h2><i></i></div>
          </div>

          <div class="bus-list">
            @for (bus of buses; track bus.id) {
              <button
                type="button"
                class="bus-row"
                [class.selected]="selectedBusId === bus.id"
                [style.--bus-accent]="colorHex(bus.color)"
                (click)="focusBus(bus)">
                <span class="color-letter" [class.light]="isLightColor(bus.color)">{{ bus.color[0] }}</span>

                <span class="bus-copy">
                  <strong>{{ bus.plate_number }}</strong>
                  <small>{{ bus.color }} bus - capacity {{ bus.capacity }}</small>
                  <em><ion-icon name="bus-outline" /> {{ bus.capacity }} Seats</em>
                </span>

                <span class="bus-thumbnail" [class]="busImageClass(bus.color)" aria-hidden="true"></span>

                <span class="route-status" [class.idle]="bus.status !== 'on_route'">
                  <i></i>{{ bus.status === 'on_route' ? 'On Route' : 'Idle' }}
                </span>

                <span class="row-arrow"><ion-icon name="arrow-forward-outline" /></span>
              </button>
            } @empty {
              <div class="empty-state">No buses are available.</div>
            }
          </div>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .track-content { --background: #032760; }
    .track-page {
      min-height: 100%;
      padding-bottom: 112px;
      color: #fff;
      overflow: hidden;
      background:
        radial-gradient(circle at 10% 20%, rgba(17,98,220,.18), transparent 25%),
        linear-gradient(160deg, #00173d 0%, #032a68 58%, #0759d8 100%);
    }
    a { color: inherit; text-decoration: none; }
    h1, h2, p { margin: 0; }

    .tracking-hero {
      max-width: 1440px;
      min-height: 660px;
      display: grid;
      grid-template-columns: 42% 58%;
      margin: 0 auto;
    }
    .hero-copy {
      position: relative;
      min-height: 660px;
      padding: 78px 30px 0 54px;
      overflow: hidden;
      background:
        radial-gradient(circle at 12% 12%, rgba(31,112,235,.18), transparent 24%),
        linear-gradient(180deg, rgba(1,22,57,.15), rgba(1,20,51,.2));
    }
    .hero-copy h1 { position: relative; z-index: 2; font-size: clamp(58px, 6vw, 86px); font-weight: 850; letter-spacing: -.04em; }
    .hero-copy h1 span { color: #0878ff; }
    .hero-copy > b {
      position: relative;
      z-index: 2;
      display: block;
      width: 54px;
      height: 5px;
      margin: 26px 0 30px;
      border-radius: 5px;
      background: #1689ff;
    }
    .hero-subtitle { position: relative; z-index: 2; display: flex; align-items: center; gap: 18px; }
    .hero-subtitle > span {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 14px;
      background: linear-gradient(145deg, #0b66d6, #073b9b);
      font-size: 34px;
    }
    .hero-subtitle p { color: #c8d3e5; font-size: 20px; line-height: 1.45; }
    .hero-bus {
      position: absolute;
      left: -18%;
      right: -8%;
      bottom: -2px;
      height: 420px;
      background: url('/assets/student-dashboard-bus.png') 70% 63% / 162% auto no-repeat;
      filter: drop-shadow(0 24px 28px rgba(0,8,30,.35));
    }

    .map-panel {
      position: relative;
      min-width: 0;
      min-height: 660px;
      overflow: hidden;
      border: 10px solid #0b63ea;
      border-right: 0;
      border-radius: 90px 26px 26px 90px;
      background: #dce7ef;
      box-shadow: -18px 8px 48px rgba(0,15,50,.25);
    }
    .map-canvas { position: absolute; inset: 0; z-index: 1; background: #dfe9ef; }
    .map-search {
      position: absolute;
      z-index: 500;
      top: 22px;
      left: 72px;
      width: min(320px, calc(100% - 170px));
      height: 54px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 18px;
      border-radius: 14px;
      background: rgba(255,255,255,.95);
      box-shadow: 0 10px 26px rgba(23,48,85,.14);
      color: #8795ac;
    }
    .map-search ion-icon { flex: 0 0 auto; font-size: 24px; }
    .map-search input {
      width: 100%;
      min-width: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: #15284c;
      font: inherit;
      font-size: 16px;
    }
    .map-controls {
      position: absolute;
      z-index: 500;
      top: 22px;
      right: 18px;
      display: grid;
      overflow: hidden;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 10px 26px rgba(23,48,85,.14);
    }
    .map-controls button {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border: 0;
      border-bottom: 1px solid #e3e9f1;
      background: #fff;
      color: #102850;
      font-size: 28px;
      cursor: pointer;
    }
    .map-controls button:last-child { border-bottom: 0; font-size: 23px; }
    .tile-error {
      background-image:
        linear-gradient(#cbd7df 1px, transparent 1px),
        linear-gradient(90deg, #cbd7df 1px, transparent 1px);
      background-size: 48px 48px;
    }
    .map-warning {
      position: absolute;
      left: 20px;
      right: 20px;
      bottom: 20px;
      z-index: 500;
      padding: 12px 15px;
      border-radius: 13px;
      color: #47566e;
      background: rgba(255,255,255,.95);
      font-weight: 750;
    }
    :host ::ng-deep .leaflet-control-attribution { font-size: 10px; }
    :host ::ng-deep .pickup-dot {
      width: 14px !important;
      height: 14px !important;
      margin: -7px 0 0 -7px !important;
      border: 3px solid rgba(255,255,255,.85);
      border-radius: 50%;
      background: #7397ca;
      box-shadow: 0 3px 8px rgba(0,35,90,.3);
    }
    :host ::ng-deep .bus-map-marker { background: none; border: 0; }
    :host ::ng-deep .bus-pin {
      position: relative;
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border: 4px solid #fff;
      border-radius: 50% 50% 50% 8px;
      background: var(--marker-color, #0a6ee8);
      color: #071a3d;
      box-shadow: 0 7px 15px rgba(0,26,74,.28);
      transform: rotate(-45deg);
      font-size: 23px;
    }
    :host ::ng-deep .bus-pin span { transform: rotate(45deg); }
    :host ::ng-deep .bus-tooltip {
      border: 0;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0,26,74,.18);
      color: #10234b;
      font-size: 14px;
      font-weight: 850;
    }

    .bus-panel {
      position: relative;
      z-index: 3;
      max-width: 1380px;
      margin: -14px auto 0;
      padding: 24px 34px 32px;
      border-radius: 16px;
      background: rgba(255,255,255,.98);
      color: #071d4d;
      box-shadow: 0 10px 30px rgba(0,17,54,.2);
    }
    .bus-heading { display: flex; align-items: center; gap: 18px; margin-bottom: 18px; }
    .bus-heading > span {
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      color: #fff;
      background: linear-gradient(145deg, #0b75ed, #073fc4);
      font-size: 31px;
    }
    .bus-heading h2 { font-size: 28px; }
    .bus-heading i { display: block; width: 42px; height: 4px; margin-top: 9px; border-radius: 4px; background: #137eff; }
    .bus-list { display: grid; gap: 8px; }
    .bus-row {
      --bus-accent: #176bd8;
      position: relative;
      width: 100%;
      min-height: 102px;
      display: grid;
      grid-template-columns: 90px minmax(220px, 1fr) 280px 120px 52px;
      align-items: center;
      gap: 22px;
      padding: 14px 18px 14px 30px;
      overflow: hidden;
      border: 0;
      border-radius: 10px;
      background: linear-gradient(90deg, #f7faff, #f2f6fc);
      color: #071d4d;
      text-align: left;
      cursor: pointer;
    }
    .bus-row::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 7px;
      border-radius: 7px;
      background: var(--bus-accent);
    }
    .bus-row:hover, .bus-row.selected { background: #eef5ff; }
    .color-letter {
      width: 84px;
      height: 84px;
      display: grid;
      place-items: center;
      border-radius: 22px;
      color: #fff;
      background: var(--bus-accent);
      font-size: 42px;
      font-weight: 850;
    }
    .color-letter.light { color: #30384a; }
    .bus-copy { display: block; min-width: 0; }
    .bus-copy strong { display: block; font-size: 29px; line-height: 1.1; }
    .bus-copy small { display: block; margin-top: 7px; color: #51617c; font-size: 18px; }
    .bus-copy em {
      width: fit-content;
      display: flex;
      align-items: center;
      gap: 7px;
      margin-top: 9px;
      padding: 6px 12px;
      border: 1px solid color-mix(in srgb, var(--bus-accent) 38%, white);
      border-radius: 12px;
      color: var(--bus-accent);
      font-size: 14px;
      font-style: normal;
      font-weight: 750;
    }
    .bus-thumbnail {
      height: 100px;
      display: block;
      background: url('/assets/student-dashboard-bus.png') 73% 55% / 190% auto no-repeat;
      filter: drop-shadow(0 10px 9px rgba(5,35,85,.16));
    }
    .bus-thumbnail.white { filter: grayscale(1) brightness(1.65) contrast(.68) drop-shadow(0 10px 9px rgba(5,35,85,.14)); }
    .bus-thumbnail.yellow { filter: sepia(1) saturate(5) hue-rotate(350deg) brightness(1.18) drop-shadow(0 10px 9px rgba(80,58,0,.16)); }
    .route-status {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      color: #079450;
      background: #e2f8ec;
      font-size: 14px;
      font-weight: 800;
      white-space: nowrap;
    }
    .route-status i { width: 11px; height: 11px; border-radius: 50%; background: #0ab765; }
    .route-status.idle { color: #69758a; background: #e9edf3; }
    .route-status.idle i { background: #8b98aa; }
    .row-arrow {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #0873e0;
      background: #e7f0ff;
      font-size: 27px;
    }
    .empty-state { padding: 34px; border-radius: 18px; background: #f2f6fc; color: #65738a; text-align: center; }

    @media (max-width: 1050px) {
      .tracking-hero { grid-template-columns: 40% 60%; }
      .hero-copy { padding-left: 36px; }
      .bus-row { grid-template-columns: 74px minmax(200px, 1fr) 220px 110px 46px; gap: 14px; }
      .color-letter { width: 70px; height: 70px; }
    }

    @media (max-width: 820px) {
      .tracking-hero { display: block; min-height: 0; }
      .hero-copy { min-height: 480px; padding: 52px 24px 0; }
      .hero-copy h1 { font-size: 56px; }
      .hero-bus { left: -25%; right: -25%; height: 330px; background-size: 170% auto; }
      .map-panel { min-height: 480px; margin: -30px 14px 0; border: 7px solid #0b63ea; border-radius: 38px; }
      .map-search { left: 18px; width: calc(100% - 94px); }
      .bus-panel { margin: 18px 14px 0; padding: 22px 18px; }
      .bus-row { grid-template-columns: 64px 1fr 44px; min-height: 110px; padding: 16px 12px 16px 22px; }
      .color-letter { width: 58px; height: 58px; border-radius: 16px; font-size: 29px; }
      .bus-copy strong { font-size: 21px; }
      .bus-copy small { font-size: 14px; }
      .bus-thumbnail, .route-status { display: none; }
    }

    @media (max-width: 480px) {
      .track-page { padding-bottom: 94px; }
      .hero-copy { min-height: 430px; padding-top: 40px; }
      .hero-copy h1 { font-size: 48px; }
      .hero-copy > b { margin: 18px 0 22px; }
      .hero-subtitle p { font-size: 17px; }
      .hero-subtitle > span { width: 50px; height: 50px; font-size: 28px; }
      .hero-bus { height: 285px; background-size: 178% auto; }
      .map-panel { min-height: 410px; margin-top: -22px; border-radius: 28px; }
      .map-search { top: 14px; left: 14px; height: 48px; }
      .map-controls { top: 14px; right: 12px; }
      .map-controls button { width: 42px; height: 42px; }
      .bus-heading h2 { font-size: 24px; }
      .bus-heading > span { width: 48px; height: 48px; font-size: 26px; }
      .bus-row { grid-template-columns: 54px 1fr 40px; gap: 11px; }
      .color-letter { width: 50px; height: 50px; font-size: 25px; }
      .bus-copy strong { font-size: 18px; }
      .bus-copy small { font-size: 12px; }
      .bus-copy em { padding: 4px 8px; font-size: 11px; }
      .row-arrow { width: 38px; height: 38px; font-size: 22px; }
    }
  `]
})
export class TrackMapPage implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapEl!: ElementRef<HTMLElement>;
  buses: Bus[] = [];
  points: PickupPoint[] = [];
  tileError = false;
  searchTerm = '';
  selectedBusId = '';
  private map?: any;
  private busMarkers = new Map<string, any>();
  private locationMarker?: any;

  constructor(private api: ApiService) {
    addIcons({
      arrowForwardOutline,
      busOutline,
      locateOutline,
      locationOutline,
      searchOutline
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 80);
  }

  ionViewDidEnter() {
    setTimeout(() => this.map?.invalidateSize(), 80);
  }

  ngOnDestroy() {
    this.api.realtime().off('bus:gps');
    this.map?.remove();
  }

  zoomIn() {
    this.map?.zoomIn();
  }

  zoomOut() {
    this.map?.zoomOut();
  }

  locateMe() {
    if (!navigator.geolocation || !this.map) return;
    navigator.geolocation.getCurrentPosition(position => {
      const latLng = L.latLng(position.coords.latitude, position.coords.longitude);
      if (!this.locationMarker) {
        this.locationMarker = L.circleMarker(latLng, {
          radius: 9,
          color: '#fff',
          weight: 3,
          fillColor: '#116fe5',
          fillOpacity: 1
        }).bindTooltip('Your location').addTo(this.map!);
      } else {
        this.locationMarker.setLatLng(latLng);
      }
      this.map?.setView(latLng, 15);
    });
  }

  searchMap() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term || !this.map) return;

    const bus = this.buses.find(item =>
      item.plate_number.toLowerCase().includes(term)
      || item.color.toLowerCase().includes(term)
    );
    if (bus) {
      this.focusBus(bus);
      return;
    }

    const point = this.points.find(item => item.name.toLowerCase().includes(term));
    if (point) this.map.setView([Number(point.latitude), Number(point.longitude)], 15);
  }

  focusBus(bus: Bus) {
    this.selectedBusId = bus.id;
    const marker = this.busMarkers.get(bus.id);
    if (marker && this.map) {
      this.map.setView(marker.getLatLng(), 15);
      marker.openTooltip();
    }
  }

  colorHex(color: string) {
    const colors: Record<string, string> = {
      blue: '#0969ee',
      white: '#d8e0ec',
      yellow: '#ffbb08',
      red: '#dc3c3c',
      black: '#263247'
    };
    return colors[color.toLowerCase()] || '#0969ee';
  }

  isLightColor(color: string) {
    return ['white', 'yellow'].includes(color.toLowerCase());
  }

  busImageClass(color: string) {
    return `bus-thumbnail ${color.toLowerCase()}`;
  }

  private initMap() {
    if (this.map) return;
    this.map = L.map(this.mapEl.nativeElement, {
      zoomControl: false,
      attributionControl: true
    }).setView([3.866, 11.513], 13);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Leaflet | OpenStreetMap',
      maxZoom: 19
    });
    tiles.on('tileerror', () => this.tileError = true);
    tiles.addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 250);
    this.api.bootstrap().subscribe(data => {
      this.buses = data.buses;
      this.points = data.pickupPoints;

      this.points.forEach(point => {
        L.marker([Number(point.latitude), Number(point.longitude)], {
          icon: L.divIcon({ className: 'pickup-dot', iconSize: [14, 14] })
        }).bindTooltip(point.name, { direction: 'top' }).addTo(this.map!);
      });

      this.buses.forEach(bus => this.upsertBus(bus));
    });

    this.api.realtime().on('bus:gps', (bus: Bus) => {
      const index = this.buses.findIndex(item => item.id === bus.id);
      if (index >= 0) this.buses[index] = { ...this.buses[index], ...bus };
      this.upsertBus(bus);
    });
  }

  private upsertBus(bus: Bus) {
    if (!bus.last_lat || !bus.last_lng || !this.map) return;
    const pos = [Number(bus.last_lat), Number(bus.last_lng)] as [number, number];
    let marker = this.busMarkers.get(bus.id);

    if (!marker) {
      const markerColor = this.colorHex(bus.color);
      marker = L.marker(pos, {
        icon: L.divIcon({
          className: 'bus-map-marker',
          html: `<div class="bus-pin" style="--marker-color:${markerColor}"><span>&#128652;</span></div>`,
          iconSize: [48, 58],
          iconAnchor: [24, 48],
          tooltipAnchor: [30, -22]
        })
      }).bindTooltip(bus.plate_number, {
        permanent: true,
        direction: 'right',
        className: 'bus-tooltip'
      }).addTo(this.map);
      this.busMarkers.set(bus.id, marker);
    } else {
      marker.setLatLng(pos);
    }
  }
}
