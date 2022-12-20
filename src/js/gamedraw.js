(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsDrawTableBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsDrawTableBehavior').each(function() {



        console.log('heyyo!');
        if ($('#draw-container').length > 0) {
          console.log('hopp' + $("#edit-submit").offset().top);


            $('body').animate({
              scrollTop: $("#edit-submit").offset().top
          }, 1000);  

          
        }

        })
    },
    detach: function(context, settings, trigger) {
      $('.example', context).removeOnce('example-behavior').each(function() {
        // Undo stuff.
      });
    }

  };
}(jQuery, Drupal, drupalSettings));
