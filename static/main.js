$(document).ready(function () {
	onResize();
	/*var theme;
	if ($.cookie('theme') == '') {
        theme = 'classic';
    } else {
        theme = $.cookie('theme');
    }
	
	$('.b-themes__list a.' + theme).parent().siblings().removeClass('active');
	$('.b-themes__list a.' + theme).parent().addClass('active');*/

	var music = new buzz.sound('static/soundtrack_short_2.mp3');
	music.loop();
	if ($.cookie('music') == 'off') {
        $('.music-btn').removeClass('stop').addClass('play');
		//doGoogle(null, false, ["Cache", "Music cache", "Music: off (cache)"]);
    } else {
        music.play();
		//doGoogle(null, false, ["Cache", "Music cache", "Music: on (cache)"]);
    }
	
	
	$('.music-btn').on('click', function () {
        if ($(this).is('.stop')) {
            $(this).removeClass('stop').addClass('play')
            $.cookie('music', 'off');
            music.pause();
			//doGoogle(null, false, ["Dzen page", "Music click", "Music: off"]);
        } else {
            $(this).removeClass('play').addClass('stop')
            $.cookie('music', 'on');
            music.play();
			//doGoogle(null, false, ["Dzen page", "Music click", "Music: on"]);
        }
	});
	
	$('.language li a').on('click', function(){
		$('.language li.active').removeClass('active');
		$(this).parent().addClass('active');
		$.cookie('lang', $(this).attr('langid'));
		//doGoogle(null, false, ["Dzen page", "Language click", "Language: " + $(this).attr('langid')]);
		$('[langname]').each(function(){
			$(this).text(Lang[$.cookie('lang')][$(this).attr('langname')]);
		})
	});
	
	if ($.cookie('lang') != 'rus') {
        $.cookie('lang', 'bel');
		$('.language li.bel').addClass('active');
		$('.language li.rus').removeClass('active');
		//doGoogle(null, false, ["Cache", "Language cache", "Language: bel (cache)"]);
    } else {
		$('.language li.rus').addClass('active');
		$('.language li.bel').removeClass('active');
		//doGoogle(null, false, ["Cache", "Language cache", "Language: rus (cache)"]);
	}
	
	$('[langname]').each(function(){
		$(this).text(Lang[$.cookie('lang')][$(this).attr('langname')]);
	});
	
	$('.quotes').quotesSlider({
        autoplay: true, /* slider turn on/off */
        switchSpeed: 10000, /* delay between slides switch */
        sliderSpeed: 1000, /* images fade speed */
        startDelay: 10000 /* delay before slider starts */
    });
	
	//$('.b-themes__current').on('click', function () {
	//	if (!themesFlag) {
	//		$('.b-themes__list').animate({
	//			'opacity': 1,
	//			'top': 100
	//		}, 200);
	//		$(this).addClass('opened');
     //       themesFlag = true;
	//		doGoogle(null, false, ["Dzen page", "Themes popup", "Theme popup show"]);
	//		return false;
	//	}
	//});
	//
	//var themesFlag = false;
	
    //$(document).on('click', function (e) {
    //    if (themesFlag) {
    //        if (!$('.b-themes__list .theme').is(e.target) && $('.b-themes__list .theme').has(e.target).length === 0) {
    //            $('.b-themes__list').animate({
		//			'opacity': 0,
		//			'top': 40
		//		}, 200);
		//		$('.b-themes__current').removeClass('opened');
    //            themesFlag = false;
		//		doGoogle(null, false, ["Dzen page", "Themes popup", "Theme popup hide"]);
    //            return false;
    //        }
    //    }
    //});
	
    //$('.b-themes__list').on('click', 'a', function () {
		//if (!$(this).parent().hasClass('active')) {
		//	var prevTheme = $(this).parents('ul').find('.active a').attr('href');
		//	prevTheme = prevTheme.substring(1);
		//	$(this).parent().siblings().removeClass('active');
		//	$(this).parent().addClass('active');
		//	var href = $(this).attr('href');
		//	href = href.substring(1);
		//	$.cookie('theme', href);
		//
		//	var path = '/resources/themes/belzen_' + href;
		//	$('body video').fadeOut(300);
		//	setTimeout(function () {
		//		$('body').vide(path);
		//	}, 400);
		//
		//	music.stop();
		//	music = new buzz.sound(path, {
		//		formats: ["mp3"]
		//	});
		//	music.loop();
		//	if ($.cookie('music') != 'off') {
		//		music.play();
		//	}
		//
		//	$('.b-themes__list').animate({
		//		'opacity': 0,
		//		'top': 40
		//	}, 200);
		//	$('.b-themes__current').removeClass('opened').removeClass(prevTheme).addClass(href);
		//	themesFlag = false;
		//	doGoogle(null, false, ["Dzen page", "Themes popup", "Theme: " + href]);
		//	return false;
		//}
    //});
});

$(window).on('resize', onResize);

function onResize() {
	var gap = 100;
	if ($(window).width() <= 480) 
		gap = 70;
	$('.b-page__zen').css({
		'height': ($(window).height() - gap * 2) + 'px',
		'font-size': (($(window).height() - gap * 2) / 800) + 'em'
	});
	//doGoogle(null, false, ["Dzen page", "Resize", ""]);
}

(function($) {
    $.fn.quotesSlider = function(options) {
        options = $.extend({
            autoplay: false,
            switchSpeed: 5000,
            sliderSpeed: 600,
            startDelay: 3000,

            quotes: $(this).selector,
            autoplayTimer: null,
            qty: 0
        }, options);

        var Global = {
            init: function() {
                if (options.autoplay) {
                    Global.autoplay();
                }
                options.qty = $(options.quotes + ' li').length;
            },
            makeStep: function(item) {
                var index = item.index() + 1;
                $(options.quotes + ' li' + '.active').fadeOut(options.sliderSpeed).removeClass('active');
                $(options.quotes + ' li' + ':nth-child(' + index + ')').fadeIn(options.sliderSpeed).addClass('active');
            },
            autoplay: function() {
                function autoPlayFunc() {
                    var random = Global.getRandomInt(1, options.qty);
                    Global.makeStep($(options.quotes + ' li' + ':nth-child(' + random + ')'));
                    options.autoplayTimer = setTimeout(autoPlayFunc, options.switchSpeed);
                }
                options.autoplayTimer = setTimeout(autoPlayFunc, options.startDelay);
            },
            getRandomInt: function(min, max){
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
        };

        Global.init();
    };
})(jQuery);