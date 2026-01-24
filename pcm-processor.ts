/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class PcmProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const pcmData = input[0];
      // 메인 스레드로 PCM 데이터 전송
      this.port.postMessage(pcmData);
    }
    return true;
  }
}

registerProcessor('pcm-processor', PcmProcessor);
