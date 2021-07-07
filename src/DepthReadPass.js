import { Pass, ShaderPass } from "/lib/postprocessing.js";
import { CopyShader } from "/lib/shaders.js";
import * as THREE from "/lib/three.js";

const PackDepthShader = {
  uniforms: {
    tDepth: { value: null },
  },

  vertexShader: /* glsl */ `
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

  fragmentShader: /* glsl */ `
    #include <packing>

		uniform sampler2D tDepth;
		varying vec2 vUv;

		void main() {
      float fragCoordZ = texture2D( tDepth, vUv ).x;
      gl_FragColor = packDepthToRGBA( fragCoordZ );
		}`,
};

export default class extends Pass {
  constructor() {
    super();
    this.passThrough = new ShaderPass(CopyShader);
    this.packDepth = new ShaderPass(PackDepthShader);
  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
    if (readBuffer.depthTexture) {
      const size = new THREE.Vector2();
      renderer.getSize(size);
      const depthTarget = new THREE.WebGLRenderTarget(size.x, size.y);
      depthTarget.texture.generateMipmaps = false;
      depthTarget.depthBuffer = false;

      this.packDepth.material.uniforms.tDepth.value = readBuffer.depthTexture;
      this.packDepth.render(renderer, depthTarget, null);

      this.passThrough.renderToScreen = this.renderToScreen;
      this.passThrough.render(renderer, writeBuffer, depthTarget);

      depthTarget.dispose();
    } else if (this.renderToScreen) {
      this.passThrough.renderToScreen = true;
      this.passThrough.render(...arguments);
    }
  }
}
