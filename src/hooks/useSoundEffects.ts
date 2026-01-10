import { useCallback, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const { soundVolume } = useSettings();

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Winning/Success sound - triumphant ascending tones
  const playWinSound = useCallback(() => {
    if (soundVolume === 0) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create master gain with volume control
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.3 * soundVolume, now);
    masterGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    // Ascending chord sequence
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const delays = [0, 0.08, 0.16, 0.24];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delays[i]);
      
      gain.gain.setValueAtTime(0, now + delays[i]);
      gain.gain.linearRampToValueAtTime(0.4, now + delays[i] + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delays[i] + 0.8);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(now + delays[i]);
      osc.stop(now + delays[i] + 1);
    });

    // Add a sparkle effect
    for (let j = 0; j < 5; j++) {
      const sparkleOsc = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.setValueAtTime(2000 + Math.random() * 2000, now + 0.3 + j * 0.05);
      
      sparkleGain.gain.setValueAtTime(0, now + 0.3 + j * 0.05);
      sparkleGain.gain.linearRampToValueAtTime(0.1, now + 0.32 + j * 0.05);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + j * 0.05);
      
      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(masterGain);
      
      sparkleOsc.start(now + 0.3 + j * 0.05);
      sparkleOsc.stop(now + 0.6 + j * 0.05);
    }
  }, [getAudioContext, soundVolume]);

  // Whoosh sound for deletion
  const playWhooshSound = useCallback(() => {
    if (soundVolume === 0) return;
    
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create master gain for volume control
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(soundVolume, now);
    
    // Create noise buffer
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5);
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Bandpass filter for whoosh character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    filter.Q.setValueAtTime(1, now);
    
    // Volume envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    noise.start(now);
    noise.stop(now + 0.4);

    // Add a subtle low tone for depth
    const lowOsc = ctx.createOscillator();
    const lowGain = ctx.createGain();
    
    lowOsc.type = 'sine';
    lowOsc.frequency.setValueAtTime(150, now);
    lowOsc.frequency.exponentialRampToValueAtTime(50, now + 0.25);
    
    lowGain.gain.setValueAtTime(0, now);
    lowGain.gain.linearRampToValueAtTime(0.15, now + 0.03);
    lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    lowOsc.connect(lowGain);
    lowGain.connect(masterGain);
    
    lowOsc.start(now);
    lowOsc.stop(now + 0.35);
  }, [getAudioContext, soundVolume]);

  return { playWinSound, playWhooshSound };
};
