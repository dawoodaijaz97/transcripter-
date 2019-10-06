// noinspection JSUnresolvedFunction


$("document").ready(function () {

    const getSentence = function (segment) {
        let sentence = "";
        let segment_start_time = parseFloat(segment["start_time"]);
        let segment_end_time = parseFloat(segment["end_time"]);
        let i = last_word_index;
        while (1) {
            if (words[i]["end_time"] !== undefined && words[i]["start_time"] !== undefined) {
                if (segment_end_time < parseFloat(words[i]["end_time"])) {
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
            i++;

        }
    };

    const set_word = function (word) {
        let my_sentence = sentence;
        let index = my_sentence.search(word);
        let left = my_sentence.substring(0,index);
        let right = my_sentence.substring(index+word.length,my_sentence.length);
        left_area.text(left);
        centre_area.text(word);
        right_area.text(right)

    };

    const read_json = async () => {
        let response = await fetch("./files/full_transcript.json");
        let data = await response.json();
        segments = data["results"]["speaker_labels"]["segments"];
        words = data["results"]["items"];
        current_word = words[0];
        next_word = words[1];
        current_word_index = 0;
        current_segment = segments[0];
        next_segment = segments[1];
        current_segment_index = 0;
        sentence = getSentence(current_segment);
        set_word(current_word["alternatives"][0]["content"]);

    };

    $("#play_pause").attr("disabled", true);
    $("#mute_unmute").attr("disabled", true);
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
    let left_area = $(".left");
    let centre_area = $(".word");
    let right_area = $(".right");
    let segments;
    let words;
    let current_word;
    let next_word;
    let current_word_index = 0;
    let current_segment;
    let next_segment;
    let current_segment_index = 0;
    let last_word_index = 0;
    let sentence;


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
        interact: false
    });
    wavesurfer.load('https://storage.googleapis.com/music-app-bucket-3/audio_file.mp3');


    wavesurfer.on("ready", function () {
        total_duration = wavesurfer.getDuration();

        let current_dur = wavesurfer.getCurrentTime();

        read_json();
        $("#play_pause").attr("disabled", false);
        $("#mute_unmute").attr("disabled", false);
    });

    wavesurfer.on("seek", function (seek) {
        console.log("seek" + seek);
    });
    wavesurfer.on("audioprocess", function () {
        let progress = wavesurfer.getCurrentTime();
        progress = parseFloat(progress);

        if (progress >= parseFloat(next_segment["start_time"])) {
            current_segment_index = current_segment_index + 1;
            current_segment = segments[current_segment_index];
            next_segment = segments[current_segment_index + 1];
            sentence = getSentence(current_segment);

        }
        if(next_word["start_time"] === undefined){
            current_word_index +=1;
            current_word = words[current_word_index];
            next_word = words[current_word_index+1]
        }
        else if(progress>=parseFloat(next_word["start_time"])) {
            current_word_index +=1;
            current_word = words[current_word_index];
            next_word = words[current_word_index+1];
            set_word(current_word["alternatives"][0]["content"])
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

});