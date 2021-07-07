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
    this.depthTarget = new THREE.WebGLRenderTarget();
    this.depthTarget.texture.generateMipmaps = false;
    this.depthTarget.depthBuffer = false;
  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
    if (readBuffer.depthTexture) {
      const size = new THREE.Vector2();
      renderer.getSize(size);
      this.depthTarget.setSize(size.x, size.y);

      // Pack depth to RGBA
      this.packDepth.material.uniforms.tDepth.value = readBuffer.depthTexture;
      this.packDepth.render(renderer, this.depthTarget, null);

      // Pass through
      this.passThrough.renderToScreen = this.renderToScreen;
      this.passThrough.render(renderer, writeBuffer, readBuffer);

      // Visualize depth buffer
      const oldViewport = writeBuffer.viewport;
      const oldAutoclear = renderer.autoClear;
      renderer.autoClear = false;

      writeBuffer.viewport = new THREE.Vector4(
        0,
        0,
        400,
        (size.y / size.x) * 400
      );
      this.passThrough.render(renderer, writeBuffer, this.depthTarget);

      writeBuffer.viewport = oldViewport;
      renderer.autoClear = oldAutoclear;
    } else if (this.renderToScreen) {
      this.passThrough.renderToScreen = true;
      this.passThrough.render(...arguments);
    }
  }
}
