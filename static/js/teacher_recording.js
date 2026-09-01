// Teacher Session Recording Module

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're dealing with a teacher (we can check a global or just rely on the API returning 403 / false)
    let checkInterval = setInterval(checkActiveSession, 30000); // every 30s
    let alertTriggered = false;

    // Check immediately on load too
    checkActiveSession();

    function checkActiveSession() {
        if (alertTriggered) return;

        fetch('/api/my_active_session')
            .then(res => res.json())
            .then(data => {
                if (data.active && !data.recorded) {
                    const now = new Date();
                    
                    // Parse end_time (format: "HH:MM:SS" or "HH:MM")
                    const endParts = data.end_time.split(':');
                    if (endParts.length >= 2) {
                        const endTime = new Date();
                        endTime.setHours(parseInt(endParts[0], 10));
                        endTime.setMinutes(parseInt(endParts[1], 10));
                        endTime.setSeconds(endParts.length > 2 ? parseInt(endParts[2], 10) : 0);
                        
                        const diffMs = endTime - now;
                        const diffMins = diffMs / 60000;

                        // If within last 5 minutes (and not already past by more than say, 30 mins just in case)
                        if (diffMins <= 5 && diffMins >= -30) {
                            triggerRecordingAlert(data);
                            alertTriggered = true;
                        }
                    }
                }
            })
            .catch(err => console.error('Error checking session:', err));
    }

    function playBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 500);
            
            // Second beep
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
                gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.start();
                setTimeout(() => osc2.stop(), 500);
            }, 700);

        } catch (e) {
            console.log("Audio API not supported or blocked");
        }
    }

    function triggerRecordingAlert(sessionData) {
        playBeep();
        
        // Create Modal Overlay
        const overlay = document.createElement('div');
        overlay.id = 'recording-modal-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.className = 'card bg-card-glass border border-primary/40 p-8 rounded-3xl max-w-2xl w-full mx-4 shadow-[0_0_50px_rgba(0,242,255,0.15)]';
        modal.innerHTML = `
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2z"/></svg>
                </div>
                <h2 class="text-2xl font-black text-white uppercase tracking-wider italic m-0">End of Session Recording</h2>
                <p class="text-text-dim text-[0.7rem] uppercase tracking-widest mt-2 italic">You have 5 minutes left for class: ${sessionData.class_name}. Please record a 2-minute summary of the topic: ${sessionData.topic}.</p>
            </div>
            
            <div class="relative bg-black/50 rounded-2xl overflow-hidden border border-border-glass aspect-video mb-6">
                <video id="preview-video" autoplay muted class="w-full h-full object-cover"></video>
                <div id="recording-indicator" class="absolute top-4 right-4 bg-red-600/90 text-white text-[0.6rem] font-black uppercase tracking-widest px-3 py-1 rounded-full hidden items-center gap-2">
                    <span class="w-2 h-2 bg-white rounded-full animate-ping"></span> REC
                </div>
                <div id="timer-display" class="absolute bottom-4 right-4 bg-black/70 text-white font-mono text-sm px-3 py-1 rounded-xl hidden">00:00</div>
            </div>
            
            <div class="mb-6 hidden" id="transcript-container">
                <label class="text-[0.65rem] font-black text-primary uppercase tracking-[0.25em] mb-2 block italic">Live Transcript</label>
                <div id="transcript-text" class="text-sm text-text-dim italic bg-black/30 p-4 rounded-xl border border-white/5 min-h-[60px] max-h-[120px] overflow-y-auto"></div>
            </div>

            <div class="flex justify-center gap-4">
                <button id="start-record-btn" class="btn btn-primary h-14 px-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark border-none font-black shadow-xl uppercase tracking-[0.2em] italic text-xs">Start Recording</button>
                <button id="stop-record-btn" class="btn h-14 px-10 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/50 hover:bg-red-600 hover:text-white font-black shadow-xl uppercase tracking-[0.2em] italic text-xs hidden">Stop Recording</button>
                <button id="dismiss-btn" class="btn bg-transparent border border-border-glass text-text-dim h-14 px-8 rounded-2xl hover:text-white font-black uppercase tracking-[0.2em] italic text-xs">Dismiss</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        setupRecordingLogic(sessionData.session_id);
    }

    function setupRecordingLogic(sessionId) {
        const previewVideo = document.getElementById('preview-video');
        const startBtn = document.getElementById('start-record-btn');
        const stopBtn = document.getElementById('stop-record-btn');
        const dismissBtn = document.getElementById('dismiss-btn');
        const recIndicator = document.getElementById('recording-indicator');
        const timerDisplay = document.getElementById('timer-display');
        const transcriptContainer = document.getElementById('transcript-container');
        const transcriptText = document.getElementById('transcript-text');
        
        let mediaRecorder;
        let recordedChunks = [];
        let stream;
        let recognition;
        let finalTranscript = '';
        let timerInterval;
        let startTime;

        dismissBtn.addEventListener('click', () => {
            if(stream) stream.getTracks().forEach(t => t.stop());
            document.getElementById('recording-modal-overlay').remove();
            alertTriggered = true; // don't show again this session
        });

        startBtn.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                previewVideo.srcObject = stream;
                
                // Audio + Video
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
                
                mediaRecorder.ondataavailable = e => {
                    if (e.data.size > 0) recordedChunks.push(e.data);
                };
                
                mediaRecorder.onstop = () => {
                    clearInterval(timerInterval);
                    recIndicator.style.display = 'none';
                    if(recognition) recognition.stop();
                    
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    uploadRecording(blob, finalTranscript, sessionId);
                };
                
                // Speech Recognition Setup
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    recognition = new SpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    
                    recognition.onresult = (event) => {
                        let interim = '';
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                                finalTranscript += event.results[i][0].transcript + ' ';
                            } else {
                                interim += event.results[i][0].transcript;
                            }
                        }
                        transcriptText.innerHTML = finalTranscript + '<i class="text-white/50">' + interim + '</i>';
                    };
                    recognition.start();
                    transcriptContainer.style.display = 'block';
                }
                
                // Start recording
                mediaRecorder.start();
                startBtn.style.display = 'none';
                dismissBtn.style.display = 'none';
                stopBtn.style.display = 'block';
                recIndicator.style.display = 'flex';
                timerDisplay.style.display = 'block';
                
                startTime = Date.now();
                timerInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
                    const secs = (elapsed % 60).toString().padStart(2, '0');
                    timerDisplay.innerText = `${mins}:${secs}`;
                    
                    // Auto stop at 2 minutes (120 seconds)
                    if (elapsed >= 120) {
                        stopBtn.click();
                    }
                }, 1000);
                
            } catch(e) {
                console.error('Error accessing media devices.', e);
                alert('Could not access camera/microphone. Please ensure permissions are granted.');
            }
        });
        
        stopBtn.addEventListener('click', () => {
            stopBtn.disabled = true;
            stopBtn.innerText = 'UPLOADING...';
            mediaRecorder.stop();
            if(stream) stream.getTracks().forEach(t => t.stop());
        });
    }

    function uploadRecording(videoBlob, transcript, sessionId) {
        const formData = new FormData();
        formData.append('video', videoBlob, 'session.webm');
        formData.append('transcript', transcript);
        formData.append('session_id', sessionId);
        
        fetch('/upload_session_recording', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Recording uploaded successfully!');
                document.getElementById('recording-modal-overlay').remove();
            } else {
                alert('Upload failed: ' + data.message);
                document.getElementById('stop-record-btn').innerText = 'UPLOAD FAILED';
            }
        })
        .catch(err => {
            console.error(err);
            alert('Upload error.');
        });
    }
});
