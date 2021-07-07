import { Pass, ShaderPass } from "/lib/postprocessing.js";
import { CopyShader } from "/lib/shaders.js";
import * as THREE from "/lib/three.js";

const UnpackDownscale = 255 / 256; // 0..1 -> fraction (excluding 1)
const PackFactors = new THREE.Vector3(256 * 256 * 256, 256 * 256, 256);
const UnpackFactors = new THREE.Vector4(
  UnpackDownscale / PackFactors.x,
  UnpackDownscale / PackFactors.y,
  UnpackDownscale / PackFactors.z,
  UnpackDownscale / 1
);

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
  constructor({ visualize }) {
    super();
    this.visualize = visualize;
    this.passThrough = new ShaderPass(CopyShader);
    this.packDepth = new ShaderPass(PackDepthShader);
    this.depthTarget = new THREE.WebGLRenderTarget();
    this.depthTarget.texture.generateMipmaps = false;
    this.depthTarget.depthBuffer = false;
  }

  readDepth(x, y) {
    const pixelBuffer = new Uint8Array(4);
    const pixelRatio = this.renderer.getPixelRatio();
    this.renderer.readRenderTargetPixels(
      this.depthTarget,
      x * pixelRatio,
      this.depthTarget.height - y * pixelRatio - 1,
      1,
      1,
      pixelBuffer
    );

    return this.unpackRGBAToDepth(pixelBuffer);
  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
    this.needsSwap = false;
    this.renderer = renderer;

    if (readBuffer.depthTexture) {
      const size = new THREE.Vector2();
      renderer.getDrawingBufferSize(size);
      this.depthTarget.setSize(size.x, size.y);

      // Pack depth to RGBA
      this.packDepth.material.uniforms.tDepth.value = readBuffer.depthTexture;
      this.packDepth.render(renderer, this.depthTarget, null);

      // Visualize depth buffer
      if (this.visualize) {
        this.needsSwap = true;
        // Render original scene
        this.passThrough.renderToScreen = this.renderToScreen;
        this.passThrough.render(renderer, writeBuffer, readBuffer);

        // Visualize depth buffer in small window
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
    } else if (this.renderToScreen) {
      this.passThrough.renderToScreen = true;
      this.passThrough.render(...arguments);
    }
  }

  unpackRGBAToDepth(buffer) {
    return new THREE.Vector4()
      .fromArray(buffer)
      .multiplyScalar(1 / 255)
      .dot(UnpackFactors);
  }
}
