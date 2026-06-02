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
    const gapSeconds = Math.max(0, Number(recipe.pattern.paceMs || 0) / 1000);
    const repeatCount = Math.max(1, Math.min(6, Number(recipe.pattern.steps || 1)));
    for (let index = 0; index < repeatCount; index += 1) {
      this.scheduleVoice(startAt + index * (noteSeconds + gapSeconds), recipe);
    }
    const cycleSeconds = repeatCount * noteSeconds + Math.max(0, repeatCount - 1) * gapSeconds;
    if (recipe.pattern.loop) {
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
    const attack = Math.min(duration * 0.42, Math.max(0.001, Number(recipe.tone.attackMs || 5) / 1000));
    const release = Math.min(duration * 0.46, Math.max(0.008, Number(recipe.tone.releaseMs || 30) / 1000));
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

    const filter = addNode(context.createBiquadFilter());
    filter.type = recipe.filter.type || 'lowpass';
    filter.frequency.setValueAtTime(Math.max(80, Number(recipe.filter.frequencyHz || 1500)), startAt);
    filter.Q.setValueAtTime(Math.max(0.1, Number(recipe.filter.resonance || 1)), startAt);
    filter.connect(output);

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
    const transient = Math.max(0.05, Number(recipe.impact?.transient || 0.45));
    voiceGain.gain.setValueAtTime(0.0001, startAt);
    voiceGain.gain.exponentialRampToValueAtTime(Math.min(1.35, punch), startAt + attack);
    voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.38, 0.68 - transient * 0.22), Math.min(sustainAt, startAt + attack + duration * 0.18));
    voiceGain.gain.setValueAtTime(0.56, sustainAt);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    voiceGain.connect(filter);

    const oscillator = context.createOscillator();
    oscillator.type = recipe.tone.waveform || 'sine';
    oscillator.frequency.setValueAtTime(Math.max(25, Number(recipe.tone.startFrequencyHz || 440)), startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, Number(recipe.tone.endFrequencyHz || 440)), endAt);
    oscillator.connect(voiceGain);
    this.trackSource(oscillator);

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
      noiseGain.gain.value = Math.min(0.75, Number(recipe.noise.level || 0));
      noise.connect(noiseGain);
      noiseGain.connect(voiceGain);
      this.trackSource(noise);
      noise.start(startAt);
      noise.stop(endAt + 0.03);
    }

    oscillator.start(startAt);
    oscillator.stop(endAt + 0.04);
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
