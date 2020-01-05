

This Web app is built using HTML,CSS, and JS
Bootstrap 4 for styling 
Wavesurfer.js for MP3 player


"index.html"
  1.Runs the summary transcript 
  2. Move forward-backward in the summary
  3.Switch to the full audio
  4.View Full transcript
  5. Highlight only sentences for the summary and highlight each word incase of "full transcript mode"
  
  Note: The player used on this page is a js library called "wavesurfer" to create the mp3 player
  
"play_complete.html"
  1.Play full audio with the highlight of each word in the subtitle
  
  Note: The player used on this page is a js library called "wavesurfer" to create the mp3 player
  
"speakers.html"
  1.Plays full audio
  2. Display the transcript separately for each speaker "speaker 1 and speaker 2"
  3.Highlight each word of the subtitles 
  
  Note The player used on this page "HTML audio tag" to create the mp3 player. The HTML audio tag has its own controls


#Following are the steps for adding new audio with transcript

1. Add the "JSON"  file and the mp3 files in the files folder

"For index.html"

2a.Add the path of mp3 file  "wavesurfer.load('/path')"  in main.js

2b. Add the path of "full script JSON" file to   "await fetch("./files/summary_sentences.json") in the read_json2 function" in main.js

2c. Add the path of "summary script JSON" file to   "await fetch("./files/summary_sentences.json") in the read_json function" in main.js

"For play_complete.html"
3a.Add the path of mp3 file  "wavesurfer.load('/path')" for main.js and main2.js

3b. Add the path of "full script JSON" file to   "await fetch("./files/summary_sentences.json") in the read_json2 function" in main2.js

"the below steps are for speaker.HTML"

4a. Incase of speaker.html add the mp3 file path to following 
<audio controls src="/path.mp3">

4b.Add the path of "summary script JSON" file to   "await fetch("./files/summary_sentences.json") in the read_json function in playerHandler.js"


`





