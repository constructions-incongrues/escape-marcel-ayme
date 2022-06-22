(function ($) {
  $(function () {


    $(window).on('click', function () {
      var lab = new Howl({
        src: ['Sounds/laboratory.mp3'],
    });
    lab.play();
      $('.js-smoke_smoke').toggleClass('js-ag-smoke_toggle');
    });


  });
})(jQuery);