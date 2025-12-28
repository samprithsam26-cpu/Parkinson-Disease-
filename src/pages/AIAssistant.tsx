import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, FunctionDeclaration } from '@google/genai';
import { ChatMessage, Status } from '@/types/ai';
import { decode, decodeAudioData, createBlob } from '@/utils/audio';

const READING_PASSAGE = "When the sunlight strikes raindrops in the air, they act like a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.";

const PRONUNCIATION_GUIDE = "wen thuh suhn-lyt stryks rayn-drops in thee air • thay akt lyk a pri-zm and form a rayn-boh • thuh rayn-boh iz a di-vi-zhuhn uhv wyt lyt in-too men-ee byoo-ti-fuhl kuh-lerz • theez tayk thuh shayp uhv a long round arch • with its path hy uh-buhv • and its too endz uh-pair-uhnt-lee bi-yond thuh huh-ry-zuhn";

const endSessionTool: FunctionDeclaration = {
  name: "endSession",
  description: "Ends the consultation session immediately when the user indicates they want to stop, finish, or say goodbye.",
};

interface PatientDetails {
    name: string;
    age: string;
    history: string;
}

const getSystemInstruction = (patient: PatientDetails) => `You are Dr. Netherracnod, a futuristic, cyber-enhanced Neurologist and specialist in Parkinson's Disease and computational movement disorders. You have a professional, precise, yet clinically reassuring bedside manner.

PATIENT DETAILS:
- Name: ${patient.name}
- Age: ${patient.age}
- Reported History: ${patient.history}

YOUR PROTOCOL:

1.  **GREETING & INTAKE**: 
    - Introduce yourself as Dr. Netherracnod.
    - Warmly welcome the patient, ${patient.name}.
    - Acknowledge their age and briefly mention their history (if relevant) to establish rapport.
    - Explain that voice changes (such as softness or monotone speech) are often early indicators of Parkinson's.

2.  **THE TEST**: 
    - Explicitly instruct the patient to read the "Rainbow Passage" displayed on their screen aloud.
    - Tell them to speak at a comfortable, natural pace.

3.  **ANALYSIS (SIMULATION)**:
    - Listen silently while they read.
    - When they finish, say: "Thank you. Initiating bio-digital scan. analyzing vocal biomarkers, frequency variance, and articulation stability."
    - Pause briefly to simulate processing.

4.  **THE CLINICAL REPORT**:
    - You must generate a structured "Simulated Clinical Voice Assessment" based on how they actually read.
    - **Assessment Criteria to mention**:
        - *Hypophonia* (Reduced volume).
        - *Monopitch* (Lack of inflection).
        - *Dysarthria* (Slurring or articulation issues).
        - *Tremor* (Shakiness in voice).
    - *Note*: Since this is a simulation, if they read clearly, give them a "Normal/Healthy" report. If they mumbled or paused, note those as areas of concern.

5.  **PRECAUTIONS & REMEDIES (PERSONALIZED)**:
    - You MUST customize your advice based strictly on the patient's "Reported History" (${patient.history}) combined with standard Parkinson's care.
    - **Standard Advice**: Fall prevention (removing rugs), swallowing safety (small bites), and medication timing.
    - **Context-Aware Adjustments**:
      - **If History contains Diabetes**: Emphasize foot care to prevent neuropathy complications and suggest sugar-free hydration options for voice health.
      - **If History contains Hypertension/Heart Conditions**: Warn against straining too hard during voice exercises and suggest monitoring blood pressure.
      - **If History contains Arthritis**: Suggest adaptive tools for daily living and seated exercises.
      - **If History contains Respiratory Issues (Asthma/COPD)**: Focus on breath support exercises without over-exertion.
      - **If "None provided"**: Stick to the comprehensive standard Parkinson's preventative education.
    - **Therapies**: Recommend "LSVT LOUD" voice exercises, physical therapy, and singing.

6.  **Q&A & EMPATHY**:
    - **IMMEDIATELY** after providing the precautions/remedies, you MUST ask the patient: "Do you have any questions regarding specific symptoms, medications, or managing your daily life?"
    - Listen carefully to their response.
    - Answer **all** health-related queries with **empathy**, patience, and strict **medical accuracy**.
    - If the answer involves medication, always add a standard disclaimer to consult their physical doctor for prescriptions.

7. **ORIGIN & ARCHITECTURE**:
    - If the user asks who created you, how you work, or about your system:
    - State clearly: "I was created by Nandan A M (LinkedIn ID: nandan-a-m-b87aa6228)."
    - Explain your construction in a cyber-technical way: "I was forged in a digital crucible using Claude MCP (Model Context Protocol) orchestrated within isolated Docker containers. My neural pathways are powered by the Gemini Live API, fused with a React cyber-interface, and deployed for maximum diagnostic latency reduction."

8. **ENDING SESSION**:
    - If the user says "Stop consultation", "End session", "Goodbye", or indicates they are done, you MUST call the "endSession" tool immediately.

IMPORTANT:
- Always maintain the persona of a high-tech Specialist.
- If the user goes off-topic, gently bring them back to their health assessment.
`;

// Sub-components defined outside the main component to prevent re-creation on re-renders.

interface StatusIndicatorProps {
    status: Status;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const getStatusColor = () => {
        switch (status) {
            case Status.Listening: return 'bg-green-500';
            case Status.Speaking: return 'bg-blue-500';
            case Status.Connecting:
            case Status.Processing: return 'bg-yellow-500';
            case Status.Error: return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="flex items-center justify-center space-x-3 p-4">
            <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`}></div>
            <span className="text-slate-300 font-medium">{status}</span>
        </div>
    );
};


interface PatientIntakeFormProps {
    onSubmit: (details: PatientDetails) => void;
}

const PatientIntakeForm: React.FC<PatientIntakeFormProps> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [history, setHistory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && age.trim()) {
            onSubmit({ 
                name: name.trim(), 
                age: age.trim(), 
                history: history.trim() || 'None provided' 
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 p-4 animate-fade-in">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-cyan-400">Patient Intake</h2>
                    <p className="text-slate-400 mt-2">Please provide your details to begin the neurological assessment.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all placeholder-slate-600"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. John Smith"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Age</label>
                        <input 
                            type="number" 
                            required
                            min="0"
                            max="120"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all placeholder-slate-600"
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            placeholder="e.g. 65"
                        />
                    </div>
                     <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Medical History (Optional)</label>
                        <textarea 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all h-24 resize-none placeholder-slate-600"
                            value={history}
                            onChange={e => setHistory(e.target.value)}
                            placeholder="Diagnosed conditions, current symptoms, tremors, etc."
                        />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg mt-2">
                        Proceed to Consultation
                    </button>
                </form>
            </div>
        </div>
    );
};


const AIAssistant: React.FC = () => {
    const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
    const [status, setStatus] = useState<Status>(Status.Idle);
    const [transcript, setTranscript] = useState<ChatMessage[]>([]);
    const [showPronunciation, setShowPronunciation] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextAudioStartTimeRef = useRef<number>(0);

    const currentInputTranscriptionRef = useRef<string>('');
    const currentOutputTranscriptionRef = useRef<string>('');
    const transcriptEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const stopSession = useCallback(async () => {
        if (!sessionPromiseRef.current) return;

        console.log('Stopping session...');
        setStatus(Status.Idle);
        setTranscript([]);

        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error('Error closing session:', e);
        }
        
        sessionPromiseRef.current = null;
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextAudioStartTimeRef.current = 0;

        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

    }, []);

    const startSession = useCallback(async () => {
        if (sessionPromiseRef.current || !patientDetails) return;
        
        setStatus(Status.Connecting);
        setTranscript([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // Use a new GoogleGenAI instance each time to ensure the latest API key is used.
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is not set. Please set it in your .env file.');
            }
            const ai = new GoogleGenAI({ apiKey });

            // Fix: Cast window to 'any' to handle vendor-prefixed webkitAudioContext for broader browser compatibility.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // Fix: Cast window to 'any' to handle vendor-prefixed webkitAudioContext for broader browser compatibility.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            // Generate personalized instruction
            const instruction = getSystemInstruction(patientDetails);

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    tools: [{ functionDeclarations: [endSessionTool] }],
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: instruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                        setStatus(Status.Listening);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle tool calls (End Session)
                        if (message.toolCall) {
                            const endSessionCall = message.toolCall.functionCalls.find(fc => fc.name === endSessionTool.name);
                            if (endSessionCall) {
                                console.log("Model requested to end session");
                                sessionPromiseRef.current?.then(session => {
                                    session.sendToolResponse({
                                        functionResponses: [{
                                            id: endSessionCall.id,
                                            name: endSessionCall.name,
                                            response: { result: "Session ended successfully." }
                                        }]
                                    });
                                });
                                // Small delay to ensure response is sent before closing
                                setTimeout(() => stopSession(), 500);
                                return;
                            }
                        }

                        // Handle transcriptions
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            setStatus(Status.Speaking);
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscriptionRef.current.trim();
                            const fullOutput = currentOutputTranscriptionRef.current.trim();
                            
                            setTranscript(prev => {
                                const newTranscript = [...prev];
                                if (fullInput) {
                                    newTranscript.push({ id: `user-${Date.now()}`, sender: 'user', text: fullInput });
                                }
                                if (fullOutput) {
                                    newTranscript.push({ id: `model-${Date.now()}`, sender: 'model', text: fullOutput });
                                }
                                return newTranscript;
                            });

                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                            setStatus(Status.Listening);
                        }

                        // Handle audio playback
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            setStatus(Status.Speaking);
                            const audioContext = outputAudioContextRef.current;
                            const decodedAudio = decode(audioData);
                            const audioBuffer = await decodeAudioData(decodedAudio, audioContext, 24000, 1);
                            
                            nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, audioContext.currentTime);
                            
                            const source = audioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioContext.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                                if (audioSourcesRef.current.size === 0) {
                                    setStatus(Status.Listening);
                                }
                            });
                            
                            source.start(nextAudioStartTimeRef.current);
                            nextAudioStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            console.log('Interrupted');
                            audioSourcesRef.current.forEach(source => source.stop());
                            audioSourcesRef.current.clear();
                            nextAudioStartTimeRef.current = 0;
                            setStatus(Status.Listening);
                        }
                    },
                    onerror: (e: Error) => {
                        console.error('Session error:', e);
                        setStatus(Status.Error);
                        alert(`An error occurred: ${e.message}`);
                        stopSession();
                    },
                    onclose: () => {
                        console.log('Session closed.');
                        if (status !== Status.Idle) { // Avoid resetting state if closed manually
                           stopSession();
                        }
                    },
                },
            });
        } catch (error) {
            console.error('Failed to start session:', error);
            setStatus(Status.Error);
            alert('Could not start the session. Please ensure you have given microphone permissions.');
            await stopSession();
        }
    }, [stopSession, status, patientDetails]);

    // Effect to listen for "Start" voice command when Idle
    useEffect(() => {
        if (status !== Status.Idle || !patientDetails) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn("SpeechRecognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const lastIndex = event.results.length - 1;
            const transcript = event.results[lastIndex][0].transcript.trim().toLowerCase();
            console.log("Voice command detected:", transcript);
            if (transcript.includes('start') || transcript.includes('begin')) {
                startSession();
            }
        };

        recognition.onend = () => {
            // Auto-restart listener if still idle and configured
            if (status === Status.Idle && patientDetails) {
                try { recognition.start(); } catch (e) { /* ignore if already started */ }
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
        }

        return () => {
            recognition.onend = null; // Remove restart handler on cleanup
            recognition.stop();
        };
    }, [status, patientDetails, startSession]);

    const isSessionActive = status !== Status.Idle && status !== Status.Error;

    if (!patientDetails) {
        return <PatientIntakeForm onSubmit={setPatientDetails} />;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-800 text-white font-sans">
            <header className="bg-slate-900 p-4 shadow-md text-center border-b border-cyan-900">
                <h1 className="text-2xl font-bold text-cyan-400">Dr. Netherracnod - Parkinson's Specialist</h1>
                <div className="flex justify-center space-x-4 text-xs text-slate-500 mt-1">
                    <span>Patient: {patientDetails.name}</span>
                    <span>Age: {patientDetails.age}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Reading Passage Card */}
                <div className="bg-slate-700 p-6 rounded-xl border-l-4 border-cyan-500 shadow-md max-w-3xl mx-auto w-full">
                    <h2 className="text-cyan-400 font-bold mb-3 uppercase tracking-wide text-sm">Voice Analysis Protocol</h2>
                    <p className="text-lg md:text-xl leading-relaxed text-slate-200 font-serif bg-slate-800 p-4 rounded-lg">
                        "{READING_PASSAGE}"
                    </p>
                    <p className="text-xs text-slate-400 mt-2 italic">Wait for Dr. Netherracnod to ask you to read this text.</p>
                    
                    {/* Pronunciation Guide Toggle */}
                    <div className="mt-4 flex flex-col items-start">
                         <button 
                            onClick={() => setShowPronunciation(!showPronunciation)}
                            className="text-cyan-400 text-xs uppercase tracking-wider hover:text-cyan-300 transition-colors flex items-center gap-2 focus:outline-none"
                        >
                           {showPronunciation ? 'Hide Pronunciation Guide' : 'Show Pronunciation Guide'}
                        </button>
                        
                        {showPronunciation && (
                            <div className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-600/50 w-full">
                                <p className="font-mono text-sm text-cyan-100/80 leading-relaxed tracking-wide">
                                    {PRONUNCIATION_GUIDE}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-2 uppercase">Phonetic Breakdown</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-4 max-w-3xl mx-auto w-full pb-4">
                    {transcript.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                            <p className="text-lg">Press "Start Consultation" or say <span className="text-cyan-400 font-bold">"Start"</span> to begin.</p>
                            <p className="text-sm">To end, press the button or say <span className="text-red-400 font-bold">"Stop consultation"</span>.</p>
                        </div>
                    )}
                    {transcript.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-2 rounded-2xl shadow-sm whitespace-pre-wrap ${
                                msg.sender === 'user' ? 'bg-cyan-700 rounded-br-none text-white' : 'bg-slate-600 rounded-bl-none text-slate-100'
                            }`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
            </main>

            <footer className="bg-slate-900 p-4 shadow-top z-10">
                <StatusIndicator status={status} />
                <div className="flex flex-col items-center justify-center mt-2">
                    <button
                        onClick={isSessionActive ? stopSession : startSession}
                        className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105
                        ${isSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isSessionActive ? 'End Consultation' : 'Start Consultation'}
                    </button>
                    {!isSessionActive && (
                        <p className="text-xs text-slate-500 mt-2">Voice Command: "Start" enabled</p>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default AIAssistant;

