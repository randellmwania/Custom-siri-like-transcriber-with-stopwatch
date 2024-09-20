let startTime;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;

const stopwatch = document.getElementById("stopwatch");
const startStopButton = document.getElementById("startStop");
const resetButton = document.getElementById("reset");
const transcriptionDiv = document.getElementById("transcription");
const progressRing = document.querySelector(".progress-ring");

function startStop() {
  if (isRunning) {
    clearInterval(timerInterval);
    startStopButton.textContent = "Start";
    isRunning = false;
    recognition.stop();
    progressRing.style.animationPlayState = "paused";
  } else {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTime, 10);
    startStopButton.textContent = "Stop";
    isRunning = true;
    recognition.start();
    progressRing.style.animationPlayState = "running";
  }
}

function reset() {
  clearInterval(timerInterval);
  stopwatch.textContent = "00:00:00";
  elapsedTime = 0;
  isRunning = false;
  startStopButton.textContent = "Start";
  transcriptionDiv.textContent = "";
  recognition.stop();
  progressRing.style.animationPlayState = "paused";
}

function updateTime() {
  elapsedTime = Date.now() - startTime;
  let hours = Math.floor(elapsedTime / 3600000);
  let minutes = Math.floor((elapsedTime % 3600000) / 60000);
  let seconds = Math.floor((elapsedTime % 60000) / 1000);
  hours = String(hours).padStart(2, "0");
  minutes = String(minutes).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");
  stopwatch.textContent = `${hours}:${minutes}:${seconds}`;
}

startStopButton.addEventListener("click", startStop);
resetButton.addEventListener("click", reset);

// Speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

// Text-to-speech functionality
const synth = window.speechSynthesis;

function speak(text) {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

// Voice commands and transcription
recognition.onresult = (event) => {
  let interimTranscript = "";
  let finalTranscript = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript + " ";
      handleVoiceCommand(transcript.trim().toLowerCase());
    } else {
      interimTranscript += transcript;
    }
  }

  transcriptionDiv.innerHTML =
    finalTranscript + '<i style="color: #999;">' + interimTranscript + "</i>";
};

recognition.onerror = (event) => {
  console.error("Speech recognition error", event.error);
};

function handleVoiceCommand(command) {
  switch (command) {
    case "start":
      if (!isRunning) startStop();
      speak("Stopwatch started");
      break;
    case "stop":
      if (isRunning) startStop();
      speak("Stopwatch stopped");
      break;
    case "reset":
      reset();
      speak("Stopwatch reset");
      break;
    case "what's the time":
      speak("The current stopwatch time is " + stopwatch.textContent);
      break;
  }
}

// Start recognition when the page loads
recognition.start();
