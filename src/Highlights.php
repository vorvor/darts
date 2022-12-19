<?php

namespace Drupal\darts;

class Highlights {
    public $throws;
    public $checkouts;

    function __construct($games) {

        foreach ($games as $game) {

            // manually added missing games for statistics.
            // these pseudo games representing the winners of game, but scores are adhoc.
            if ($game->metadata == 'pseudo') {
                continue;
            }

            foreach ($game->legs as $leg) {
                foreach ($leg->throws as $throw) {
                    $throw->gameid = $game->gameid;
                    $this->throws[] = $throw;
                }

                $last_throw = $leg->throws[count($leg->throws) - 1];
                $this->checkouts[] = $last_throw;
            }
        }

        usort($this->throws, 'darts_cmp');
        usort($this->checkouts, 'darts_cmp');

    }

    function getTopHighlights($i) {
        return array_slice($this->throws, 0, $i);
    }

    function getTopCheckouts($i) {
        return array_slice($this->checkouts, 0, $i);
    }

}



//téli hintón
//rénszarvasok
//öreg mikulás a 
//hintón