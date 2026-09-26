/**
 * Utility to generate a valid WAV audio file buffer with synthetic sine tone or silence.
 * Useful for mock TTS and testing audio players without calling paid APIs.
 */
export function createWavBuffer(durationSeconds = 2, sampleRate = 24000, frequency = 440): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write sine wave samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Gentle lullaby-like tone decaying gently
    const amplitude = 8000 * Math.exp(-t / 3);
    const sample = Math.round(amplitude * Math.sin(2 * Math.PI * frequency * t));
    buffer.writeInt16LE(sample, 44 + i * 2);
  }

  return buffer;
}
