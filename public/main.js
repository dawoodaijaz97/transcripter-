// noinspection JSUnresolvedFunction


$("document").ready(function () {

    const read_json = async () => {
        let response = await fetch("./files/summary_sentences.json");
        let data = await response.json();
        scripts = data["details"];
        current = scripts[0];
        let seek = current["start_time"] / total_duration;
        wavesurfer.seekAndCenter(seek);
        sub_text.text(current["content"]);
        summary_string = data["summary"];
        set_text_summary(current["content"])
    };
    const read_json2 = async () => {
        let response = await fetch("./files/full_transcript.json");
        let data = await response.json();
        segments = data["results"]["speaker_labels"]["segments"];
        words = data["results"]["items"];
        current_segment = segments[0];
        next_segment = segments[1];
        current_segment_index = 0;
        sentence = getSentence(current_segment);
        full_string = data["results"]["transcripts"][0]["transcript"];

    };

    const getSentence = function (segment) {
        let sentence = "";
        let segment_start_time = parseFloat(segment["start_time"]);
        let segment_end_time = parseFloat(segment["end_time"]);
        let i = last_word_index;
        while (1) {
            if (words[i]["end_time"] !== undefined && words[i]["start_time"] !== undefined) {
                if (segment_end_time < parseFloat(words[i]["end_time"])) {
                    console.log(sentence);
                    console.log("0:",sentence[0]);
                    console.log("1:",sentence[1]);
                    console.log("2:",sentence[2]);
                    if(sentence[1] === ".")
                        sentence = sentence.substring(4,);
                    else
                        sentence = sentence.substring(1,);
                    console.log(sentence);
                    return sentence;
                }
                else if (parseFloat(words[i]["end_time"]) <= segment_end_time && parseFloat(words[i]["start_time"]) >= segment_start_time) {
                    if (words[i]["alternatives"][0]["content"] !== null) {
                        sentence = sentence + " " + words[i]["alternatives"][0]["content"];
                        last_word_index = i;
                    }
                }
            }
            else{
                sentence = sentence + words[i]["alternatives"][0]["content"];
                last_word_index = i;
            }
            i++;
        }
    };
    const set_text_summary = function(sentence){
        console.log(sentence);
        let i = summary_string.search(sentence);
        let left_text = summary_string.substring(0,i);
        let right_text = summary_string.substring(i+sentence.length,);
        $(".transcript .left").text(left_text);
        $(".transcript .centre").text(sentence);
        $(".transcript .right").text(right_text);


    };
    const set_text_full = function(sentence){

        console.log(sentence);
        let list_of_words  = sentence.split(" ");
        let i = full_string.indexOf(sentence,skip);
        if (i ===-1)
            i = full_string.indexOf(list_of_words[0],skip);
        skip = i+sentence.length;
        console.log("skip"+skip);
        console.log("i"+i);
        let left_text = full_string.substring(0,i);
        let right_text = full_string.substring(i+sentence.length,);
        $(".transcript .left").text(left_text);
        $(".transcript .centre").text(sentence);
        $(".transcript .right").text(right_text);

    };

    $("#play_pause").attr("disabled", true);
    $("#mute_unmute").attr("disabled", true);
    $("#next").attr("disabled", true);
    $("#prev").attr("disabled", true);
    $("#slider").slider({
        range: "min",
        min: 0,
        max: 1,
        value: 0.5,
        step: 0.01,
        slide: function (event, ui) {
            wavesurfer.setVolume(ui.value);
            if ($("#mute_unmute").hasClass("soundOff")) {
                $("#mute_unmute").addClass("sound").removeClass("soundOff").find("i").addClass("fa-volume-mute").removeClass("fa-volume-up");
                wavesurfer.setVolume(ui.value)
            }
        },

    });

    // noinspection JSUnresolvedVariable
    let total_duration = 0;
    let sub_text = $(".subs");
    let scripts = null;
    let segments;
    let words;
    let current;
    let current_index = 0;
    let play_mode = "summary";
    let current_segment_index = 0;
    let current_segment;
    let next_segment;
    let sentence = "";
    let last_word_index = 0;
    let summary_string;
    let full_string;
    let skip;


    // noinspection JSUnresolvedVariable
    let wavesurfer = WaveSurfer.create({
        container: "#waveform",
        hideScrollbar: true,
        fillParent: true,
        height: 80,
        progressColor: "#F5F5DC",
        cursorColor: "#007066",
        waveColor: "#b3b3b3",
        responsive: true,
        backend: "MediaElement",
        minPxPerSec:20,
        partialRender:true,
        pixelRatio:1,
        barWidth:3
    });
    // wavesurfer.load('https://storage.googleapis.com/music-app-bucket-3/audio_file.mp3');
    wavesurfer.load('./files/audio_file.mp3');


    wavesurfer.on("ready", function () {
        total_duration = wavesurfer.getDuration();
        $(".subs_area").removeClass("hide");
        $(".spinner-border").parent().addClass("hide");
        let current_dur = wavesurfer.getCurrentTime();
        read_json();
        read_json2();
        $("#play_pause").attr("disabled", false);
        $("#mute_unmute").attr("disabled", false);
        $("#next").attr("disabled", false);
        $("#prev").attr("disabled", false);
    });

    wavesurfer.on("audioprocess", function () {
        if (play_mode === "summary") {
            let progress = wavesurfer.getCurrentTime();
            if (progress >= current["end_time"]) {
                current_index = current_index + 1;
                current = scripts[current_index];
                let seek = current["start_time"] / total_duration;
                wavesurfer.seekAndCenter(seek);
                sub_text.text(current["content"]);
                set_text_summary(current["content"]);
            }
        } else {
            let progress = wavesurfer.getCurrentTime();
            progress = parseFloat(progress);
            if (progress >= parseFloat(next_segment["start_time"])) {
                current_segment_index = current_segment_index + 1;
                current_segment = segments[current_segment_index];
                next_segment = segments[current_segment_index + 1];
                sentence = getSentence(current_segment);
                sub_text.text(sentence);
                set_text_full(sentence);
            }
        }
    });

    $("#play_pause").on("click", function () {
        if ($(this).hasClass("play")) {
            $(this).find("i").removeClass("fa-play").addClass("fa-pause-circle");
            $(this).removeClass("play").addClass("stop");
            wavesurfer.play();
        } else {
            $(this).find("i").removeClass("fa-pause-circle").addClass("fa-play");
            $(this).removeClass("stop").addClass("play");
            wavesurfer.pause();
        }

    });


    $("#mute_unmute").on("click", function (event, data) {

        let btn = $(this);
        if (btn.hasClass("sound")) {
            btn.addClass("soundOff").removeClass("sound").find("i").addClass("fa-volume-up").removeClass("fa-volume-mute");
            wavesurfer.toggleMute();
        } else {
            btn.addClass("sound").removeClass("soundOff").find("i").addClass("fa-volume-mute").removeClass("fa-volume-up");

            wavesurfer.toggleMute();
            let val = $("#slider").slider("option", "value");
            wavesurfer.setVolume(val)
        }

    });

    $("#next").on("click", function (event, data) {
        wavesurfer.pause();
        current_index = current_index + 1;
        current = scripts[current_index];
        let seek_to = current["start_time"] / total_duration;
        wavesurfer.seekAndCenter(seek_to);
        sub_text.text(current["content"]);
        set_text_summary(current["content"]);
        wavesurfer.play();
    });
    $("#prev").on("click", function (event, data) {
        wavesurfer.pause();
        current_index = current_index - 1;
        current = scripts[current_index];
        let seek_to = current["start_time"] / total_duration;
        wavesurfer.seekAndCenter(seek_to);
        sub_text.text(current["content"]);
        set_text_summary(current["content"]);
        wavesurfer.play();
    });
    $("#full_short").on("click", function (event, data) {
        wavesurfer.pause();
        if (play_mode === "summary") {
            $(this).text("Play Summary");
            play_mode = "full";
            let i = 0;
            while (i<segments.length) {
                let progress = wavesurfer.getCurrentTime();
                progress = parseFloat(progress);
                if (progress >= parseFloat(segments[i]["start_time"]) && progress <= parseFloat(segments[i]["end_time"])) {
                    current_segment_index = i;
                    current_segment = segments[current_segment_index];
                    let seek_to = current_segment["start_time"] / total_duration;
                    wavesurfer.seekAndCenter(seek_to);
                    sentence = getSentence(current_segment);
                    sub_text.text(sentence);
                    set_text_full(sentence);
                    break;
                }
                i++;
            }
        } else {
            $(this).text("Play Full");
            play_mode = "summary";
            let i = 0;
            let get = false;
            while (i<scripts.length) {
                let progress = wavesurfer.getCurrentTime();
                progress = parseFloat(progress);
                if (progress >= parseFloat(scripts[i]["start_time"]) && progress <= parseFloat(scripts[i]["end_time"])) {
                    current_index = i;
                    current = scripts[current_index];
                    let seek_to = current["start_time"] / total_duration;
                    sub_text.text(current["content"]);
                    set_text_summary(current["content"]);
                    wavesurfer.seekAndCenter(seek_to);
                    get = true;
                    break;
                }
                i++
            }
            i = 0;
            if(!get){
                let min_distance = 100000;
                let selected_segment = 0;
                while(i<scripts.length){
                    let progress = wavesurfer.getCurrentTime();
                    progress = parseFloat(progress);
                    let start_time = parseFloat(scripts[i]["start_time"]);
                    let distance = Math.abs(progress-start_time);
                    if(distance<min_distance){
                        min_distance = distance;
                        selected_segment = i;
                    }
                    i++
                }
                current_index = selected_segment;
                current = scripts[selected_segment];
                sub_text.text(current["content"]);
                set_text_summary(current["content"]);
                let seek_to = current["start_time"] / total_duration;
                wavesurfer.seekAndCenter(seek_to);
            }

        }
        wavesurfer.play();
    });
    $("#show_text").on("click",function () {
        $(".transcript").toggle();
    })

});