// noinspection JSUnresolvedFunction


$("document").ready(function () {

    const read_json = async () => {
        let response = await fetch("./files/summary_sentences.json");
        let data = await response.json();
        scripts = data["details"];
        current = scripts[0];
        console.log("scripts" + scripts);
        console.log("current" + JSON.stringify(current));
        let seek = current["start_time"] / total_duration;
        console.log(seek);
        wavesurfer.seekAndCenter(seek);
        sub_text.text(current["content"]);
    };

    $("#play_pause").attr("disabled",true);
    $("#mute_unmute").attr("disabled",true);
    $("#slider").slider({
        range: "min",
        min: 0,
        max: 1,
        value: 0.5,
        step: 0.01,
        slide: function (event, ui) {
            console.log(ui.value);
            wavesurfer.setVolume(ui.value);
            if (!$("#mute").hasClass("soundOff")) {
                $("#mute").addClass("sound").removeClass("soundOff").find("i").addClass("fa-volume-up").removeClass("fa-volume-mute");
                wavesurfer.setMute(true);
            }
        },

    });

    // noinspection JSUnresolvedVariable
    let total_duration = 0;
    let sub_text = $(".subs");
    let scripts = null;
    let current;
    let current_index = 0;


    let wavesurfer = WaveSurfer.create({
        container: "#waveform", //the container in which the waveform is drawn
        hideScrollbar: true,//hide the scroll bar for the wave
        fillParent: true,
        height: 80,//height for the wave
        progressColor: "#F5F5DC",//color of progress
        cursorColor: "#007066",//cursor color
        waveColor: "#b3b3b3",
        responsive: true,
    });
    wavesurfer.load('files/audio_file.mp3');


    wavesurfer.on("ready", function (e, data) {
        total_duration = wavesurfer.getDuration();
        console.log(total_duration);
        let current_dur = wavesurfer.getCurrentTime();
        console.log(current_dur);
        read_json();
        $("#play_pause").attr("disabled",false);
        $("#mute_unmute").attr("disabled",false);
    });

    wavesurfer.on("seek", function (seek) {
        console.log("seek" + seek);
    });
    wavesurfer.on("audioprocess", function () {
        let progress = wavesurfer.getCurrentTime();
        console.log("Progress" + progress);
        if (progress >= current["end_time"]) {
            current_index = current_index + 1;
            current = scripts[current_index];
            let seek = current["start_time"] / total_duration;
            wavesurfer.seekAndCenter(seek);
            sub_text.text(current["content"]);
        }

    });

    $("#play_pause").on("click", function (e, data) {
        console.log("Play audio");
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
        console.log("Mute audio");
        console.log(data);
        console.log(event);
        let btn = $(this);
        if (btn.hasClass("sound")) {
            btn.addClass("soundOff").removeClass("sound").find("i").addClass("fa-volume-up").removeClass("fa-volume-mute");
            wavesurfer.setMute(true);
        } else {
            btn.addClass("sound").removeClass("soundOff").find("i").addClass("fa-volume-mute").removeClass("fa-volume-up");
            wavesurfer.setMute(false);
        }

    });


    //seekTo(0-1)
    //skip(seconds) - to go back
    //getCurrentTime()
    //getDuration
    //


});