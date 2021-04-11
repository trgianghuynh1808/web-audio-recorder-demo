const AudioContext = window.AudioContext || window.webkitAudioContext;
URL = window.URL || window.webkitURL;

const audioTypeSelect = document.getElementById("audioTypeSelect");
const startRecordBtn = document.getElementById("start-btn");
const stopRecordBtn = document.getElementById("stop-btn");
const recordingList = document.getElementById("recording-list");
const playAudioBtn = document.getElementById("play-icon");
const muteAudioBtn = document.getElementById("mute-icon");
const seekSlider = document.getElementById("seek-slider");
const volumeSlider = document.getElementById("volume-slider");
const audioPlayerContainer = document.getElementById("audio-player-container");

let audioContext, input, encodingType, recorder, curStream;
let playState = "play";
let muteState = "unmute";

startRecordBtn.addEventListener("click", startRecord);
stopRecordBtn.addEventListener("click", stopRecord);

// make animation for play audio btn
const playAnimation = lottie.loadAnimation({
  container: playAudioBtn,
  path:
    "https://maxst.icons8.com/vue-static/landings/animated-icons/icons/pause/pause.json",
  renderer: "svg",
  loop: false,
  autoplay: false,
  name: "Play Animation",
});

playAnimation.goToAndStop(14, true);

playAudioBtn.addEventListener("click", () => {
  if (playState === "play") {
    playAnimation.playSegments([14, 27], true);
    playState = "pause";
  } else {
    playAnimation.playSegments([0, 14], true);
    playState = "play";
  }
});
//end make animation for play audio btn

// make animation for mute audio btn
const muteAnimation = lottie.loadAnimation({
  container: muteAudioBtn,
  path:
    "https://maxst.icons8.com/vue-static/landings/animated-icons/icons/mute/mute.json",
  renderer: "svg",
  loop: false,
  autoplay: false,
  name: "Mute Animation",
});

muteAudioBtn.addEventListener("click", () => {
  if (muteState === "unmute") {
    muteAnimation.playSegments([0, 15], true);
    muteState = "mute";
  } else {
    muteAnimation.playSegments([15, 25], true);
    muteState = "unmute";
  }
});
// end make animation for mute audio btn

seekSlider.addEventListener("input", (e) => {
  showRangeProgress(e.target);
});

volumeSlider.addEventListener("input", (e) => {
  showRangeProgress(e.target);
});

function startRecord() {
  const constraints = { audio: true, video: false };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      audioContext = new AudioContext();
      input = audioContext.createMediaStreamSource(stream);
      curStream = stream;

      //get encoding type from select
      encodingType =
        audioTypeSelect.options[audioTypeSelect.selectedIndex].value;
      audioTypeSelect.disabled = true;

      recorder = new WebAudioRecorder(input, {
        workerDir: "libs/",
        encoding: encodingType,
      });

      recorder.onComplete = function (recorder, blob) {
        audioTypeSelect.disabled = false;
        createAudio(blob, recorder.encoding);
      };

      recorder.setOptions({
        timeLimit: 120,
        encodeAfterRecord: true,
        ogg: { quality: 0.5 },
        mp3: { bitRate: 160 },
      });

      recorder.startRecording();

      startRecordBtn.disabled = true;
      stopRecordBtn.disabled = false;
    })
    .catch(function () {
      startRecordBtn.disabled = false;
      stopRecordBtn.disabled = true;
    });
}

function stopRecord() {
  //stop mic access
  curStream.getAudioTracks()[0].stop();

  stopRecordBtn.disabled = true;
  startRecordBtn.disabled = false;

  recorder.finishRecording();
}

function createAudio(blob, encoding) {
  const url = URL.createObjectURL(blob);
  const audioEle = document.createElement("audio");
  const liEle = document.createElement("li");
  const linkEle = document.createElement("a");

  //add src & control for audio element
  audioEle.controls = false;
  audioEle.src = url;

  //create link download from blob
  linkEle.href = url;
  linkEle.download = new Date().toISOString() + "." + encoding;
  linkEle.innerHTML = linkEle.download;

  liEle.appendChild(audioEle);
  liEle.appendChild(linkEle);

  recordingList.appendChild(liEle);
}

const showRangeProgress = (rangeInput) => {
  if (rangeInput === seekSlider) {
    audioPlayerContainer.style.setProperty(
      "--seek-before-width",
      (rangeInput.value / rangeInput.max) * 100 + "%"
    );
  } else {
    audioPlayerContainer.style.setProperty(
      "--volume-before-width",
      (rangeInput.value / rangeInput.max) * 100 + "%"
    );
  }
};
