export class ProceduralSoundRuntime {
  constructor(onStateChange = () => {}) {
    this.context = null;
    this.sources = new Set();
    this.audioNodes = new Set();
    this.cleanupTimers = new Set();
    this.loopTimer = null;
    this.playToken = 0;
    this.onStateChange = onStateChange;
  }

  async ensureContext() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is not supported in this browser.');
      this.context = new AudioContextClass();
    }
    if (this.context.state === 'suspended') await this.context.resume();
    return this.context;
  }

  async play(record) {
    this.stop(false);
    const context = await this.ensureContext();
    const token = ++this.playToken;
    const recipe = record.recipe;
    this.onStateChange({ playing: true, message: recipe.pattern.loop ? 'Preview looping — press Stop when finished.' : 'Playing preview.' });
    this.scheduleCycle(context.currentTime + 0.025, recipe, token);
  }

  scheduleCycle(startAt, recipe, token) {
    if (token !== this.playToken || !this.context) return;
    const noteSeconds = Math.max(0.05, Number(recipe.durationMs || 200) / 1000);
    const gapSeconds = Math.max(0, Number(recipe.pattern?.paceMs || 0) / 1000);
    const repeatCount = Math.max(1, Math.min(6, Number(recipe.pattern?.steps || 1)));
    for (let index = 0; index < repeatCount; index += 1) {
      this.scheduleVoice(startAt + index * (noteSeconds + gapSeconds), recipe);
    }
    const cycleSeconds = repeatCount * noteSeconds + Math.max(0, repeatCount - 1) * gapSeconds;
    if (recipe.pattern?.loop) {
      this.loopTimer = window.setTimeout(() => {
        if (token === this.playToken && this.context) this.scheduleCycle(this.context.currentTime + 0.025, recipe, token);
      }, Math.max(40, cycleSeconds * 1000));
    } else {
      const completion = window.setTimeout(() => {
        this.cleanupTimers.delete(completion);
        if (token === this.playToken) this.onStateChange({ playing: false, message: 'Preview complete.' });
      }, Math.ceil(cycleSeconds * 1000 + 80));
      this.cleanupTimers.add(completion);
    }
  }

  scheduleVoice(startAt, recipe) {
    const context = this.context;
    const duration = Math.max(0.05, Number(recipe.durationMs || 200) / 1000);
    const endAt = startAt + duration;
    const attack = Math.min(duration * 0.42, Math.max(0.001, Number(recipe.tone?.attackMs || 5) / 1000));
    const release = Math.min(duration * 0.5, Math.max(0.008, Number(recipe.tone?.releaseMs || 30) / 1000));
    const sustainAt = Math.max(startAt + attack, endAt - release);
    const voiceNodes = [];
    const addNode = (node) => { this.audioNodes.add(node); voiceNodes.push(node); return node; };

    const compressor = addNode(context.createDynamicsCompressor());
    compressor.threshold.value = -16;
    compressor.knee.value = 24;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.18;
    compressor.connect(context.destination);

    const output = addNode(context.createGain());
    output.gain.value = Math.min(Number(recipe.safety?.previewGainCap || 0.26), Math.max(0, Number(recipe.masterGain || 0)));
    output.connect(compressor);

    const highpass = addNode(context.createBiquadFilter());
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(Math.max(10, Number(recipe.filter?.highpassHz || 18)), startAt);
    if (Number(recipe.filter?.highpassSweep || 0) !== 0) {
      const nextHighpass = Math.max(10, Number(recipe.filter?.highpassHz || 18) * (1 + Number(recipe.filter.highpassSweep) * 2.4));
      highpass.frequency.exponentialRampToValueAtTime(nextHighpass, endAt);
    }
    highpass.Q.setValueAtTime(0.7, startAt);
    highpass.connect(output);

    const filter = addNode(context.createBiquadFilter());
    filter.type = recipe.filter?.type || 'lowpass';
    filter.frequency.setValueAtTime(Math.max(80, Number(recipe.filter?.frequencyHz || 1500)), startAt);
    if (Number(recipe.filter?.sweep || 0) !== 0) {
      const nextCutoff = Math.max(80, Number(recipe.filter?.frequencyHz || 1500) * (1 + Number(recipe.filter.sweep) * 2.4));
      filter.frequency.exponentialRampToValueAtTime(nextCutoff, endAt);
    }
    filter.Q.setValueAtTime(Math.max(0.1, Number(recipe.filter?.resonance || 1)), startAt);
    filter.connect(highpass);

    if (recipe.echo?.enabled && recipe.echo.mix > 0) {
      const wet = addNode(context.createGain());
      wet.gain.value = Math.min(0.44, Number(recipe.echo.mix || 0));
      const delay = addNode(context.createDelay(0.6));
      delay.delayTime.value = Math.min(0.55, Number(recipe.echo.delayMs || 100) / 1000);
      const feedback = addNode(context.createGain());
      feedback.gain.value = Math.min(0.48, Number(recipe.echo.feedback || 0));
      filter.connect(wet);
      wet.connect(delay);
      delay.connect(output);
      delay.connect(feedback);
      feedback.connect(delay);
    }

    const voiceGain = addNode(context.createGain());
    const punch = Math.max(0.55, Number(recipe.impact?.punch || 1));
    const sustainPunch = Math.max(0, Number(recipe.tone?.sustainPunch || 0));
    voiceGain.gain.setValueAtTime(0.0001, startAt);
    voiceGain.gain.exponentialRampToValueAtTime(Math.min(1.35, punch), startAt + attack);
    voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.3, 0.58 + sustainPunch * 0.35), sustainAt);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    voiceGain.connect(filter);

    const oscillator = context.createOscillator();
    oscillator.type = recipe.tone?.waveform || 'sine';
    this.applyFrequencyAutomation(oscillator.frequency, startAt, duration, recipe);
    oscillator.connect(voiceGain);
    this.trackSource(oscillator);

    if (Number(recipe.arpeggiation?.multiplier || 1) > 1.04) {
      const changeAt = startAt + Math.max(0.006, Number(recipe.arpeggiation.changeAtMs || 30) / 1000);
      const current = Math.max(25, Number(recipe.tone?.startFrequencyHz || 440));
      oscillator.frequency.exponentialRampToValueAtTime(current * Number(recipe.arpeggiation.multiplier), Math.min(changeAt, endAt - 0.006));
    }

    if (Number(recipe.modulation?.depthHz || 0) > 0) {
      const lfo = context.createOscillator();
      const lfoGain = addNode(context.createGain());
      lfo.frequency.value = Math.max(0.1, Number(recipe.modulation.rateHz || 1));
      lfoGain.gain.value = Number(recipe.modulation.depthHz || 0);
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      this.trackSource(lfo);
      lfo.start(startAt);
      lfo.stop(endAt + 0.04);
    }

    if (recipe.noise?.enabled && Number(recipe.noise.level || 0) > 0) {
      const noise = context.createBufferSource();
      noise.buffer = this.makeNoiseBuffer(context, duration + 0.08);
      const noiseGain = addNode(context.createGain());
      noiseGain.gain.setValueAtTime(0.0001, startAt);
      noiseGain.gain.exponentialRampToValueAtTime(Math.min(0.75, Number(recipe.noise.level || 0)), startAt + 0.006);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, endAt);
      noise.connect(noiseGain);
      noiseGain.connect(voiceGain);
      this.trackSource(noise);
      noise.start(startAt);
      noise.stop(endAt + 0.03);
    }

    oscillator.start(startAt);
    oscillator.stop(endAt + 0.04);

    if (Array.isArray(recipe.layers)) {
      recipe.layers.forEach((layer) => this.scheduleLayer(startAt + Number(layer.offsetMs || 0) / 1000, recipe, layer));
    }

    const tailMs = Math.ceil((duration + (recipe.echo?.enabled ? 1.2 : 0.12)) * 1000);
    const cleanup = window.setTimeout(() => {
      this.cleanupTimers.delete(cleanup);
      voiceNodes.forEach((node) => {
        try { node.disconnect(); } catch (_error) { /* no-op */ }
        this.audioNodes.delete(node);
      });
    }, tailMs);
    this.cleanupTimers.add(cleanup);
  }

  applyFrequencyAutomation(audioParam, startAt, duration, recipe) {
    const frequencyCurve = Array.isArray(recipe.tone?.frequencyCurve)
      ? recipe.tone.frequencyCurve
          .map((point) => ({
            time: Math.max(0, Math.min(1, Number(point.time))),
            frequencyHz: Math.max(25, Number(point.frequencyHz || 440))
          }))
          .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.frequencyHz))
          .sort((left, right) => left.time - right.time)
      : [];

    if (frequencyCurve.length >= 2) {
      audioParam.setValueAtTime(frequencyCurve[0].frequencyHz, startAt);
      frequencyCurve.slice(1).forEach((point) => {
        audioParam.exponentialRampToValueAtTime(point.frequencyHz, startAt + duration * point.time);
      });
      return;
    }

    audioParam.setValueAtTime(Math.max(25, Number(recipe.tone?.startFrequencyHz || 440)), startAt);
    audioParam.exponentialRampToValueAtTime(Math.max(25, Number(recipe.tone?.endFrequencyHz || 440)), startAt + duration);
  }

  scheduleLayer(startAt, recipe, layer) {
    const context = this.context;
    const duration = Math.max(0.012, Number(layer.durationMs || 80) / 1000);
    const endAt = startAt + duration;
    const gain = Math.min(0.32, Math.max(0, Number(layer.gain || 0)));
    if (!gain || !context) return;

    if (layer.kind === 'noise' || layer.kind === 'rattle' || layer.kind === 'click' || layer.kind === 'thud') {
      const source = context.createBufferSource();
      source.buffer = this.makeNoiseBuffer(context, duration + 0.03);
      const filter = context.createBiquadFilter();
      filter.type = layer.kind === 'thud' ? 'lowpass' : layer.kind === 'click' ? 'bandpass' : 'highpass';
      filter.frequency.setValueAtTime(Math.max(60, Number(layer.filterHz || layer.frequencyHz || recipe.filter?.frequencyHz || 1800)), startAt);
      filter.Q.setValueAtTime(layer.kind === 'click' ? 9 : 1.4, startAt);
      const amp = context.createGain();
      amp.gain.setValueAtTime(0.0001, startAt);
      amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.002);
      amp.gain.exponentialRampToValueAtTime(0.0001, endAt);
      source.connect(filter);
      filter.connect(amp);
      amp.connect(context.destination);
      this.audioNodes.add(filter);
      this.audioNodes.add(amp);
      this.trackSource(source);
      source.start(startAt);
      source.stop(endAt + 0.02);

      if (layer.kind === 'rattle') {
        const count = Math.max(2, Math.min(9, Math.round(duration * Number(layer.rate || 30))));
        for (let index = 1; index < count; index += 1) {
          this.scheduleLayer(startAt + (duration * index / count), recipe, {
            ...layer,
            kind: 'click',
            durationMs: 14,
            gain: gain * 0.42,
            frequencyHz: Number(layer.frequencyHz || 1200) * (0.8 + Math.random() * 0.6)
          });
        }
      }
      return;
    }

    const oscillator = context.createOscillator();
    oscillator.type = layer.waveform || 'sine';
    oscillator.frequency.setValueAtTime(Math.max(25, Number(layer.startFrequencyHz || layer.frequencyHz || 440)), startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, Number(layer.endFrequencyHz || layer.frequencyHz || 440)), endAt);
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(120, Number(layer.filterHz || recipe.filter?.frequencyHz || 6000)), startAt);
    filter.Q.setValueAtTime(1.2, startAt);
    const amp = context.createGain();
    amp.gain.setValueAtTime(0.0001, startAt);
    amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(filter);
    filter.connect(amp);
    amp.connect(context.destination);
    this.audioNodes.add(filter);
    this.audioNodes.add(amp);
    this.trackSource(oscillator);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  }

  makeNoiseBuffer(context, lengthSeconds) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * lengthSeconds), context.sampleRate);
    const output = buffer.getChannelData(0);
    for (let index = 0; index < output.length; index += 1) output[index] = Math.random() * 2 - 1;
    return buffer;
  }

  trackSource(source) {
    this.sources.add(source);
    source.addEventListener('ended', () => this.sources.delete(source), { once: true });
  }

  stop(announce = true) {
    this.playToken += 1;
    if (this.loopTimer) window.clearTimeout(this.loopTimer);
    this.loopTimer = null;
    this.cleanupTimers.forEach((timer) => window.clearTimeout(timer));
    this.cleanupTimers.clear();
    this.sources.forEach((source) => {
      try { source.stop(); } catch (_error) { /* already stopped */ }
      try { source.disconnect(); } catch (_error) { /* no-op */ }
    });
    this.sources.clear();
    this.audioNodes.forEach((node) => {
      try { node.disconnect(); } catch (_error) { /* no-op */ }
    });
    this.audioNodes.clear();
    if (announce) this.onStateChange({ playing: false, message: 'Preview stopped.' });
  }

  destroy() {
    this.stop(false);
    if (this.context && this.context.state !== 'closed') this.context.close();
    this.context = null;
  }
}
