import { TTSProvider, TTSRequest, TTSResult } from "../../../types/providers.js";
import { createWavBuffer } from "../../../utils/audioHelper.js";

export class MockTTSProvider implements TTSProvider {
  public readonly name = "mock";

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    const totalWords = input.segments.reduce((acc, seg) => acc + seg.text.split(" ").length, 0);
    // Estimate 2.5 words per second
    const durationSeconds = Math.max(2, Math.round(totalWords / 2.5));
    const audioBuffer = createWavBuffer(durationSeconds, 24000, 392); // G4 note

    return {
      audioBuffer,
      mimeType: "audio/wav",
      durationSeconds,
      providerRequestId: `mock_req_${Date.now()}`,
    };
  }

  async *synthesizeStream(input: TTSRequest): AsyncIterable<Uint8Array> {
    const fullAudio = await this.synthesize(input);
    const chunkSize = 4096;
    for (let i = 0; i < fullAudio.audioBuffer.length; i += chunkSize) {
      yield fullAudio.audioBuffer.subarray(i, i + chunkSize);
    }
  }
}
