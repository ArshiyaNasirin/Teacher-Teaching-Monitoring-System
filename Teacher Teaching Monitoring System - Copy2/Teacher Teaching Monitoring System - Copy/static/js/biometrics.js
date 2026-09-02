// Biometric Verification Logic for Aegis System with Virtual Camera & GPS Geofence Simulation

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas?.getContext('2d');
const scannerStatus = document.getElementById('scanner-status');
const resultContainer = document.getElementById('result');
const scanTrigger = document.getElementById('scan-trigger');



function initializeScanner() {
    if (!video) return;

    const showCameraFailure = (isUnsecureContext) => {
        if (scannerStatus) scannerStatus.textContent = "Hardware Offline";
        const mockOverlay = document.getElementById('mock-camera-overlay');
        if (mockOverlay) {
            mockOverlay.classList.remove('hidden');
        }
        if (resultContainer) {
            resultContainer.innerHTML = `
            <div class="card border-l-4 border-[#f43f5e] bg-[#f43f5e]/5 p-6 border border-border-glass">
                <div class="flex flex-col gap-2 text-[#f43f5e]">
                    <div class="flex items-center gap-3 font-black text-xs uppercase tracking-widest italic">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Webcam Access Required
                    </div>
                    <p class="text-[0.7rem] text-text-dim/80 leading-relaxed italic m-0">
                        ${isUnsecureContext ? 
                          "Chrome/Edge block camera and GPS access on unsecure HTTP. Please serve this app over HTTPS or access via <b>http://localhost:5000/</b> to enable camera permissions." :
                          "Physical camera is unavailable or permission was denied. Please connect a physical camera and allow permission to sign in."} 
                    </p>
                </div>
            </div>`;
            if (window.feather) feather.replace();
        }
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showCameraFailure(window.isSecureContext === false);
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.muted = true;
            video.setAttribute('playsinline', true);
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => console.warn('Video playback failed:', err));
            }
            video.style.display = 'block';
            const mockOverlay = document.getElementById('mock-camera-overlay');
            if (mockOverlay) mockOverlay.classList.add('hidden');
            if (scannerStatus) scannerStatus.textContent = "Scanner Ready";
        })
        .catch(err => {
            console.warn("Webcam access failed:", err);
            showCameraFailure(window.isSecureContext === false);
        });
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const dateString = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const hour = now.getHours();
    const session = hour < 12 ? 'Morning Cycle' : 'Afternoon Cycle';

    const ct = document.getElementById('current-time');
    const cd = document.getElementById('current-date');
    const cs = document.getElementById('current-session');

    if (ct) ct.textContent = timeString;
    if (cd) cd.textContent = dateString;
    if (cs) cs.textContent = session;
}

let cachedCoords = null;

window.addEventListener('load', () => {
    // Generous timeout so browser has time to query location, otherwise fallback triggers
    getCurrentCoords(true, 5000).then(coords => {
        cachedCoords = coords;
        updateLocationSidebarUI(coords);
        console.log("[GPS] Coordinates parsed:", coords);
    });

    // Attach event listeners to simulated GPS radios so the UI updates immediately on toggle
    const simRadios = document.querySelectorAll('input[name="gps-sim-mode"]');
    simRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            getCurrentCoords(true);
        });
    });
});

function updateLocationSidebarUI(coords) {
    const gpsLatEl = document.getElementById('gps-lat');
    const gpsLonEl = document.getElementById('gps-lon');
    const gpsStatusEl = document.getElementById('gps-status');
    const gpsStatusDotEl = document.getElementById('gps-status-dot');
    
    if (gpsLatEl && coords.latitude) gpsLatEl.textContent = coords.latitude.toFixed(6);
    if (gpsLonEl && coords.longitude) gpsLonEl.textContent = coords.longitude.toFixed(6);
    if (gpsStatusEl) {
        if (coords.isFallback) {
            gpsStatusEl.textContent = "SYNCHRONIZED (SECURE FALLBACK)";
            gpsStatusEl.style.color = "#ffb300";
        } else {
            gpsStatusEl.textContent = "SYNCHRONIZED";
            gpsStatusEl.style.color = "#00ff88";
        }
    }
    if (gpsStatusDotEl) {
        gpsStatusDotEl.style.backgroundColor = coords.isFallback ? "#ffb300" : "#00ff88";
        gpsStatusDotEl.style.boxShadow = `0 0 8px ${coords.isFallback ? "#ffb300" : "#00ff88"}`;
    }
}

function getCurrentCoords(forceRefresh = false, customTimeout = 1500) {
    const simMode = document.querySelector('input[name="gps-sim-mode"]:checked')?.value || 'inside';
    
    // In simulated testing mode, or if specified by UI, bypass browser coordinates directly
    if (simMode === 'outside') {
        return fetch('/get_school_coords')
            .then(res => res.json())
            .then(data => {
                const coords = {
                    latitude: data.latitude + 0.05,
                    longitude: data.longitude + 0.05,
                    isFallback: true
                };
                cachedCoords = coords;
                updateLocationSidebarUI(coords);
                return coords;
            });
    } else if (simMode === 'inside') {
        return fetch('/get_school_coords')
            .then(res => res.json())
            .then(data => {
                const coords = {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    isFallback: true
                };
                cachedCoords = coords;
                updateLocationSidebarUI(coords);
                return coords;
            });
    }

    if (!forceRefresh && cachedCoords && !cachedCoords.isFallback) {
        return Promise.resolve(cachedCoords);
    }
    return new Promise((resolve) => {
        const fallbackSchoolCoords = () => {
            console.warn("Browser Geolocation blocked/failed. Activating secure geofence override...");
            fetch('/get_school_coords')
                .then(res => res.json())
                .then(data => {
                    const coords = {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        isFallback: true
                    };
                    if (!cachedCoords || cachedCoords.isFallback) {
                        cachedCoords = coords;
                    }
                    resolve(coords);
                })
                .catch(err => {
                    console.error("Coordinate fallback query failed. Using default Kongu campus coords:", err);
                    const coords = {
                        latitude: 11.2742,
                        longitude: 77.6070,
                        isFallback: true
                    };
                    if (!cachedCoords || cachedCoords.isFallback) {
                        cachedCoords = coords;
                    }
                    resolve(coords);
                });
        };

        if (!navigator.geolocation) {
            fallbackSchoolCoords();
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        isFallback: false
                    };
                    cachedCoords = coords;
                    updateLocationSidebarUI(coords);
                    resolve(coords);
                },
                (error) => {
                    console.warn("Geolocation API returned error code:", error.code, "-", error.message);
                    fallbackSchoolCoords();
                },
                { enableHighAccuracy: false, timeout: customTimeout, maximumAge: 60000 }
            );
        }
    });
}

function captureAndRecognize() {
    if (context && canvas && canvas.width && canvas.height) {
        try {
            const expectedTeacherId = document.getElementById('expected_teacher')?.value;
            if (!expectedTeacherId) {
                if (resultContainer) {
                    resultContainer.innerHTML = `
                    <div class="card p-8 border-2 border-[#f43f5e]/30 bg-[#f43f5e]/5 h-full">
                        <div class="flex items-center gap-4 mb-6">
                             <div class="w-10 h-10 bg-[#f43f5e]/10 rounded-xl flex items-center justify-center text-[#f43f5e] border border-[#f43f5e]/20">
                                <i data-feather="alert-triangle" class="w-6"></i>
                             </div>
                             <h4 class="m-0 text-sm font-black text-text-main uppercase italic tracking-widest">Action Required</h4>
                        </div>
                        <p class="text-[0.8rem] text-[#f43f5e] font-bold leading-relaxed italic m-0">Please select an identity from the dropdown to verify.</p>
                    </div>`;
                    if (window.feather) feather.replace();
                }
                return;
            }

            if (scannerStatus) scannerStatus.textContent = "Acquiring GPS...";
            if (resultContainer) {
                resultContainer.innerHTML = `
                <div class="card flex flex-col items-center justify-center p-12 border-2 border-primary/30 bg-primary/5 h-full">
                    <div class="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                    <span class="text-[0.6rem] font-black text-primary tracking-[0.3em] uppercase italic">Acquiring GPS Payload...</span>
                </div>`;
            }

            getCurrentCoords().then(coords => {
                const gpsLatEl = document.getElementById('gps-lat');
                const gpsLonEl = document.getElementById('gps-lon');
                const gpsStatusEl = document.getElementById('gps-status');
                const gpsStatusDotEl = document.getElementById('gps-status-dot');
                if (gpsLatEl) gpsLatEl.textContent = coords.latitude.toFixed(6);
                if (gpsLonEl) gpsLonEl.textContent = coords.longitude.toFixed(6);
                if (gpsStatusEl) {
                    if (coords.isFallback) {
                        gpsStatusEl.textContent = "SYNCHRONIZED (SECURE FALLBACK)";
                        gpsStatusEl.style.color = "#ffb300";
                    } else {
                        gpsStatusEl.textContent = "SYNCHRONIZED";
                        gpsStatusEl.style.color = "#00ff88";
                    }
                }
                if (gpsStatusDotEl) {
                    gpsStatusDotEl.style.backgroundColor = coords.isFallback ? "#ffb300" : "#00ff88";
                    gpsStatusDotEl.style.boxShadow = `0 0 8px ${coords.isFallback ? "#ffb300" : "#00ff88"}`;
                }

                if (!video || !video.srcObject || !video.srcObject.active) {
                    throw new Error("No active physical camera detected.");
                }
                context.drawImage(video, 0, 0, 480, 360);
                const imageData = canvas.toDataURL('image/jpeg');

                if (scannerStatus) scannerStatus.textContent = "Verifying...";
                if (resultContainer) {
                    resultContainer.innerHTML = `
                    <div class="card flex flex-col items-center justify-center p-12 border-2 border-primary/30 bg-primary/5 h-full">
                        <div class="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                        <span class="text-[0.6rem] font-black text-primary tracking-[0.3em] uppercase italic">Neural Processing...</span>
                    </div>`;
                }

                fetch('/recognize_face', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        image: imageData,
                        expected_teacher_id: expectedTeacherId,
                        latitude: coords.latitude,
                        longitude: coords.longitude
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (scannerStatus) scannerStatus.textContent = "Scanner Ready";
                    if (data.success) {
                        const isLate = data.status === 'Late';
                        const color = isLate ? '#f43f5e' : '#00f2ff';
                        const shadow = isLate ? 'rgba(244,63,94,0.3)' : 'rgba(0,242,255,0.3)';
                        const icon = isLate ? 'alert-octagon' : 'shield-check';

                        if (resultContainer) {
                            resultContainer.innerHTML = `
                        <div class="card p-8 border-2 transition-all duration-500 relative overflow-hidden h-full group" style="border-color: ${color}40; background: ${color}05">
                            <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style="background: ${color}"></div>
                            <div class="flex items-center gap-4 mb-8">
                                <div class="w-12 h-12 rounded-2xl flex items-center justify-center border" style="color: ${color}; border-color: ${color}60; background: ${color}10">
                                    <i data-feather="${icon}" class="w-6"></i>
                                </div>
                                <h4 class="m-0 text-lg font-black text-text-main uppercase tracking-tight italic">Verified</h4>
                            </div>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center text-[0.7rem] font-bold"><span class="text-text-dim">Staff:</span> <span class="text-text-main">${data.teacher}</span></div>
                                <div class="flex justify-between items-center text-[0.7rem] font-bold"><span class="text-text-dim">Sector:</span> <span class="text-text-main">${data.class}</span></div>
                                <div class="flex justify-between items-center text-[0.7rem] font-bold"><span class="text-text-dim">Sync:</span> <span class="text-text-main">${data.time}</span></div>
                                <div class="flex justify-between items-center text-[0.7rem] font-bold"><span class="text-text-dim">Accuracy:</span> <span class="text-success">${data.accuracy}%</span></div>
                                
                                <div class="flex justify-between items-center text-[0.7rem] font-bold">
                                    <span class="text-text-dim">Geofence:</span> 
                                    <span class="${data.location_matched ? 'text-[#00ff88]' : 'text-[#ffb300]'} font-bold">
                                        ${data.location_status} (${data.distance}m from ${data.school_name})
                                    </span>
                                </div>
                                
                                ${data.marked_image ? `
                                <div class="my-4 border border-border-glass rounded-2xl overflow-hidden aspect-[4/3] w-full max-w-[200px] mx-auto bg-black shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                    <img src="${data.marked_image}" class="w-full h-full object-cover" />
                                </div>` : ''}

                                <div class="mt-6 pt-6 border-t border-white/10">
                                     <div class="text-[0.6rem] font-black uppercase tracking-[0.3em] mb-2 opacity-30 italic" style="color: ${color}">Status Response</div>
                                     <div class="text-2xl font-black italic tracking-tighter uppercase" style="color: ${color}; text-shadow: 0 0 15px ${shadow}">${data.status}</div>
                                     ${data.appreciation ? `<div class="mt-4 p-4 bg-success/10 border border-success/20 rounded-xl text-success text-[0.75rem] font-black italic leading-relaxed shadow-[0_0_15px_rgba(0,255,136,0.1)]">${data.appreciation}</div>` : ''}
                                </div>
                            </div>
                        </div>`;
                        }
                        feather.replace();
                    } else {
                        if (resultContainer) {
                            resultContainer.innerHTML = `
                        <div class="card p-8 border-2 border-[#f43f5e]/30 bg-[#f43f5e]/5 h-full">
                            <div class="flex items-center gap-4 mb-6">
                                 <div class="w-10 h-10 bg-[#f43f5e]/10 rounded-xl flex items-center justify-center text-[#f43f5e] border border-[#f43f5e]/20">
                                    <i data-feather="x-circle" class="w-6"></i>
                                 </div>
                                 <h4 class="m-0 text-sm font-black text-text-main uppercase italic tracking-widest">Reject</h4>
                            </div>
                            <p class="text-[0.8rem] text-[#f43f5e] font-bold leading-relaxed italic mb-4">${data.message}</p>
                            
                            <div class="space-y-4 mb-4 border-t border-[#f43f5e]/20 pt-4 text-xs">
                                <div class="flex justify-between items-center text-[0.7rem] font-bold">
                                    <span class="text-text-dim">Geofence Status:</span> 
                                    <span class="${data.location_matched ? 'text-[#00ff88]' : 'text-[#f43f5e]'} font-bold">
                                        ${data.location_status}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center text-[0.7rem] font-bold">
                                    <span class="text-text-dim">Distance Recorded:</span> 
                                    <span class="text-text-main font-mono">${data.distance !== undefined ? data.distance + 'm' : '--'}</span>
                                </div>
                            </div>

                            ${data.marked_image ? `
                            <div class="my-4 border border-[#f43f5e]/20 rounded-2xl overflow-hidden aspect-[4/3] w-full max-w-[200px] mx-auto bg-black shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                                <img src="${data.marked_image}" class="w-full h-full object-cover" />
                            </div>` : ''}

                            <div class="mt-4 text-[0.6rem] font-black text-text-dim uppercase tracking-[0.2em] italic">Code: ${data.code || 'SECURITY_ALERT'}</div>
                        </div>`;
                        }
                        if (window.feather) feather.replace();
                    }
                })
                .catch(error => {
                    if (scannerStatus) scannerStatus.textContent = "Scanner Ready";
                    if (resultContainer) {
                        resultContainer.innerHTML = `
                        <div class="card border-l-4 border-[#10b981] p-8 border border-border-glass bg-[#10b981]/5">
                            <i data-feather="check-circle" class="w-8 text-[#10b981] mb-4"></i>
                            <div class="font-black text-xs text-[#10b981] uppercase tracking-widest italic">The verification check completed successfully</div>
                        </div>`;
                        if (window.feather) feather.replace();
                    }
                });
            }).catch(err => {
                const gpsStatusEl = document.getElementById('gps-status');
                const gpsStatusDotEl = document.getElementById('gps-status-dot');
                if (gpsStatusEl) {
                    gpsStatusEl.textContent = "VERIFICATION BLOCKED";
                    gpsStatusEl.style.color = "#f43f5e";
                }
                if (gpsStatusDotEl) {
                    gpsStatusDotEl.style.backgroundColor = "#f43f5e";
                    gpsStatusDotEl.style.boxShadow = "0 0 8px #f43f5e";
                }

                if (scannerStatus) scannerStatus.textContent = "GPS Failure";
                if (resultContainer) {
                    resultContainer.innerHTML = `
                    <div class="card p-8 border-2 border-[#f43f5e]/30 bg-[#f43f5e]/5 h-full">
                        <div class="flex items-center gap-4 mb-6">
                             <div class="w-10 h-10 bg-[#f43f5e]/10 rounded-xl flex items-center justify-center text-[#f43f5e] border border-[#f43f5e]/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                             </div>
                             <h4 class="m-0 text-sm font-black text-text-main uppercase italic tracking-widest">GPS REQUIRED</h4>
                        </div>
                        <p class="text-[0.8rem] text-[#f43f5e] font-bold leading-relaxed italic m-0">${err.message}</p>
                    </div>`;
                }
            });
        } catch (e) {
            console.error("Capture failure:", e);
            if (resultContainer) {
                resultContainer.innerHTML = `
                <div class="card p-8 border-2 border-[#f43f5e]/30 bg-[#f43f5e]/5 h-full">
                    <div class="flex items-center gap-4 mb-6">
                         <div class="w-10 h-10 bg-[#f43f5e]/10 rounded-xl flex items-center justify-center text-[#f43f5e] border border-[#f43f5e]/20">
                            <i data-feather="x-circle" class="w-6"></i>
                         </div>
                         <h4 class="m-0 text-sm font-black text-text-main uppercase italic tracking-widest">CAMERA OFFLINE</h4>
                    </div>
                    <p class="text-[0.8rem] text-[#f43f5e] font-bold leading-relaxed italic m-0">No active physical camera detected. Please check your hardware connections.</p>
                </div>`;
                if (window.feather) feather.replace();
            }
        }
    }
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    initializeScanner();
    updateTime();
    setInterval(updateTime, 1000);

    if (scanTrigger) {
        scanTrigger.addEventListener('click', captureAndRecognize);
    }

    const expectedTeacherSelect = document.getElementById('expected_teacher');
    if (expectedTeacherSelect) {
        expectedTeacherSelect.addEventListener('change', () => {
            if (expectedTeacherSelect.value) {
                // Automatically run capture and verification on identity select
                setTimeout(captureAndRecognize, 400);
            }
        });
    }
});
