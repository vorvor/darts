<?php

namespace Drupal\darts;

class Firstnines {
    public $throws;

    function __construct($games) {

        foreach ($games as $game) {

            // manually added missing games for statistics.
            // these pseudo games representing the winners of game, but scores are adhoc.
            if ($game->metadata == 'pseudo') {
                continue;
            }

            foreach ($game->legs as $leg) {
                
                    $this->throws[] = ['gameid' => $game->gameid, 'first_throw_id' => $leg->throws[0]->id, 'player' => $leg->throws[0]->player, 'score' => $leg->throws[0]->score + $leg->throws[2]->score + $leg->throws[4]->score];
                    $this->throws[] = ['gameid' => $game->gameid,  'first_throw_id' => $leg->throws[0]->id, 'player' => $leg->throws[1]->player, 'score' => $leg->throws[1]->score + $leg->throws[3]->score + $leg->throws[5]->score];
                
            }
        }

        usort($this->throws, 'darts_cmp_array');

    }

    function getTopFirstnines($i) {
        return array_slice($this->throws, 0, $i);
    }

}



//téli hintón
//rénszarvasok
//öreg mikulás a 
//hintón