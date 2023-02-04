(function ($, Drupal, cookies) {
  Drupal.behaviors.dartsDrawTableBehavior = {

    attach: function(context, settings) {

      $(window).once('dartsDrawTableBehavior').each(function() {



       

        })
    },
    detach: function(context, settings, trigger) {
      $('.example', context).removeOnce('example-behavior').each(function() {
        // Undo stuff.
      });
    }

  };
}(jQuery, Drupal, drupalSettings));
