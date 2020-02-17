export function synthetizeAudio(voice,lbl){
	let msg = new SpeechSynthesisUtterance()
          msg.voice = voice.getVoices().find(t => t.lang === 'it-IT' && t.localService === true)
          msg.volume = 1
          msg.text = lbl
          voice.speak(msg)
}