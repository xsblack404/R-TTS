class VideoTranslator {
    constructor() {
        // UI Elements
        this.dropArea = document.getElementById('drop-area');
        this.fileInput = document.getElementById('file-input');
        this.uploadSection = document.getElementById('upload-section');
        this.workspaceSection = document.getElementById('workspace-section');
        this.progressContainer = document.getElementById('progress-container');
        this.progressBar = document.getElementById('progress-bar');
        this.progressStatus = document.getElementById('progress-status');
        this.progressPercent = document.getElementById('progress-percent');
        this.videoPlayer = document.getElementById('main-video');
        this.transcriptList = document.getElementById('transcript-list');
        this.downloadBtn = document.getElementById('download-vtt');
        this.resetBtn = document.getElementById('reset-app');

        this.subtitles = []; // Store subtitle objects
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Drag and Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        this.dropArea.addEventListener('dragenter', () => this.dropArea.classList.add('drag-over'));
        this.dropArea.addEventListener('dragleave', () => this.dropArea.classList.remove('drag-over'));
        this.dropArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // File Input
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Video Time Update (Sync transcript highlight)
        this.videoPlayer.addEventListener('timeupdate', () => this.highlightTranscript());

        // Buttons
        this.downloadBtn.addEventListener('click', () => this.downloadVTTFile());
        this.resetBtn.addEventListener('click', () => location.reload());
    }

    handleDrop(e) {
        this.dropArea.classList.remove('drag-over');
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('video/')) {
                this.startProcess(file);
            } else {
                alert('Please upload a valid video file.');
            }
        }
    }

    // Workflow Controller
    async startProcess(file) {
        // 1. Show Upload UI
        this.dropArea.classList.add('hidden');
        this.progressContainer.classList.remove('hidden');

        // 2. Load Video locally for preview
        const fileURL = URL.createObjectURL(file);
        this.videoPlayer.src = fileURL;

        // 3. Simulate Upload
        await this.simulateProgress('Uploading to Secure Server...', 0, 30, 1000);

        // 4. Simulate AI Processing (Transcription + Translation)
        await this.simulateProgress('Extracting Audio...', 30, 50, 800);
        await this.simulateProgress('AI Transcribing (Russian)...', 50, 70, 1200);
        await this.simulateProgress('Translating to English...', 70, 90, 1200);
        await this.simulateProgress('Finalizing Timestamps...', 90, 100, 500);

        // 5. Get Data (Mocked)
        this.subtitles = this.getMockSubtitles();

        // 6. Generate VTT and Attach to Video
        this.attachSubtitlesToVideo();

        // 7. Render Side UI
        this.renderTranscriptUI();

        // 8. Switch Views
        this.uploadSection.classList.add('hidden');
        this.workspaceSection.classList.remove('hidden');
    }

    simulateProgress(statusText, start, end, duration) {
        return new Promise(resolve => {
            this.progressStatus.innerText = statusText;
            let current = start;
            const stepTime = duration / (end - start);
            
            const timer = setInterval(() => {
                current++;
                this.progressBar.style.width = `${current}%`;
                this.progressPercent.innerText = `${current}%`;
                
                if (current >= end) {
                    clearInterval(timer);
                    resolve();
                }
            }, stepTime);
        });
    }

    // --- Core Logic: VTT Generation ---

    // MOCK DATA: In a real app, this comes from your backend API (Whisper/DeepL)
    getMockSubtitles() {
        return [
            { id: 1, start: 0.5, end: 2.5, text: "Hello everyone, and welcome to our enterprise demo." },
            { id: 2, start: 2.8, end: 5.0, text: "Today we are discussing the quarterly results." },
            { id: 3, start: 5.2, end: 8.0, text: "As you can see from the charts, growth is steady." },
            { id: 4, start: 8.5, end: 11.0, text: "We need to focus on our Russian market specifically." },
            { id: 5, start: 11.5, end: 14.0, text: "Let's move on to the next slide, please." }
        ];
    }

    // Convert Seconds to VTT Time Format (HH:MM:SS.ms)
    formatTime(seconds) {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds();
        const ms = date.getUTCMilliseconds();
        
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    }

    generateVTTContent() {
        let vtt = "WEBVTT\n\n";
        this.subtitles.forEach(sub => {
            vtt += `${this.formatTime(sub.start)} --> ${this.formatTime(sub.end)}\n`;
            vtt += `${sub.text}\n\n`;
        });
        return vtt;
    }

    attachSubtitlesToVideo() {
        const vttContent = this.generateVTTContent();
        const blob = new Blob([vttContent], { type: "text/vtt" });
        const trackURL = URL.createObjectURL(blob);

        // Remove old tracks
        const oldTrack = this.videoPlayer.querySelector('track');
        if (oldTrack) oldTrack.remove();

        const track = document.createElement("track");
        track.kind = "captions";
        track.label = "English";
        track.srclang = "en";
        track.src = trackURL;
        track.default = true;
        
        this.videoPlayer.appendChild(track);
        // Force the track to show
        this.videoPlayer.textTracks[0].mode = "showing";
    }

    // --- UI Logic ---

    renderTranscriptUI() {
        this.transcriptList.innerHTML = '';
        this.subtitles.forEach(sub => {
            const el = document.createElement('div');
            el.className = 'transcript-item';
            el.dataset.start = sub.start;
            el.innerHTML = `
                <span class="timestamp">${this.formatTime(sub.start)}</span>
                <span class="text">${sub.text}</span>
            `;
            
            // Click to seek video
            el.addEventListener('click', () => {
                this.videoPlayer.currentTime = sub.start;
                this.videoPlayer.play();
            });

            this.transcriptList.appendChild(el);
        });
    }

    highlightTranscript() {
        const time = this.videoPlayer.currentTime;
        const items = document.querySelectorAll('.transcript-item');
        
        items.forEach((item, index) => {
            const sub = this.subtitles[index];
            if (time >= sub.start && time < sub.end) {
                item.classList.add('active');
                item.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                item.classList.remove('active');
            }
        });
    }

    downloadVTTFile() {
        const vttContent = this.generateVTTContent();
        const blob = new Blob([vttContent], { type: "text/vtt" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "subtitles_en.vtt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new VideoTranslator();
});
