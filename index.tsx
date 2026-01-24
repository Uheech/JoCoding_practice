/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, LiveServerMessage, Modality, Session} from '@google/genai';
import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createBlob, decode, decodeAudioData} from './utils';
import './visual-3d';

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @state() isRecording = false;
  @state() status = '';
  @state() error = '';
  @state() lastFailedUrl = '';
  @state() apiKey = localStorage.getItem('gemini_api_key') || '';

  private workletLoaded = false;
  private client!: GoogleGenAI;
  private session!: Session;
  private inputAudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)({sampleRate: 16000});
  private outputAudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)({sampleRate: 24000});
  @state() inputNode = this.inputAudioContext.createGain();
  @state() outputNode = this.outputAudioContext.createGain();
  private nextStartTime = 0;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private sources = new Set<AudioBufferSourceNode>();

  static styles = css`
    #status {
      position: absolute;
      bottom: 5vh;
      left: 0;
      right: 0;
      z-index: 10;
      text-align: center;
    }

    .controls {
      z-index: 10;
      position: absolute;
      bottom: 10vh;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;

      button {
        outline: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        width: 64px;
        height: 64px;
        cursor: pointer;
        font-size: 24px;
        padding: 0;
        margin: 0;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      button[disabled] {
        display: none;
      }
    }

    .api-key-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      color: white;
      gap: 20px;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }

    .api-key-overlay input {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
      font-size: 16px;
      outline: none;
    }

    .api-key-overlay button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }

    .api-key-overlay a {
      color: #8ab4f8;
      text-decoration: none;
      font-size: 14px;
    }

    #version-tag {
      position: absolute;
      bottom: 10px;
      right: 10px;
      color: #ff4444;
      font-size: 12px;
      font-weight: bold;
      font-family: monospace;
      z-index: 100;
      pointer-events: none;
      background: rgba(0,0,0,0.5);
      padding: 4px 8px;
      border-radius: 4px;
    }

    #error-monitor {
      position: absolute;
      top: 10px;
      left: 10px;
      color: #ff4444;
      font-size: 12px;
      z-index: 1000;
      background: rgba(0,0,0,0.8);
      padding: 10px;
      border: 1px solid #ff4444;
      border-radius: 4px;
      max-width: 80%;
      word-break: break-all;
    }
  `;

  constructor() {
    super();
    // 배포 환경의 보안을 위해 API 호출 후 초기화하도록 변경
  }

  connectedCallback() {
    super.connectedCallback();
    this.initClient();

    // 네트워크 및 자원 로드 에러 감지기
    window.addEventListener('error', (e) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof HTMLScriptElement || e.target instanceof HTMLLinkElement) {
        const url = (e.target as any).src || (e.target as any).href;
        this.lastFailedUrl = `Load Failed: ${url}`;
      }
    }, true);

    // fetch 에러 가로채기 시도
    const originalFetch = window.fetch;
    window.fetch = (...args) => originalFetch(...args).catch(err => {
      this.lastFailedUrl = `Fetch Failed: ${args[0]}`;
      throw err;
    });
  }

  private initAudio() {
    this.nextStartTime = this.outputAudioContext.currentTime;
  }

  private async initClient() {
    this.initAudio();
    
    if (!this.apiKey) {
      this.updateStatus('API Key required');
      return;
    }

    this.updateStatus('Initializing...');

    try {
      this.client = new GoogleGenAI({
        apiKey: this.apiKey,
      });

      this.outputNode.connect(this.outputAudioContext.destination);
      this.initSession();
    } catch (e: any) {
      console.error('Failed to initialize client:', e);
      this.updateError('Init Error: ' + e.message);
    }
  }

  private handleApiKeyInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.apiKey = input.value;
  }

  private saveApiKey() {
    if (this.apiKey) {
      localStorage.setItem('gemini_api_key', this.apiKey);
      this.initClient();
    }
  }

  private async initSession() {
    if (!this.client) return;
    const model = 'gemini-2.5-flash-native-audio-preview-12-2025';

    try {
      this.session = await this.client.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            this.updateStatus('Connected & Ready');
          },
          onmessage: async (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            const audio = parts && parts.length > 0 ? parts[0].inlineData : undefined;

            if (audio) {
              this.updateStatus('🎙️ Speaking...');
              console.log('Audio data received from Gemini');

              this.nextStartTime = Math.max(
                this.nextStartTime,
                this.outputAudioContext.currentTime,
              );

              const audioBuffer = await decodeAudioData(
                decode(audio.data),
                this.outputAudioContext,
                24000,
                1,
              );
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              source.addEventListener('ended', () => {
                this.sources.delete(source);
                if (this.sources.size === 0) {
                  this.updateStatus('🔴 Listening...');
                }
              });

              source.start(this.nextStartTime);
              this.nextStartTime = this.nextStartTime + audioBuffer.duration;
              this.sources.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of this.sources.values()) {
                source.stop();
                this.sources.delete(source);
              }
              this.nextStartTime = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            this.updateError(e.message);
          },
          onclose: (e: CloseEvent) => {
            this.updateStatus('Close:' + e.reason);
          },
        },
        config: {
          systemInstruction: {
            parts: [{ text: '당신은 친절한 한국어 음성 비서입니다. 사용자의 말에 짧고 명확하게 한국어로 답변하세요. 지금 즉시 대화를 시작할 준비가 되었습니다.' }]
          },
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Orus'}},
            // languageCode: 'en-GB'
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  private updateStatus(msg: string) {
    this.status = msg;
  }

  private updateError(msg: string) {
    this.error = msg;
  }

  private async startRecording() {
    if (this.isRecording) {
      return;
    }

    this.inputAudioContext.resume();
    this.outputAudioContext.resume();

    this.updateStatus('Requesting microphone access...');

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      this.updateStatus('Microphone access granted. Starting capture...');

      this.sourceNode = this.inputAudioContext.createMediaStreamSource(
        this.mediaStream,
      );
      this.sourceNode.connect(this.inputNode);

      if (!this.workletLoaded) {
        // AudioWorklet 코드를 인라인 Blob으로 생성 (외부 파일 호출 0%)
        const workletCode = `
          class AudioProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0];
              if (input && input.length > 0) {
                const pcmData = input[0];
                this.port.postMessage(pcmData);
              }
              return true;
            }
          }
          try {
            registerProcessor('audio-processor', AudioProcessor);
          } catch (e) {
            // 이미 등록된 경우 무시
          }
        `;
        
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);

        try {
          await this.inputAudioContext.audioWorklet.addModule(workletUrl);
          this.workletLoaded = true;
        } catch (e: any) {
          console.error('Worklet loading failed:', e);
          throw new Error('오디오 처리 모듈 로드 실패: ' + e.message);
        }
      }

      this.audioWorkletNode = new AudioWorkletNode(
        this.inputAudioContext,
        'audio-processor'
      );

      this.audioWorkletNode.port.onmessage = (event) => {
        if (!this.isRecording || !this.session) return;
        
        // 사용자가 말을 하고 있을 때 상태 표시
        if (this.status !== '🎙️ Speaking...') {
          this.updateStatus('🔴 Hearing...');
        }

        const pcmData = event.data;
        this.session.sendRealtimeInput({media: createBlob(pcmData)});
      };

      this.sourceNode.connect(this.audioWorkletNode);
      this.audioWorkletNode.connect(this.inputAudioContext.destination);

      this.isRecording = true;
      this.updateStatus('🔴 Recording... Capturing PCM chunks.');
    } catch (err: any) {
      console.error('Error starting recording:', err);
      this.updateStatus(`Error: ${err.message}`);
      this.stopRecording();
    }
  }

  private stopRecording() {
    if (!this.isRecording && !this.mediaStream && !this.inputAudioContext)
      return;

    this.updateStatus('Stopping recording...');

    this.isRecording = false;

    if (this.audioWorkletNode && this.sourceNode && this.inputAudioContext) {
      this.audioWorkletNode.disconnect();
      this.sourceNode.disconnect();
    }

    this.audioWorkletNode = null;
    this.sourceNode = null;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.updateStatus('Recording stopped. Click Start to begin again.');
  }

  private reset() {
    if (!this.client) {
      this.initClient();
      return;
    }
    this.session?.close();
    this.initSession();
    this.updateStatus('Session cleared.');
  }

  render() {
    return html`
      <div>
        ${this.lastFailedUrl ? html`<div id="error-monitor">⚠️ 404/Error Detect: ${this.lastFailedUrl}</div>` : ''}
        ${!this.apiKey
          ? html`
              <div class="api-key-overlay">
                <h2>Gemini API Key Required</h2>
                <p>실시간 오디오 대화를 시작하려면 API 키가 필요합니다.</p>
                <input
                  type="password"
                  placeholder="Enter your Gemini API Key"
                  .value=${this.apiKey}
                  @input=${this.handleApiKeyInput}
                />
                <button @click=${this.saveApiKey}>Save & Start</button>
                <a href="https://aistudio.google.com/app/apikey" target="_blank"
                  >Get an API Key from Google AI Studio</a
                >
              </div>
            `
          : ''}

        <div class="controls">
          <button
            id="resetButton"
            @click=${this.reset}
            ?disabled=${this.isRecording}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="40px"
              viewBox="0 -960 960 960"
              width="40px"
              fill="#ffffff">
              <path
                d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
            </svg>
          </button>
          <button
            id="startButton"
            @click=${this.startRecording}
            ?disabled=${this.isRecording}>
            <svg
              viewBox="0 0 100 100"
              width="32px"
              height="32px"
              fill="#c80000"
              xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" />
            </svg>
          </button>
          <button
            id="stopButton"
            @click=${this.stopRecording}
            ?disabled=${!this.isRecording}>
            <svg
              viewBox="0 0 100 100"
              width="32px"
              height="32px"
              fill="#000000"
              xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="100" height="100" rx="15" />
            </svg>
          </button>
        </div>

        <div id="status"> ${this.error} </div>
        <div id="version-tag"> [V5.0 - STABLE] </div>
        <gdm-live-audio-visuals-3d
          .inputNode=${this.inputNode}
          .outputNode=${this.outputNode}></gdm-live-audio-visuals-3d>
      </div>
    `;
  }
}
