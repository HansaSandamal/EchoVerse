import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// --- Audio Helper Functions (as per Gemini API guidelines) ---

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// --- Component ---

interface LiveConversationScreenProps {
    onBack: () => void;
}

type ConversationTurn = {
    speaker: 'user' | 'model';
    text: string;
    id: number;
    isFinal: boolean;
};

type Status = 'idle' | 'connecting' | 'active' | 'error';

let turnCounter = 0;

const LiveConversationScreen = ({ onBack }: LiveConversationScreenProps) => {
    const [status, setStatus] = useState<Status>('idle');
    const [transcript, setTranscript] = useState<ConversationTurn[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);

    const cleanup = useCallback(() => {
        console.log('Cleaning up resources...');
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();

        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const startConversation = async () => {
        setStatus('connecting');
        setTranscript([]);
        setErrorMessage('');
        
        const liveApiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
        if (!liveApiKey) {
            setErrorMessage("AI Service is unavailable. Please ensure the API Key is configured.");
            setStatus('error');
            return;
        }

        const ai = new GoogleGenAI({ apiKey: liveApiKey });

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            console.error("Microphone access denied:", err);
            setErrorMessage("Microphone access denied. Please enable microphone permissions in your browser settings.");
            setStatus('error');
            return;
        }

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setStatus('active');
                    const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                    scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current.onaudioprocess = (event) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const { text } = message.serverContent.inputTranscription;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.speaker === 'user' && !last.isFinal) {
                                return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                            }
                            return [...prev, { speaker: 'user', text, id: ++turnCounter, isFinal: false }];
                        });
                    }
                    if (message.serverContent?.outputTranscription) {
                        const { text } = message.serverContent.outputTranscription;
                         setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.speaker === 'model' && !last.isFinal) {
                                return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                            }
                            return [...prev, { speaker: 'model', text, id: ++turnCounter, isFinal: false }];
                        });
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscript(prev => prev.map(t => ({...t, isFinal: true})))
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        const ctx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.addEventListener('ended', () => sourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    setErrorMessage("A connection error occurred. Please try again.");
                    setStatus('error');
                    cleanup();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Session closed.');
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: 'You are a friendly and helpful conversational journaling assistant. Keep your responses concise and empathetic.'
            }
        });
    };

    const endConversation = () => {
        cleanup();
        setStatus('idle');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] animate-fade-in-up">
            <div className="flex items-center justify-between pb-4">
                <button onClick={status !== 'active' ? onBack : endConversation} className="flex items-center text-accent-light dark:text-accent-dark font-semibold">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    {status === 'active' ? 'End Session' : 'Back Home'}
                </button>
                <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Live Conversation</h1>
            </div>

            <div className="flex-grow p-4 bg-content-light dark:bg-content-dark rounded-xl overflow-y-auto mb-4">
                <div className="space-y-4">
                    {transcript.map((turn) => (
                        <div key={turn.id} className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${turn.speaker === 'user' ? 'bg-accent-light dark:bg-accent-dark text-white' : 'bg-bkg-light dark:bg-bkg-dark'}`}>
                                <p>{turn.text}</p>
                            </div>
                        </div>
                    ))}
                     {transcript.length === 0 && status === 'active' && <p className="text-center text-text-secondary-light dark:text-text-secondary-dark">Listening...</p>}
                     {transcript.length === 0 && status === 'idle' && <p className="text-center text-text-secondary-light dark:text-text-secondary-dark">Press "Start Conversation" to begin.</p>}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
                {status === 'idle' && (
                     <button onClick={startConversation} className="px-8 py-3 bg-accent-light dark:bg-accent-dark text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 active:animate-button-press">
                        Start Conversation
                    </button>
                )}
                 {status === 'connecting' && (
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-accent-light dark:text-accent-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">Connecting...</p>
                    </div>
                 )}
                 {status === 'active' && (
                      <button onClick={endConversation} className="px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 active:animate-button-press">
                        End Conversation
                    </button>
                 )}
                 {status === 'error' && (
                     <div className="text-center">
                        <p className="text-red-500 font-semibold">{errorMessage}</p>
                        <button onClick={onBack} className="mt-4 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:animate-button-press transition-colors">Go Back</button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default LiveConversationScreen;