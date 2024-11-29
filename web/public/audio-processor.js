class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.isPlaying = false;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channelData = this.buffer.shift();

    if (channelData) {
      for (let channel = 0; channel < output.length; channel++) {
        output[channel].set(channelData);
      }
      this.isPlaying = true;
    } else if (this.isPlaying) {
      this.isPlaying = false;
      this.port.postMessage({ type: 'done' });
    }

    return true;
  }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);
