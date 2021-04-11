const AudioContext = window.AudioContext || window.webkitAudioContext;
URL = window.URL || window.webkitURL;

const audioTypeSelect = document.getElementById("audioTypeSelect");
const startRecordBtn = document.getElementById("startBtn");
const stopRecordBtn = document.getElementById("stopBtn");
const recordingList = document.getElementById("recordingList");
const playAudioBtn = document.getElementById("playBtn");

startRecordBtn.addEventListener("click", startRecord);
stopRecordBtn.addEventListener("click", stopRecord);

let audioContext, input, encodingType, recorder, curStream;
let state = "play";

// make animation for play audio btn
const animation = lottie.loadAnimation({
  container: playAudioBtn,
  path:
    "https://maxst.icons8.com/vue-static/landings/animated-icons/icons/pause/pause.json",
  renderer: "svg",
  loop: false,
  autoplay: false,
  name: "Demo Audio",
});

animation.goToAndStop(14, true);
playAudioBtn.addEventListener("click", () => {
  if (state === "play") {
    animation.playSegments([14, 27], true);
    state = "pause";
  } else {
    animation.playSegments([0, 14], true);
    state = "play";
  }
});
//end make animation for paly audio btn

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
