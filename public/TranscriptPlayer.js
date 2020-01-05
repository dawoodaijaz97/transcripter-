function TranscriptPlayerClass(audio_file_path,transcript_json_path) {
    this.audio_file_path = audio_file_path;
    this.transcript_json_path = transcript_json_path;


    this.set_player = function () {
        $("audio").attr("src",this.audio_file_path);
        $("audio").attr("transcript",this.transcript_json_path);
    }
}


let audio_file_path ="https://storage.googleapis.com/music-app-bucket-3/uncooperativeness.mp3";
let json_file_path ="./files/uncooperativeness.json";

let transcript_player_obj = new TranscriptPlayerClass(audio_file_path,json_file_path);

transcript_player_obj.set_player();