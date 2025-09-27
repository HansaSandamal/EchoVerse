import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioUrl: string) => void;
}

type RecordingStatus = 'idle' | 'requesting' | 'recording' | 'denied';

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        if (status === 'recording') return;
        
        setStatus('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                onRecordingComplete(audioUrl);
                audioChunksRef.current = [];
                 // Stop all tracks to turn off the microphone indicator
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setStatus('recording');

        } catch (err) {
            console.error("Microphone access denied:", err);
            setStatus('denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && status === 'recording') {
            mediaRecorderRef.current.stop();
            setStatus('idle');
        }
    };

    const RecordButton = () => (
         <button 
            onClick={startRecording}
            className="relative w-24 h-24 rounded-full bg-purple-500/30 flex items-center justify-center animate-pulse-glow transition-colors"
        >
            <div className="w-20 h-20 rounded-full bg-accent-dark/80 flex items-center justify-center shadow-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                  <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
                </svg>
            </div>
        </button>
    )

    if (status === 'denied') {
        return (
            <div className="text-center text-red-400">
                <p className="font-semibold">Microphone Access Denied</p>
                <p className="text-sm">Please enable microphone permissions in your browser settings to use voice journaling.</p>
            </div>
        )
    }
    
    if (status === 'recording') {
        return (
            <div className="text-center">
                 <button 
                    onClick={stopRecording}
                    className="relative w-24 h-24 rounded-full bg-red-500/30 flex items-center justify-center animate-pulse"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                        </svg>
                    </div>
                </button>
                 <p className="mt-4 text-text-secondary-dark font-semibold">Recording... Tap to stop.</p>
            </div>
        )
    }

    return (
        <div className="text-center">
            <RecordButton />
            <p className="mt-4 text-text-secondary-dark font-semibold">Tap to start recording your thoughts.</p>
        </div>
    );
};

export default VoiceRecorder;