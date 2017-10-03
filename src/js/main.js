(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  // smartresize 
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');


// usage:
// $(window).smartresize(function(){
//   // code that takes it easy...
// });


/*------------------------------------*\ 
    Validation
\*------------------------------------*/

// TODO - regex seems to work, check with david its all grooovy
var regexList = {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    letters: /^[a-zA-Z]+$/,
    numbers: /^[0-9]+$/,
    // anything:/^[a-z0-9]+$/i,
    anything: /[^]+$/i,
    postcode: /^((([A-PR-UWYZ])([0-9][0-9A-HJKS-UW]?))|(([A-PR-UWYZ][A-HK-Y])([0-9][0-9ABEHMNPRV-Y]?))\s{0,2}(([0-9])([ABD-HJLNP-UW-Z])([ABD-HJLNP-UW-Z])))|(((GI)(R))\s{0,2}((0)(A)(A)))$/i,
}

 
// function that returns an object with default validation parameters. 
function validationDefaults(options) {
    // set defaults for validation object
    validationAttributes = {
            inputMin: 1,
            inputMax: null,
            type: 'letters',
            message: 'This field is invalid.',
            hint: 'Please fill in this field.',
        }
        // overwrite validationAttributes with passed arguements
    $.extend(validationAttributes, options);
    return validationAttributes;
}


// cycle through element and retrieve its data attirbutes beginning with data-v, return as object
function getValidationAttributes(elem) {
    // grab all data atrtibutes beginning with data-v and put in object
    var newValidationOptions = {}
    $.each(elem.data(), function(dataName, dataVal) {
        // console.log('"' + dataName + '":"' + dataVal + '",');
        if (dataName.substring(0, 1) == 'v') {
            // remove v at start & first char to lower case, eg vInputMax -> InputMax -> inputMax         
            dataName = dataName.substring(1);
            dataName = dataName.charAt(0).toLowerCase() + dataName.substring(1);
            newValidationOptions[dataName] = dataVal;
        }
    });
    return newValidationOptions;
}


function addValidatationMessages(elem) {
    var label = elem.closest('.c-input');
    var hintText = elem.data('v-hint');
    var messageText = elem.data('v-message');

    label.find('.c-input__validation-hint').html(hintText);
    label.find('.c-input__validation-message').html(messageText);
}


function validateInput() {
    // assignIdsToInputs();

    addValidatationMessages($(this));
    // create object to store validation paramaters for inputs
    var inputValidations = validationDefaults(getValidationAttributes($(this)));
    // console.log('inputValidations', inputValidations);

    // Classes added / removed for validation styling
    var label = $(this).closest('.c-input');
    $(this).on('focus', function() {
        label.addClass('is-active').removeClass('is-empty');
    });
    $(this).on('blur', function() {
        var val = $(this).val();
        label.removeClass('is-active');
        if (regexList[inputValidations.type].test(val) == true && val.length <= inputValidations.inputMax && val.length >= inputValidations.inputMin) {
            // is valid             
        } else if (val == '') {
            label.removeClass('is-filled').addClass('is-empty');
        } else {
            // not empty and not valid = invalid
            label.addClass('is-invalid');
        }
    });

    //if letter key pressed
    if (inputValidations.type == "numbers") {
        $(this).on('keypress', function(event) {
            var val = $(this).val();
            // console.log(event.key);
            if (regexList.letters.test(event.key)) {
                event.preventDefault();
                return false;
            }
        });
    }

    $(this).on('keyup input', function() {
        var val = $(this).val();
        // setTimeout(function(){
        if (regexList[inputValidations.type].test(val) == true && val.length <= inputValidations.inputMax && val.length >= inputValidations.inputMin) {
            label.removeClass('is-invalid').addClass('is-valid');
            label.removeClass('is-empty').addClass('is-filled');
        } else if (val == '') {
            label.removeClass('is-valid is-invalid');
        } else {
            // not empty and not valid = invalid
            label.removeClass('is-valid');
            label.removeClass('is-empty').addClass('is-filled');
        }
        // }, inputValidations.delay);        
    });
}


function dropdownInput() {
    addValidatationMessages($(this).find('.c-input__dropdown'));
    
    $(this).find('.c-input__dropdown').on("change", function() {
        var $this = $(this)
        var label = $this.closest('.c-input');
        var val = $this.val();
        var selectedOption = $this.closest('select').find($('option[value=' + val + ']'));
        var selectedOptionText = selectedOption.text();
        // console.log('selectedOptionText', selectedOptionText);

        if (val == "") {
            // console.log('nothing');
        } else {
            label.addClass('is-filled is-valid');
            label.find('.c-input__dropdown-text').text(selectedOptionText);
        }
    });
}

// $(".js-input-validation .c-input__input").each(validateInput2($(this), '.c-input'));

$(".js-input-validation .c-input__input").each(validateInput);

// var textinputs = document.querySelectorAll('.c-input');
// for (i = 0; i< textinputs.length ; i+=1) {
//         validateInput2(textinputs[i], '.c-input')
// }
$(".js-dropdown-input").each(dropdownInput);



/*------------------------------------*\ 
    Menu toggle
\*------------------------------------*/
function toggleMenu(elem) {
    elem.on("click", function() {
        $('html').toggleClass("menu-open");
    });
}

toggleMenu($('.js-toggle-menu'));


/*------------------------------------*\
    Tab system
\*------------------------------------*/
// Desktop Tab System
$(document).on("click", ".js-tab-nav [data-tab]", function() {
    var $this = $(this);
    var targetTab = $this.data("tab");
    var $thisTabContent = $this.closest(".js-tab-wrapper").find(".js-tab-content").find("[data-tab-content=" + targetTab + "]");

    //if click an inactive tab nav item && target tab content exsists
    if (!$this.hasClass("is-active") && $thisTabContent.length) {

        //change active tab button 
        $this.closest('.js-tab-nav').find('.c-tab-system__tab').removeClass('is-active');
        $this.addClass('is-active');

        //change tab content
        $this.closest(".js-tab-wrapper").find("[data-tab-content]").removeClass("is-active");
        $thisTabContent.addClass("is-active");
    }
});

// Mobile Accordion System

// TODO tabs
function showTabOnLoad() {

}

 
/*------------------------------------*\
    Slider
\*------------------------------------*/
function slider(elTar, slideTar) {
    
    slideTar = slideTar || false;
    elTar = elTar || false;

    var target = elTar || $(this);
    var slideCount =  target.find('.c-slider__inner .c-slider__slide').length;
    var transitionEnd = 'transitionend mozTransitionEnd webkitTransitionEnd';

    
    if (slideTar !== 'next' && slideTar !== 'prev') {
        currentSlide = slideTar || 1;           
        // set data attr if none is currently set
        if (typeof slideAttr === 'undefined') {
            target.attr('data-slide', currentSlide);
        } 
    }

    var sliderInner = target.find('.c-slider__inner');  
    
    if (elTar !== false && slideTar !== false) {
        sliderInner = elTar.find('.c-slider__inner');
        slideCount =  elTar.find('.c-slider__inner .c-slider__slide').length;
    }   
    
    sliderInner.find('.c-slider__slide:nth-child(' + target.attr('data-slide') + ')').addClass('is-active');
    
    function heightChange(target) {
        var sliderHeight = sliderInner.find('.is-active').outerHeight();
        sliderInner.height(sliderHeight);
    }
    heightChange();
    
    function moveActiveClass() {
        sliderInner.find('.c-slider__slide').removeClass('is-active');
        sliderInner.find('.c-slider__slide:nth-child(' + target.attr('data-slide') + ')').addClass('is-active');
    }

    function transAmountFunc(){
        var trans = (( target.attr('data-slide') -1 ) * 100) + (( target.attr('data-slide') * 1 ) - 1);
        return trans;
    }
   var translateAmount = transAmountFunc();

    function removeTransformIfFirstSlide() {
        // console.log("func ran");
        if (target.attr('data-slide') == 1) {
            // console.log("target.attr('data-slide') == 1 ")
            sliderInner.css('transform', '');
        }
    }

    
    function nextSlide() {
        var slideAttr = target.attr('data-slide');
        if (target.attr('data-slide') == slideCount) { 
            target.attr('data-slide', 1)
        } else {
            target.attr('data-slide', parseInt(slideAttr)+1)
        }
        var translateAmount = transAmountFunc();
        sliderInner.css('transform', 'translateX(-' + translateAmount + '%)').one(transitionEnd, function () {
             removeTransformIfFirstSlide()
        });
        moveActiveClass();      
        heightChange();
    }
    
    function prevSlide() {
        var slideAttr = target.attr('data-slide');       
        if (target.attr('data-slide') == 1) { 
            target.attr('data-slide', slideCount)
        } else {
            target.attr('data-slide', parseInt(slideAttr)-1)
        }
        var translateAmount = transAmountFunc();
        sliderInner.css('transform', 'translateX(-' + translateAmount + '%)').one(transitionEnd, function () {
             removeTransformIfFirstSlide()
        });
        moveActiveClass();
        heightChange();
    }
    
    if (elTar !== false && slideTar !== false) {
        var slideAttrNew = target.attr('data-slide');
        function goToSlide() {
            if (slideTar == 'next') {
                nextSlide();
            } else if (slideTar == 'prev') {
                prevSlide();
            } else {
                // if goto slide is a number
                var translateAmount = transAmountFunc();
                elTar.find('.c-slider__inner').css('transform', 'translateX(-' + translateAmount + '%)').one(transitionEnd, function () {
                     removeTransformIfFirstSlide();
                });
                moveActiveClass();
                heightChange();
            }   
        }
        goToSlide();
    }
    
    $(this).find('.js-slider-next').on("click", function() {
        nextSlide();
    });

    $(this).find('.js-slider-prev').on("click", function() {
        prevSlide();
    });
    
    $(window).resize(function(){
        heightChange();
    });
    
    
}

$('.c-slider').each(function (){
    slider.call(this);
});



/*------------------------------------*\ 
    Dev helper buttons
    remove / add main css file for testing
\*------------------------------------*/
// if (window.location.href.indexOf('localhost') > -1) {
//     // console.log("s");   
//     $('body').append("<div class='dev-helpers'><button class='js-toggle-bg-image'>bg</button><button class='js-toggle-bg-z-index'>z index</button><button class='js-toggle-bg-filter'>filter</button><button class='js-toggle-center-guide'>guide</button></div>")


//     $(".js-toggle-bg-image").on("click",function(){
//         $('body').toggleClass('hide-bg-image');
//     });
//     $(".js-toggle-bg-z-index").on("click",function(){
//         $('body').toggleClass('bg-z-index');
//     });
//     $(".js-toggle-bg-filter").on("click",function(){
//         $('body').toggleClass('bg-disable-filter');
//     });
//     $(".js-toggle-center-guide").on("click",function(){
//         $('body').toggleClass('bg-enable-guide');
//     });

//     // $(".js-toggle-site-css").on("click",function(){
//     // if ($("link[href*='/css/main.css']").length > 0) {
//     // $("link[href*='/css/main.css']").remove();
//     // } else {
//     // $('head').prepend('<link rel="stylesheet" type="text/css" href="/css/main.css">');
//     //     $('.closeMenu').hide();
//     // }
//     // });
// } 

/*------------------------------------*\
    Modal
\*------------------------------------*/
$('.js-show-modal').on('click', function() {
    var target;

    if ($(this).attr('data-target-modal') !== undefined) {
        target = $('.' + $(this).attr('data-target-modal'));
    } else {
        target = $('.c-generic-modal').first();
    }

    target.show();

    if (target.attr('data-max-width') !== undefined) {
        var extra = 'px';
        if (target.attr('data-max-width') == "none") {
            extra = '';
        }
        target.find('.c-generic-modal__inner').css('max-width', target.attr('data-max-width') + extra);
    }

    $('html').addClass('l-modal-open');
});

$('.js-close-modal').on('click', function() {
    $(this).closest(".c-generic-modal").css('opacity', 0).scrollTop(0).hide().css('opacity', 1);
    $('html').removeClass('l-modal-open');
});

/*------------------------------------*\
    Scroll top
\*------------------------------------*/

$('.js-scroll-to-top').on('click', function(){
    $('html, body').animate({
        scrollTop: 0
 }, 600);
})

/*------------------------------------*\
    Sticky footer height
\*------------------------------------*/
// function setFooterHeight() {
//     //remove inline height
//     $('.c-site-footer').css('height', '');
//     var footerheight = $('.c-site-footer').outerHeight() + 'px';
//     console.log("footerheight", footerheight);
//     $('.l-sticky-footer-wrap').css('margin-bottom', '-' + footerheight);
//     $('.c-site-footer').outerHeight(footerheight);
//     $('.l-sticky-footer-wrap__spacer').outerHeight(footerheight);
// }
// $(document).ready(function() {
//    setFooterHeight();
// });
// $(window).smartresize(function(){
//   setFooterHeight();
// });







