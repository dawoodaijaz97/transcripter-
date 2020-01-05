// noinspection JSUnresolvedFunction

let segments = [];
let words = [];
let current_word;
let current_word_index = 0;
let current_segment;
let current_segment_index;
let last_searched_word_index = 0; //last word when searching inside a sentence for subtitles
let audio = document.querySelector('audio');
let speaker_sentences = [];
let current_speaker_sentence = 1;
let total_duration;
let moved_current_segment_index = null;
let all_text;
let no_speakers;



$("document").ready(function () {


    $(".p_btn").attr("disabled",true);
    $(".speaker-cont").hide();
    $(".set_speaker").on("click", function () {
        $(".speaker-cont").toggle();
    });
    $(".set_names").on("click", function () {
        for (let i = 0; i < no_speakers; i++) {
            let speaker_val = $("#speaker_" + i).val();
            $(".spk_" + i).text(speaker_val + ": ");
        }
    });

    $(".copy").on("click", function () {
        console.log(all_text);
        const el = document.createElement('textarea');
        el.value = all_text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    });

    $("#slider").slider({
        range: "min",
        min: 0,
        max: 1,
        value: 0.5,
        step: 0.01,
        slide: function (event, ui) {
        },

    });

    $(".p_btn").find(".fa-pause").hide();
    $(".p_btn").on("click", function () {
        if ($(".p_btn").hasClass("play")) {
            $(".p_btn").addClass("stop").removeClass("play");
            $(".p_btn").find(".fa-play").hide();
            $(".p_btn").find(".fa-pause").show();
            audio.play();
        } else {
            $(".p_btn").addClass("play").removeClass("stop");
            $(".p_btn").find(".fa-play").show();
            $(".p_btn").find(".fa-pause").hide();
            audio.pause();
        }

    });

    const set_subtitle = function (word) {
        let sentence = get_sentence(current_segment);
        console.log("word: " + JSON.stringify(word));
        let index = sentence.indexOf(word["alternatives"][0]["content"], last_searched_word_index);
        last_searched_word_index = index;

        let left = sentence.substring(0, index);
        let right = sentence.substring(index + word["alternatives"][0]["content"].length, sentence.length);


        $(".subs_area .left").text(left);
        $(".subs_area .word").text(word["alternatives"][0]["content"]);
        $(".subs_area .right").text(right);

        let speaker = speaker_sentences[current_speaker_sentence];

        let list_words_left = left.split(" ");
        let list_words_right = right.split(" ");

        $(speaker).find(".left").empty();
        $(speaker).find(".right").empty();
        $(speaker).find(".centre").empty();

        for (let i = 0; i < list_words_left.length; i++) {
            let span_word = $("<span class='my_word'></span>");
            let space_span = $("<span> </span>");
            $(speaker).find(".left").append(span_word);
            $(speaker).find(".left").append(space_span);
            span_word.text(list_words_left[i]);
            span_word.on("click", move);
        }
        for (let i = 0; i < list_words_right.length; i++) {
            let span_word = $("<span class='my_word'></span>");
            let space_span = $("<span> </span>");
            $(speaker).find(".right").append(span_word);
            $(speaker).find(".right").append(space_span);
            span_word.text(list_words_right[i]);
            span_word.on("click", move);
        }
        $(speaker).find(".centre").text(word["alternatives"][0]["content"]);
    };

    const reset_speaker = function () {
        let sentence = get_sentence(current_segment);
        let speaker = speaker_sentences[current_speaker_sentence];
        let list_words = sentence.split(" ");
        $(speaker).find(".left").empty();
        $(speaker).find(".right").empty();
        $(speaker).find(".centre").empty();
        for (let i = 0; i < list_words.length; i++) {
            let span_word = $("<span class='my_word'></span>");
            let space_span = $("<span> </span>");
            $(speaker).find(".left").append(span_word);
            $(speaker).find(".left").append(space_span);
            span_word.text(list_words[i]);
            span_word.on("click", move);
        }
    };


    const get_sentence = function (segment) {


        let this_sentence = "";
        let segment_start_time = parseFloat(segment["start_time"]);
        let segment_end_time = parseFloat(segment["end_time"]);

        for (let i = 0; i < words.length; i++) {
            let this_word = words[i];
            let word_start_time = parseFloat(this_word["start_time"]);
            let word_end_time = parseFloat(this_word["end_time"]);

            if (word_start_time === undefined && word_end_time === undefined) {

            }
            else if (word_start_time >= segment_start_time && word_end_time <= segment_end_time) {
                this_sentence = this_sentence + " " + this_word["alternatives"][0]["content"];
            } else if (word_end_time > segment_end_time) {
                break
            }
        }
        return this_sentence;

    };

    const read_json = async (path) => {
        let response = await fetch(path);
        let data = await response.json();
        all_text = data["results"]["transcripts"][0]["transcript"];
        segments = data["results"]["speaker_labels"]["segments"];
        words = data["results"]["items"];
        no_speakers = data["results"]["speaker_labels"]["speakers"];
        console.log("No of Speakers" + no_speakers);
        current_word = words[0];
        current_word_index = 0;
        current_segment = segments[0];
        current_segment_index = 0;

        for (let i = 0; i < no_speakers; i++) {
            let form_group = $(
                "<div class=\"col-4\">" +
                "    <input type=\"text\" class=\"form-control \">" +
                " </div>");
            form_group.find("input").attr("id", "speaker_" + i);
            form_group.find("input").attr("value", "Speaker " + i);
            $("form .form-row").append(form_group);

        }


        for (let i = 0; i < segments.length; i++) {
            let speaker_label = segments[i]["speaker_label"].substring(4,);
            let sentence = get_sentence(segments[i]);
            let speaker = "Speaker " + speaker_label + ": ";
            let list_words = sentence.split(" ");
            let p = $("<p><span class='spk'></span><span class='left'></span><span class='centre'></span><span class='right'></span></p>");
            $(".full_transcript").append(p);
            for (let i = 0; i < list_words.length; i++) {
                let span_word = $("<span class='my_word'></span>");
                let space_span = $("<span> </span>");
                p.find(".left").append(span_word);
                p.find(".left").append(space_span);
                span_word.text(list_words[i]);
                span_word.on("click", move);
            }
            p.find(".spk").text(speaker);
            p.find(".spk").addClass(segments[i]["speaker_label"]);
            p.attr("start_time", segments[i]["start_time"]);
            p.attr("end_time", segments[i]["end_time"]);
            p.attr("segment_index", i);

        }
        speaker_sentences = $(".full_transcript p");
        set_subtitle(current_word);


    };

    audio.onseeked = function () {

        audio.play();
        // let progress = audio.currentTime;
        // let my_segment2 = 0;
        // while (my_segment2 < segments.length) {
        //
        //     let my_segment_start_time = parseFloat(segments[my_segment2]["start_time"]);
        //     let my_segment_end_time = parseFloat(segments[my_segment2]["end_time"]);
        //
        //     if (progress >= my_segment_start_time && progress <= my_segment_end_time) {
        //         current_segment = segments[my_segment2];
        //         current_segment_index = my_segment2;
        //
        //         break;
        //     }
        //     my_segment2 = my_segment2 + 1;
        //
        // }
    };

    audio.oncanplay = function () {
        read_json($("audio").attr("transcript"));
        total_duration = audio.duration;
        $(".p_btn").attr("disabled",false);
        console.log("Total duraton" + total_duration);
    };

    audio.ontimeupdate = function () {
        console.log("Updating time");
        console.log("Current Segment Index:" + current_segment_index);
        console.log("Current Speaker Sentence:" + current_speaker_sentence);
        console.log("Current Word Index:" + current_word_index);

        let progress = audio.currentTime / total_duration;
        $("#slider").slider('value', progress);
        if (audio.currentTime > parseFloat(current_segment["end_time"])) {
            console.log("Incrementing Segment");
            reset_speaker();
            current_segment_index++;
            current_segment = segments[current_segment_index];
            current_speaker_sentence += 1;
            last_searched_word_index = 0;
        }


        if (audio.currentTime > parseFloat(current_word["end_time"])) {


            current_word_index = current_word_index + 1;
            current_word = words[current_word_index];
            while (1) {
                if (current_word["start_time"] === undefined && current_word["end_time"] === undefined) {
                    current_word_index = current_word_index + 1;
                    current_word = words[current_word_index];
                }
                else {
                    break;
                }
            }

            set_subtitle(current_word);
        }


    };

    const move = function () {
        console.log($(this).text());
        let p_element = $(this).parents("p");
        reset_speaker();
        audio.pause();
        console.log(p_element.attr("segment_index"));
        current_segment_index = parseInt(p_element.attr("segment_index"));
        current_segment = segments[current_segment_index];
        current_speaker_sentence = current_segment_index + 1;
        moved_current_segment_index = current_segment_index;
        last_searched_word_index = 0;
        for (let i = 0; i < words.length; i++) {
            let obs_word = words[i];
            if (obs_word["start_time"] && obs_word["end_time"])
                if (parseFloat(obs_word["start_time"]) >= parseFloat(p_element.attr("start_time")) && obs_word["alternatives"][0]["content"] === $(this).text()) {
                    current_word_index = i;
                    current_word = words[i];
                    console.log(obs_word);
                    audio.currentTime = obs_word["start_time"];
                    last_searched_word_index = 0;
                    set_subtitle(obs_word);
                    break;
                }
        }
        console.log("+-+-+-+-+-+-+-+-+-+-+-++-+-+-+");
        console.log(current_segment_index);
        console.log(current_speaker_sentence);
        console.log(current_word);
        console.log(current_word_index);
        console.log("+-+-+-+-+-+-+-+-+-+-+-++-+-+-+");

    };

    function seekToTime(ts) {
        // try and avoid pauses after seeking
        audio.pause();
        audio.currentTime = ts; // if this is far enough away from current, it implies a "play" call as well...oddly. I mean seriously that is junk.
        // however if it close enough, then we need to call play manually
        // some shenanigans to try and work around this:
        let timer = setInterval(function () {
            if (audio.paused && audio.readyState === 4 || !audio.paused) {
                audio.play();
                clearInterval(timer);
            }
        }, 50);
    }


});