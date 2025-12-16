import { ParcelsM00Layer } from './parcels-m00.js';
import { ParcelsM01Layer } from './parcels-m01.js';
import { ParcelsM02Layer } from './parcels-m02.js';
import { ParcelsM03Layer } from './parcels-m03.js';
import { ParcelsM04Layer } from './parcels-m04.js';
import { ParcelsM05Layer } from './parcels-m05.js';
import { ParcelsM06Layer } from './parcels-m06.js';
import { ParcelsM07Layer } from './parcels-m07.js';
import { ParcelsM08Layer } from './parcels-m08.js';
import { ParcelsM09Layer } from './parcels-m09.js';
import { ParcelsM10Layer } from './parcels-m10.js';
import { ParcelsM99Layer } from './parcels-m99.js';
import { InventarioAssetsLayer } from './inventario-assets.js';
import { ParcelsLayers } from './parcels-layers.js';

export function initializeLayers() {
  const parcelM00 = new ParcelsM00Layer();
  const parcelM01 = new ParcelsM01Layer();
  const parcelM02 = new ParcelsM02Layer();
  const parcelM03 = new ParcelsM03Layer();
  const parcelM04 = new ParcelsM04Layer();
  const parcelM05 = new ParcelsM05Layer();
  const parcelM06 = new ParcelsM06Layer();
  const parcelM07 = new ParcelsM07Layer();
  const parcelM08 = new ParcelsM08Layer();
  const parcelM09 = new ParcelsM09Layer();
  const parcelM10 = new ParcelsM10Layer();
  const parcelM99 = new ParcelsM99Layer();

  const parcelLayerInstances = [
    parcelM00,
    parcelM01,
    parcelM02,
    parcelM03,
    parcelM04,
    parcelM05,
    parcelM06,
    parcelM07,
    parcelM08,
    parcelM09,
    parcelM10,
    parcelM99
  ];

  return {
    'inventario-assets': new InventarioAssetsLayer(),
    parcels: new ParcelsLayers(parcelLayerInstances),
    'parcels-m00': parcelM00,
    'parcels-m01': parcelM01,
    'parcels-m02': parcelM02,
    'parcels-m03': parcelM03,
    'parcels-m04': parcelM04,
    'parcels-m05': parcelM05,
    'parcels-m06': parcelM06,
    'parcels-m07': parcelM07,
    'parcels-m08': parcelM08,
    'parcels-m09': parcelM09,
    'parcels-m10': parcelM10,
    'parcels-m99': parcelM99
  };
}
