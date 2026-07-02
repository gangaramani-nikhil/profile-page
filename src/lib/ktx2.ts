import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import type { WebGLRenderer } from 'three';

/**
 * Asset policy: every 3D texture/model added to this site MUST ship as KTX2
 * (Basis Universal) so it transcodes directly to a GPU-native compressed
 * format instead of inflating to raw RGBA in memory.
 *
 * The current scenes are fully procedural (no texture fetches), but any
 * future `useLoader(KTX2Loader, …)` call should go through this factory so
 * the transcoder path + renderer support detection stay in one place.
 * Drop the Basis transcoder files into /public/basis/ when first needed.
 */
let loader: KTX2Loader | null = null;

export function getKTX2Loader(renderer: WebGLRenderer): KTX2Loader {
  if (!loader) {
    loader = new KTX2Loader().setTranscoderPath('/basis/');
  }
  return loader.detectSupport(renderer);
}
